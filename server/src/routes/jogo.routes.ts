import { Router } from "express";
import * as jogoController from "../controllers/jogo.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticate, jogoController.getJogos);

export default router;

