import express from "express";
import {
    listSpecialties,   
    getSpecialtyById,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty
} from "../controllers/SpecialtyController.js";
import {verifyToken, requireRole} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", listSpecialties);
router.get("/:id", getSpecialtyById);

router.post("/", verifyToken, requireRole(["admin"]), createSpecialty);
router.put("/:id", verifyToken, requireRole(["admin"]), updateSpecialty);
router.delete("/:id", verifyToken, requireRole(["admin"]), deleteSpecialty);

export default router;
