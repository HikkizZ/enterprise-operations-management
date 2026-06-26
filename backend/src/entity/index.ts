import { User } from './user.entity.js';
import { Employee } from './rrhh/employee.entity.js';
import { EmployeeProfile } from './rrhh/employeeProfile.entity.js';
import { EmploymentHistory } from './rrhh/employmentHistory.entity.js';
import { Leave } from './rrhh/leave.entity.js';

export const ENTITIES = [User, Employee, EmployeeProfile, EmploymentHistory, Leave] as const;
