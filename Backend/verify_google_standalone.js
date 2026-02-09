/**
 * Standalone Google API Verifier
 * Usage: node verify_google_standalone.js
 */
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const CX = process.env.GOOGLE_SEARCH_ENGINE_ID;

console.log("---------------------------------------------------");
console.log("🔍 Google Custom Search JSON API Verifier");
console.log("---------------------------------------------------");
console.log(`API Key: ${API_KEY ? "Loaded (" + API_KEY.substring(0, 5) + "...)" : "MISSING"}`);
console.log(`CX ID:   ${CX ? "Loaded (" + CX.substring(0, 5) + "...)" : "MISSING"}`);
console.log("---------------------------------------------------");

if (!API_KEY || !CX) {
    console.error("❌ Error: Missing credentials in .env file");
    process.exit(1);
}

const testQuery = "Dental";
const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${testQuery}`;

console.log(`Testing URL: ${url.replace(API_KEY, "HIDDEN_KEY")}`);

async function testApi() {
    try {
        const response = await axios.get(url);
        console.log("✅ Success! HTTP 200");
        console.log(`Results found: ${response.data.items?.length || 0}`);
        if (response.data.items?.length > 0) {
            console.log(`First result: ${response.data.items[0].title}`);
        }
    } catch (error) {
        console.error("❌ API Call Failed!");
        if (error.response) {
            console.error(`Status: ${error.response.status} ${error.response.statusText}`);
            console.error("Error Details:", JSON.stringify(error.response.data, null, 2));

            // Heuristic Advice
            const errMsg = error.response.data?.error?.message || "";
            if (errMsg.includes("project does not have the access to Custom Search JSON API")) {
                console.log("\n💡 TIP: You enabled the wrong API or wrong project.");
                console.log("   Search for 'Custom Search JSON API' (specifically 'JSON') in Google Cloud Console.");
            }
        } else {
            console.error(error.message);
        }
    }
}

testApi();
