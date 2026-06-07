import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import * as jogoController from "../controllers/jogo.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Middleware para garantir que apenas admins acessam estas rotas
router.use(authenticate, authorize(["ADMIN"]));

router.get("/usuarios", adminController.getUsuarios);
router.put("/usuarios/:id/status", adminController.updateUsuarioStatus);
router.delete("/usuarios/:id", adminController.deleteUsuario);
router.get("/dashboard", adminController.getDashboardMetrics);
router.get("/pagamentos", adminController.getPagamentos);
router.put("/pagamentos/:id/aprovar", adminController.approvePagamento);
router.get("/premios", adminController.getPremios);
router.post("/premios", adminController.savePremio);
router.get("/config", adminController.getConfig);
router.put("/config", adminController.updateConfig);
router.put("/jogos/:id/placar", jogoController.updatePlacar);
router.get("/audit-log", adminController.getAuditLogs);

export default router;

