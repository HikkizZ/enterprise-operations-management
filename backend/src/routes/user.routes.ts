import { Router } from 'express';
import { getUsersController, updateUserController, createUserController } from '../controllers/user.controller.js';
import { authenticateJWT } from '../middlewares/authentication.middleware.js';
import { verifyRole } from '../middlewares/authorization.middleware.js';
import { userRoles } from '../types/user.types.js';

const router = Router();

router.get('/', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS]), getUsersController);
router.post('/', authenticateJWT, verifyRole([userRoles.SUPER_ADMINISTRADOR]), createUserController);
router.put('/update', authenticateJWT, updateUserController);

export default router;