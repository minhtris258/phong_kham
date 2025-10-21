import express from "express";
import { getSpecialty, createSpecialty } from "../controllers/SpecialtiesController.js";

const router = express.Router();

router.get("/", getSpecialties);
router.post("/", createSpecialty);
router.put("/:id", updateSpecialty);
router.delete("/:id", deleteSpecialty);

export default router;
