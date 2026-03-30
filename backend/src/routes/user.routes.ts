import { Router } from 'express';
import { getUsersController, updateUserController } from '../controllers/user.controller.js';
import { authenticateJWT } from '../middlewares/authentication.middleware.js';
import { verifyRole } from '../middlewares/authorization.middleware.js';

const router = Router();

router.get('/', authenticateJWT, verifyRole(['SuperAdministrador', 'Administrador', 'RecursosHumanos']), getUsersController);
router.put('/update', authenticateJWT, updateUserController);

export default router;