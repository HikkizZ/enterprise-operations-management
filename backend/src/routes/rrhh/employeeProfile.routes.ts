import { Router } from 'express';
import {
    getProfileByEmployeeIdController, 
    updateProfileController,
    uploadContractController,
    deleteContractController
} from '../../controllers/rrhh/employeeProfile.controller.js';
import { authenticateJWT } from '../../middlewares/authentication.middleware.js';
import { verifyRole } from '../../middlewares/authorization.middleware.js';
import { userRoles } from '../../types/user.types.js';
import { uploadPdf } from '../../services/file.service.js';

const router = Router();

router.get('/:id/profile', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS, userRoles.GERENCIA]), getProfileByEmployeeIdController);
router.patch('/:id/profile', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS]), updateProfileController);
router.post('/:id/profile/contract', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS]), uploadPdf('contracts'), uploadContractController);
router.delete('/:id/profile/contract', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS]), deleteContractController);

export default router;