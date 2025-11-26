import Partner from "../models/PartnerModel.js";
import {v2 as cloudinary} from "cloudinary";

// GET /api/partners
export const listPartners = async (req, res, next) => {
    try {
        const partners = await Partner.find().sort({ createdAt: -1 });
        res.json(partners);
    } catch (e) {
        next(e);
    }
};
// POST /api/partners
export const createPartner = async (req, res, next) => {
    try {
        const { name, thumbnail } = req.body;

        let thumbnailUrl = "";
        if (thumbnail) {
            const uploadResponse = await cloudinary.uploader.upload(thumbnail, {
                folder: "partners",
            });
            thumbnailUrl = uploadResponse.secure_url;
        }
        const newPartner = new Partner({
            name,
            thumbnail: thumbnailUrl,
        });
        const savedPartner = await newPartner.save();
        res.status(201).json(savedPartner);
    } catch (e) {
        next(e);
    }
};
// PUT /api/partners/:id
export const updatePartner = async (req, res, next) => {
    try {
        const partnerId = req.params.id;
        const { name, thumbnail } = req.body;
        const partner = await Partner.findById(partnerId);
        if (!partner) {
            return res.status(404).json({ message: "Partner not found" });
        }
        partner.name = name || partner.name;

        if (thumbnail) {
            const uploadResponse = await cloudinary.uploader.upload(thumbnail, {
                folder: "partners",
            });
            partner.thumbnail = uploadResponse.secure_url;
        }
        const updatedPartner = await partner.save();
        res.json(updatedPartner);
    } catch (e) {
        next(e);
    }   
};
// DELETE /api/partners/:id
export const deletePartner = async (req, res, next) => {
    try {
        const partnerId = req.params.id;
        const deleted = await Partner.findByIdAndDelete(partnerId); 
        if (!deleted) {
            return res.status(404).json({ message: "Partner not found" });
        }
        res.json({ message: "Partner deleted successfully" });
    } catch (e) {
        next(e);
    }
};