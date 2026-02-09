import Illustration from "../models/Illustration.js";
import path from "path";
import fs from "fs";

// Create/Upload Illustration
export const createIllustration = async (req, res) => {
    try {
        const { type, title, embedUrl } = req.body;
        const file = req.file;

        let source = "";
        let originalUrl = "";

        if (type === "EMBED") {
            if (!embedUrl) {
                return res.status(400).json({ success: false, message: "Embed URL is required for EMBED type." });
            }
            originalUrl = embedUrl;

            // Basic Embed Logic (expandable)
            let embedSrc = embedUrl;
            if (embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be")) {
                const videoId = embedUrl.split("v=")[1]?.split("&")[0] || embedUrl.split("/").pop();
                embedSrc = `https://www.youtube.com/embed/${videoId}`;
            }
            // Add other social media logic here if needed

            source = embedSrc;
        } else {
            if (!file) {
                return res.status(400).json({ success: false, message: "File is required for IMAGE or VIDEO type." });
            }
            // Store relative path
            source = `uploads/illustrations/${file.filename}`;
        }

        const newIllustration = new Illustration({
            type,
            title,
            source,
            originalUrl,
            createdBy: req.user.userId
        });

        await newIllustration.save();

        res.status(201).json({
            success: true,
            data: newIllustration,
            message: "Illustration added successfully."
        });

    } catch (error) {
        console.error("Create Illustration Error:", error);
        res.status(500).json({ success: false, message: "Failed to create illustration." });
    }
};

// Get Illustrations
export const getIllustrations = async (req, res) => {
    try {
        const { type } = req.query;
        let query = { isActive: true };

        if (type && type !== "ALL") {
            query.type = type;
        }

        const illustrations = await Illustration.find(query)
            .sort({ createdAt: -1 })
            .populate("createdBy", "fullName");

        res.status(200).json({
            success: true,
            count: illustrations.length,
            data: illustrations
        });

    } catch (error) {
        console.error("Get Illustrations Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch illustrations." });
    }
};

// Delete Illustration (Soft Delete)
export const deleteIllustration = async (req, res) => {
    try {
        const { id } = req.params;

        const illustration = await Illustration.findById(id);
        if (!illustration) {
            return res.status(404).json({ success: false, message: "Illustration not found." });
        }

        illustration.isActive = false;
        await illustration.save();

        res.status(200).json({
            success: true,
            message: "Illustration deleted successfully."
        });
    } catch (error) {
        console.error("Delete Illustration Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete illustration." });
    }
};
