/**
 * Search Controller
 * Handles search requests using Google Custom Search API.
 */
import axios from "axios";

export const search = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

        if (!apiKey || !cx) {
            console.warn("⚠️ Google Search API credentials missing. Returning mock data.");
            // Fallback to mock data if keys are missing (for development/demo)
            return res.status(200).json({
                status: "success",
                results: getMockResults(query)
            });
        }

        console.log(`🔍 Google Search for: ${query}`);
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}`;

        const response = await axios.get(url);

        // Map Google API Items to our frontend format
        const results = (response.data.items || []).map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet
        }));

        res.status(200).json({
            status: "success",
            results: results
        });

    } catch (error) {
        console.error("❌ Search API Error:", error.message);
        if (error.response) {
            console.error("   Google API Response:", error.response.data);
        }
        res.status(500).json({ message: "Search service failed", error: error.message });
    }
};

// Helper for fallback mock data
const getMockResults = (query) => {
    return [
        {
            title: `[MOCK] Treatment options for ${query}`,
            link: "https://www.webmd.com/oral-health/default.htm",
            snippet: `(Mock Data - API Keys Missing) Comprehensive guide on ${query}. Learn about procedure, recovery time, and costs.`
        },
        {
            title: "[MOCK] Symptoms and Causes - Mayo Clinic",
            link: "https://www.mayoclinic.org/diseases-conditions",
            snippet: `Overview of ${query} symptoms. If you experience sharp pain or swelling, consult your dentist immediately.`
        },
        {
            title: "[MOCK] Dental Health: What you need to know",
            link: "https://www.healthline.com/health/dental-and-oral-health",
            snippet: `Detailed article discussing the long-term effects of ${query} and how to maintain oral hygiene.`
        }
    ];
};
