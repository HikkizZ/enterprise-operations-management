import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
/* Importar rutas de RRHH */
import employeeRoutes from './rrhh/employee.routes.js';
import employeeProfileRoutes from './rrhh/employeeProfile.routes.js';
import employmentHistoryRoutes from './rrhh/employmentHistory.routes.js';
import leaveRoutes from './rrhh/leave.routes.js';

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
router.use('/employees', employeeRoutes);
router.use('/employees', employeeProfileRoutes);
router.use('/employees', employmentHistoryRoutes);
router.use('/leaves', leaveRoutes);

export default router;