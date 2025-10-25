import { Router } from "express";
import { listOrGenerateSlots } from "../controllers/TimeslotController.js";

const router = Router({ mergeParams: true });

router.get("/:doctorId/slots/:date", listOrGenerateSlots);

export default router;
