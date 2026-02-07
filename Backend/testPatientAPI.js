import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import ClinicAdmin from "./models/ClinicAdmin.js";
import Patient from "./models/Patient.js";
import Role from "./models/Role.js";
import connectDB from "./config/db.js";

dotenv.config();

const API_URL = "http://localhost:3125/api";
const TEST_USER = {
    loginId: "test_admin_" + Date.now(),
    password: "password123",
    role: "CLINIC_ADMIN",
    fullName: "Test Admin"
};

const runTest = async () => {
    console.log("🚀 Starting Patient Module Verification...");

    try {
        // 1. Connect DB
        await connectDB();

        // 2. Create Test Admin
        const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
        const admin = await ClinicAdmin.create({
            ...TEST_USER,
            password: hashedPassword,
            isActive: true
        });
        console.log("✅ Test Admin created:", admin.loginId);

        // 3. Login via API
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

        if (!loginData.success) {
            throw new Error(`Login failed: ${loginData.message}`);
        }

        const token = loginData.accessToken;
        console.log("✅ Login successful. Token received.");

        // 4. Create Patient
        const patientPayload = {
            fullName: "Test Patient",
            phone: "9999999999",
            age: 30,
            gender: "Male",
            address: "123 Test St",
            occupation: "Tester"
        };

        const createRes = await fetch(`${API_URL}/patients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(patientPayload)
        });
        const createData = await createRes.json();

        if (!createData.success) {
            throw new Error(`Create patient failed: ${createData.message}`);
        }

        const patientId = createData.data._id;
        console.log("✅ Patient created:", createData.data.patientId);

        // 5. List Patients
        const listRes = await fetch(`${API_URL}/patients?search=Test`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const listData = await listRes.json();

        if (!listData.success || listData.data.length === 0) {
            throw new Error("List patients failed or empty");
        }
        console.log("✅ Listed patients:", listData.data.length);

        // 6. Get Patient Details
        const getRes = await fetch(`${API_URL}/patients/${patientId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const getData = await getRes.json();

        if (!getData.success || getData.data.fullName !== "Test Patient") {
            throw new Error("Get patient details failed");
        }
        console.log("✅ Retrieved patient details");

        // 7. Update Patient
        const updateRes = await fetch(`${API_URL}/patients/${patientId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                ...patientPayload,
                fullName: "Updated Patient Name"
            })
        });
        const updateData = await updateRes.json();

        if (!updateData.success || updateData.data.fullName !== "Updated Patient Name") {
            throw new Error("Update patient failed");
        }
        console.log("✅ Updated patient successfully");

        // 8. Deactivate Patient
        const deactivateRes = await fetch(`${API_URL}/patients/${patientId}/deactivate`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const deactivateData = await deactivateRes.json();

        if (!deactivateData.success) {
            throw new Error("Deactivate patient failed");
        }
        console.log("✅ Deactivated patient successfully");

        // Cleanup
        await ClinicAdmin.findByIdAndDelete(admin._id);
        await Patient.findByIdAndDelete(patientId);
        console.log("🧹 Cleanup complete");

        console.log("🎉 ALL TESTS PASSED!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Test Failed:", error.message);
        if (error.cause) console.error(error.cause);
        process.exit(1);
    }
};

runTest();
