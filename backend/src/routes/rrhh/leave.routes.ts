import { Router } from 'express';
import {
    createLeaveController,
    getLeavesByEmployeeIdController,
    getLeaveByIdController,
    reviewLeaveController,
    cancelLeaveController
} from '../../controllers/rrhh/leave.controller.js';
import { authenticateJWT } from '../../middlewares/authentication.middleware.js';
import { verifyRole, verifySelfOrRole } from '../../middlewares/authorization.middleware.js';
import { uploadPdf } from '../../services/file.service.js';
import { userRoles } from '../../types/user.types.js';

const router = Router();

router.post('/:id', authenticateJWT, verifySelfOrRole([userRoles.RECURSOS_HUMANOS]), uploadPdf('leaves'), createLeaveController);
router.get('/employee/:id', authenticateJWT, verifySelfOrRole([userRoles.RECURSOS_HUMANOS, userRoles.GERENCIA]), getLeavesByEmployeeIdController);
router.get('/:leaveId', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS, userRoles.GERENCIA]), getLeaveByIdController);
router.patch('/:leaveId/review', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS, userRoles.GERENCIA]), reviewLeaveController);
router.patch('/:leaveId/cancel', authenticateJWT, verifySelfOrRole([userRoles.RECURSOS_HUMANOS]), cancelLeaveController);

export default router;