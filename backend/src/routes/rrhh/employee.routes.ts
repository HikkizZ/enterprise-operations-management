import { Router } from "express";
import {
    getEmployeesController,
    getEmployeeByIdController,
    createEmployeeController,
    updateEmployeeController,
    terminateEmployeeController,
    reactivateEmployeeController
} from "../../controllers/rrhh/employee.controller.js";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import { userRoles } from "../../types/user.types.js";

const router = Router();

router.get('/', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS, userRoles.GERENCIA]), getEmployeesController);
router.get('/:id', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS, userRoles.GERENCIA]), getEmployeeByIdController);
router.post('/', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS]), createEmployeeController);
router.patch('/:id', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS]), updateEmployeeController);
router.delete('/:id', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS]), terminateEmployeeController);
router.post('/:id/reactivate', authenticateJWT, verifyRole([userRoles.RECURSOS_HUMANOS]), reactivateEmployeeController);

export default router;