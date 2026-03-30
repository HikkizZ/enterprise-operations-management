import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';

const router: Router = Router()

/* Test route */
router.get("/", (_req, res) => {
  res.status(200).json({
    msg: "API Working",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;