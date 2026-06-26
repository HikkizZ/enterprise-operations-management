import { Router } from 'express';
import { getDashboardController } from '../controllers/dashboard.controller.js';
import { authenticateJWT } from '../middlewares/authentication.middleware.js';
import { verifyRole } from '../middlewares/authorization.middleware.js';
import { userRoles } from '../types/user.types.js';

const router = Router();

router.get('/', authenticateJWT, verifyRole([
  userRoles.USUARIO,
  userRoles.RECURSOS_HUMANOS,
  userRoles.GERENCIA,
  userRoles.VENTAS,
  userRoles.ARRIENDO,
  userRoles.FINANZAS,
  userRoles.MECANICO,
  userRoles.MANTENCIONES_MAQUINARIA,
]), getDashboardController);

export default router;