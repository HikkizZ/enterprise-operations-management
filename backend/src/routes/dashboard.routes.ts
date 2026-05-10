import { Router } from 'express';
import { getDashboardController } from '../controllers/dashboard.controller.js';
import { authenticateJWT } from '../middlewares/authentication.middleware.js';

const router = Router();

router.get('/', authenticateJWT, getDashboardController);

export default router;