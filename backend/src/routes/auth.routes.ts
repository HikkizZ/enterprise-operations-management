import { Router } from 'express';
import { loginController, logoutController } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middlewares/authentication.middleware.js';

const router = Router();

router.post('/login', loginController);
router.post('/logout', authenticateJWT, logoutController);

export default router;