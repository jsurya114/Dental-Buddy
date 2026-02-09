import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import ClinicAdmin from "./models/ClinicAdmin.js";
import connectDB from "./config/db.js";

dotenv.config();

const API_URL = "http://localhost:3125/api";
const TEST_USER = {
    loginId: "verify_google_" + Date.now(),
    password: "password123",
    role: "CLINIC_ADMIN",
    fullName: "Google Verifier"
};

const runTest = async () => {
    console.log("🚀 Verifying Google Search API Integration...");
    let adminId = null;

    try {
        await connectDB();

        // 1. Create Test User
        const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
        const admin = await ClinicAdmin.create({
            ...TEST_USER,
            password: hashedPassword,
            isActive: true
        });
        adminId = admin._id;

        // 2. Login
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                loginId: TEST_USER.loginId,
                password: TEST_USER.password,
                roleCode: "CLINIC_ADMIN"
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.accessToken;

        // 3. Perform Search
        const searchQuery = "Dental Implants";
        console.log(`🔍 Searching for: '${searchQuery}'...`);

        const searchRes = await fetch(`${API_URL}/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ query: searchQuery })
        });

        const searchData = await searchRes.json();

        if (searchData.status !== "success") {
            throw new Error(`API Error: ${JSON.stringify(searchData)}`);
        }

        const results = searchData.results;
        if (!results || results.length === 0) {
            console.log("⚠️ No results returned. Check your API Key and Search Engine ID.");
        } else {
            const firstResult = results[0];
            console.log(`✅ Received ${results.length} results.`);
            console.log(`   First result: "${firstResult.title}"`);

            // Check for [MOCK] tag
            const isMock = results.some(r => r.title.includes("[MOCK]") || r.snippet.includes("(Mock Data"));

            if (isMock) {
                console.log("⚠️ WARNING: API is still returning MOCK DATA.");
                console.log("   Possible reasons:");
                console.log("   1. Backend server hasn't restarted to pick up .env changes.");
                console.log("   2. API Key or Search Engine ID is invalid/empty in .env.");
            } else {
                console.log("🎉 SUCCESS: Real Google Search results received!");
            }
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error.message);
    } finally {
        if (adminId) await ClinicAdmin.findByIdAndDelete(adminId);
        await mongoose.disconnect();
    }
};

runTest();
