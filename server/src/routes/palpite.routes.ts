import { Router } from "express";
import * as palpiteController from "../controllers/palpite.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticate, palpiteController.savePalpite);
router.get("/me", authenticate, palpiteController.getUserPalpites);
router.get("/ranking", authenticate, palpiteController.getRanking);

export default router;

