import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";
import {
    createPartner,
    listPartners,
    updatePartner,
    deletePartner
} from "../controllers/PartnerController.js";

const router = Router();

router.get("/", listPartners);
router.post("/", verifyToken, requireRole(["admin"]), createPartner);
router.put("/:id", verifyToken, requireRole(["admin"]), updatePartner);
router.delete("/:id", verifyToken, requireRole(["admin"]), deletePartner);

export default router;