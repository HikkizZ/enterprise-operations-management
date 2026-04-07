import { Router } from 'express';
import { getHistoryByEmployeeIdController, getHistoryByIdController } from '../../controllers/rrhh/employmentHistory.controller.js';
import { authenticateJWT } from '../../middlewares/authentication.middleware.js';
import { verifyRole } from '../../middlewares/authorization.middleware.js';
import { userRoles } from '../../types/user.types.js';

const router = Router();

router.get('/history/:historyId', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS, userRoles.GERENCIA]), getHistoryByIdController);
router.get('/:id/history', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS, userRoles.GERENCIA]), getHistoryByEmployeeIdController);

export default router;