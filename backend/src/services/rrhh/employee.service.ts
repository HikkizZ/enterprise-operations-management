import { AppDataSource } from "../../config/configDB.js";
import { Employee } from "../../entity/rrhh/employee.entity.js";
import { EmployeeProfile } from "../../entity/rrhh/employeeProfile.entity.js";
import { EmploymentHistory } from "../../entity/rrhh/employmentHistory.entity.js";
import { User } from "../../entity/user.entity.js";
import { IsNull, Not } from "typeorm";
import { isValidRut, cleanRut } from 'rut-kit';
import { encryptPassword } from "../../utils/encrypt.js";
import { generateCorporateEmail, generateSecurePassword } from "../../helpers/corporateEmail.helper.js";
import { sendEmail } from "../email.service.js";
import { credentialsTemplate } from "../../templates/email/credentials.template.js";
import { estadoLaboral } from "../../types/rrhh/employeeProfile.types.js";
import { eventType } from "../../types/rrhh/employmentHistory.types.js";
import type { ServiceResponse } from "../../types/common.types.js";
import type {
    CreateEmployeeInput,
    EmployeeQueryParams,
    ReactivateEmployeeInput,
    UpdateEmployeeInput
} from "../../types/rrhh/employee.types.js";

function buildFullName(employee: Employee): string {
    return [employee.names, employee.paternalSurname, employee.maternalSurname].filter(Boolean).join(' ');
}

/* Crear un nuevo empleado */
export async function createEmployee(
    input: CreateEmployeeInput,
    registeredBy?: User
): Promise<ServiceResponse<{ employee: Employee; corporateEmail: string; tempPassword: string; emailSent: boolean }>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        if (!isValidRut(input.rut)) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'RUT inválido', code: 'BAD_REQUEST' } };
        }

        /* Crear empleado */
        const employeeRepo = queryRunner.manager.getRepository(Employee);

        const existingRut = await employeeRepo.findOne({ where: { rut: input.rut }, withDeleted: true });
        
        if (existingRut) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();

            if (existingRut.deletedAt) {
                return { ok: false, error: { message: 'Existe un empleado desvinculado con este RUT.', code: 'CONFLICT', meta: { employeeId: existingRut.id, canReactivate: true } } };
            }
            return { ok: false, error: { message: 'Ya existe un empleado con este RUT', code: 'CONFLICT' } };
        }

        const existingEmail = await employeeRepo.findOne({ where: { email: input.email.toLowerCase() }, withDeleted: true });

        if (existingEmail) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Ya existe un empleado con este correo electrónico', code: 'CONFLICT' } };
        }

        const employee = employeeRepo.create({
            rut: input.rut,
            names: input.names.trim(),
            paternalSurname: input.paternalSurname.trim(),
            maternalSurname: input.maternalSurname?.trim() ?? null,
            birthDate: input.birthDate ?? null,
            phoneNumber: input.phoneNumber?.trim() ?? null,
            email: input.email.toLowerCase().trim(),
            emergencyContact: input.emergencyContact?.trim() ?? null,
            address: input.address?.trim() ?? null,
            hireDate: input.hireDate,
            onSystem: true,
        });

        const savedEmployee = await employeeRepo.save(employee);

        const corporateEmail = await generateCorporateEmail(input.names, input.paternalSurname, queryRunner);
        const tempPassword = generateSecurePassword();
        const hashedPassword = await encryptPassword(tempPassword);

        /* Crear usuario asociado al empleado */
        const userRepo = queryRunner.manager.getRepository(User);

        const user = userRepo.create({
            name: buildFullName(savedEmployee),
            corporateEmail,
            password: hashedPassword,
            role: 'Usuario',
            rut: input.rut,
            accountStatus: 'Activa',
        });

        await userRepo.save(user);

        /* Crear perfil del empleado */
        const profileRepo = queryRunner.manager.getRepository(EmployeeProfile);

        const profile = profileRepo.create({
            employee: savedEmployee,
            jobTitle: 'Por definir',
            area: 'Por definir',
            contractType: 'Por definir',
            employmentType: 'Por definir',
            baseSalary: 0,
            status: estadoLaboral.ACTIVO,
        });

        await profileRepo.save(profile);

        /* Crear historial laboral inicial */
        const historyRepo = queryRunner.manager.getRepository(EmploymentHistory);

        const history = historyRepo.create({
            employee: savedEmployee,
            jobTitle: 'Por definir',
            area: 'Por definir',
            contractType: 'Por definir',
            employmentType: 'Por definir',
            baseSalary: 0,
            startDate: input.hireDate,
            status: estadoLaboral.ACTIVO,
            eventType: eventType.CONTRATACION,
            afp: 'Por definir',
            healthInsurance: 'Por definir',
            unemploymentInsurance: 'Por definir',
            notes: 'Registro inicial de contratación',
            registeredBy: registeredBy ?? null,
        });

        await historyRepo.save(history);

        await queryRunner.commitTransaction();
        await queryRunner.release();
        
        /* Enviar correo electrónico con credenciales */
        let emailSent = false;

        try {
            await sendEmail({
                to: input.email,
                subject: 'Bienvenido a la empresa - Credenciales de acceso',
                html: credentialsTemplate({ name: buildFullName(savedEmployee), corporateEmail, password: tempPassword }),
            });
            
            emailSent = true;
        } catch (emailError) {
            console.error('Error al enviar el correo electrónico:', emailError);
        }

        return { ok: true, data: { employee: savedEmployee, corporateEmail: corporateEmail, tempPassword, emailSent } };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en createEmployee:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Obtener lista de empleados con filtros y paginación */
export async function getEmployees(params: EmployeeQueryParams): Promise<ServiceResponse<Employee[]>> {
    try {
        const repo = AppDataSource.getRepository(Employee);

        const { page = 1, limit = 20, includeTerminated = false } = params;

        const qb = repo.createQueryBuilder('employee')
            .leftJoinAndSelect('employee.profile', 'profile')
            .orderBy('employee.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (includeTerminated) qb.withDeleted();

        if (params.rut) {
            qb.andWhere(
                `REPLACE(REPLACE(employee.rut, '.', ''), '-', '') = :rut`,
                { rut: cleanRut(params.rut) }
            );
        }

        if (params.name) {
            qb.andWhere(
                `CONCAT(employee.names, ' ', employee.paternalSurname) ILIKE :name`,
                { name: `%${params.name}%` }
            );
        }

        if (params.status) {
            qb.andWhere('profile.status = :status', { status: params.status });
        }

        const employees = await qb.getMany();

        return { ok: true, data: employees };
    } catch (error) {
        console.error('Error en getEmployees:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Obtener detalles de un empleado por ID */
export async function getEmployeeById(id: string, withDeleted = false): Promise<ServiceResponse<Employee>> {
    try {
        const repo = AppDataSource.getRepository(Employee);

        const employee = await repo.findOne({
            where: { id },
            relations: ['profile', 'employmentHistories', 'leaves', 'usuario'],
            withDeleted,
        });

        if (!employee) return { ok: false, error: { message: 'Empleado no encontrado', code: 'NOT_FOUND' } };

        return { ok: true, data: employee };
    } catch (error) {
        console.error('Error en getEmployeeById:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Actualizar datos de un empleado */
export async function updateEmployee(id: string, input: UpdateEmployeeInput, registeredBy?: User): Promise<ServiceResponse<Employee>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const employeeRepo = queryRunner.manager.getRepository(Employee);

        const employee = await employeeRepo.findOne({ where: { id, deletedAt: IsNull() }, relations: ['usuario', 'profile'] });

        if (!employee) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Empleado no encontrado', code: 'NOT_FOUND' } };
        }

        if (input.email && input.email !== employee.email) {
            const existing = await employeeRepo.findOne({ where: { email: input.email.toLowerCase(), id: Not(id) }, withDeleted: true });

            if (existing) {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                return { ok: false, error: { message: 'Ya existe un empleado con este correo electrónico', code: 'CONFLICT' } };
            }
        }

        const nameChanged = 
        (input.names !== undefined && input.names !== employee.names) || 
        (input.paternalSurname !== undefined && input.paternalSurname !== employee.paternalSurname);

        if (input.names) employee.names = input.names.trim();
        if (input.paternalSurname) employee.paternalSurname = input.paternalSurname.trim();
        if (input.maternalSurname !== undefined) employee.maternalSurname = input.maternalSurname?.trim() ?? null;
        if (input.birthDate !== undefined) employee.birthDate = input.birthDate ?? null;
        if (input.phoneNumber !== undefined) employee.phoneNumber = input.phoneNumber?.trim() ?? null;
        if (input.email) employee.email = input.email.toLowerCase().trim();
        if (input.emergencyContact !== undefined) employee.emergencyContact = input.emergencyContact?.trim() ?? null;
        if (input.address !== undefined) employee.address = input.address?.trim() ?? null;

        await employeeRepo.save(employee);

        let emailSent = false;

        if (nameChanged && employee.usuario) {
            const newCorporateEmail = await generateCorporateEmail(employee.names, employee.paternalSurname, queryRunner);
            const newTempPassword = generateSecurePassword();
            const hashedPassword = await encryptPassword(newTempPassword);

            const userRepo = queryRunner.manager.getRepository(User);
            employee.usuario.name = buildFullName(employee);
            employee.usuario.corporateEmail = newCorporateEmail;
            employee.usuario.password = hashedPassword;
            await userRepo.save(employee.usuario);

            await queryRunner.commitTransaction();
            await queryRunner.release();

            try {
                await sendEmail({
                    to: employee.email,
                    subject: 'Actualización de credenciales - Empleado actualizado',
                    html: credentialsTemplate({ name: buildFullName(employee), corporateEmail: newCorporateEmail, password: newTempPassword }),
                });
                emailSent = true;
            } catch (emailError) {
                console.error('Error al enviar nuevas credenciales:', emailError);
            }

            return { ok: true, data: employee };
        }

        const historyRepo = queryRunner.manager.getRepository(EmploymentHistory);
        
        const history = historyRepo.create({
            employee,
            jobTitle: employee.profile?.jobTitle ?? 'Por definir',
            area: employee.profile?.area ?? 'Por definir',
            contractType: employee.profile?.contractType ?? 'Por definir',
            employmentType: employee.profile?.employmentType ?? 'Por definir',
            baseSalary: employee.profile?.baseSalary ?? 0,
            startDate: employee.profile?.startDateContract ?? employee.hireDate,
            status: employee.profile?.status ?? estadoLaboral.ACTIVO,
            eventType: eventType.ACTUALIZACION_PERSONAL,
            afp: employee.profile?.fondoAFP ?? 'Por definir',
            healthInsurance: employee.profile?.previsionSalud ?? 'Por definir',
            unemploymentInsurance: employee.profile?.seguroCesantia ?? 'Por definir',
            notes: 'Actualización de datos personales',
            registeredBy: registeredBy ?? null,
        });

        await historyRepo.save(history);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return { ok: true, data: employee };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en updateEmployee:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Desvincular un empleado (soft delete) */
export async function terminateEmployee(id: string, reason: string, registeredBy?: User): Promise<ServiceResponse<Employee>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const employeeRepo = queryRunner.manager.getRepository(Employee);

        const employee = await employeeRepo.findOne({ where: { id, deletedAt: IsNull() }, relations: ['usuario', 'profile'] });

        if (!employee) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Empleado no encontrado o ya desvinculado', code: 'NOT_FOUND' } };
        }

        if (employee.profile && (employee.profile.status === estadoLaboral.LICENCIA || employee.profile.status === estadoLaboral.PERMISO)) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'No se puede desvincular a un empleado que se encuentra en licencia o permiso', code: 'CONFLICT' } };
        }

        await queryRunner.manager.softDelete(Employee, id);
        employee.onSystem = false;
        await employeeRepo.save(employee);

        if (employee.usuario) {
            const userRepo = queryRunner.manager.getRepository(User);
            employee.usuario.accountStatus = 'Inactiva';
            await userRepo.save(employee.usuario);
        }

        if (employee.profile) {
            const profileRepo = queryRunner.manager.getRepository(EmployeeProfile);
            employee.profile.status = estadoLaboral.DESVINCULADO;
            employee.profile.endDateContract = new Date();
            employee.profile.terminationReason = reason;
            await profileRepo.save(employee.profile);
        }

        const historyRepo = queryRunner.manager.getRepository(EmploymentHistory);

        const history = historyRepo.create({
            employee,
            jobTitle: employee.profile?.jobTitle ?? 'Por Definir',
            area: employee.profile?.area ?? 'Por Definir',
            contractType: employee.profile?.contractType ?? 'Por Definir',
            employmentType: employee.profile?.employmentType ?? 'Por Definir',
            baseSalary: employee.profile?.baseSalary ?? 0,
            startDate: employee.profile?.startDateContract ?? employee.hireDate,
            endDate: new Date(),
            status: estadoLaboral.DESVINCULADO,
            eventType: eventType.DESVINCULACION,
            afp: employee.profile?.fondoAFP ?? 'Por Definir',
            healthInsurance: employee.profile?.previsionSalud ?? 'Por Definir',
            unemploymentInsurance: employee.profile?.seguroCesantia ?? 'Por Definir',
            terminationReason: reason,
            notes: 'Desvinculación de empleado',
            registeredBy: registeredBy ?? null,
        });

        await historyRepo.save(history);

        await queryRunner.commitTransaction();
        await queryRunner.release();
        return { ok: true, data: employee };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en terminateEmployee:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Reactivar un empleado desvinculado */
export async function reactivateEmployee(
    id: string,
    input: ReactivateEmployeeInput,
    registeredBy?: User
): Promise<ServiceResponse<{ employee: Employee; corporateEmail: string; tempPassword: string; emailSent: boolean }>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const employeeRepo = queryRunner.manager.getRepository(Employee);

        const employee = await employeeRepo.findOne({ where: { id }, relations: ['profile', 'usuario'], withDeleted: true });

        if (!employee) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Empleado no encontrado o no está desvinculado', code: 'NOT_FOUND' } };
        }

        await queryRunner.manager.restore(Employee, id);

        if (input.names) employee.names = input.names.trim();
        if (input.paternalSurname) employee.paternalSurname = input.paternalSurname.trim();
        if (input.maternalSurname !== undefined) employee.maternalSurname = input.maternalSurname?.trim() ?? null;
        if (input.phoneNumber !== undefined) employee.phoneNumber = input.phoneNumber?.trim() ?? null;
        if (input.address !== undefined) employee.address = input.address?.trim() ?? null;
        employee.onSystem = true;

        await employeeRepo.save(employee);

        const corporateEmail = await generateCorporateEmail(employee.names, employee.paternalSurname, queryRunner);
        const tempPassword = generateSecurePassword();
        const hashedPassword = await encryptPassword(tempPassword);

        if (employee.usuario) {
            const userRepo = queryRunner.manager.getRepository(User);
            employee.usuario.name = buildFullName(employee);
            employee.usuario.corporateEmail = corporateEmail;
            employee.usuario.password = hashedPassword;
            employee.usuario.accountStatus = 'Activa';
            await userRepo.save(employee.usuario);
        }

        if (employee.profile) {
            const profileRepo = queryRunner.manager.getRepository(EmployeeProfile);
            employee.profile.status = estadoLaboral.ACTIVO;
            employee.profile.startDateContract = new Date();
            employee.profile.endDateContract = null;
            employee.profile.terminationReason = null;
            employee.profile.leaveStartDate = null;
            employee.profile.leaveEndDate = null;
            employee.profile.leaveReason = null;
            await profileRepo.save(employee.profile);
        }

        const historyRepo = queryRunner.manager.getRepository(EmploymentHistory);
        
        const history = historyRepo.create({
            employee,
            jobTitle: employee.profile?.jobTitle ?? 'Por Definir',
            area: employee.profile?.area ?? 'Por Definir',
            contractType: employee.profile?.contractType ?? 'Por Definir',
            employmentType: employee.profile?.employmentType ?? 'Por Definir',
            baseSalary: employee.profile?.baseSalary ?? 0,
            startDate: new Date(),
            status: estadoLaboral.ACTIVO,
            eventType: eventType.REACTIVACION,
            afp: employee.profile?.fondoAFP ?? 'Por Definir',
            healthInsurance: employee.profile?.previsionSalud ?? 'Por Definir',
            unemploymentInsurance: employee.profile?.seguroCesantia ?? 'Por Definir',
            reactivationReason: input.reactivationReason,
            notes: 'Reactivación de empleado',
            registeredBy: registeredBy ?? null,
        });

        await historyRepo.save(history);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        let emailSent = false;

        try {
            await sendEmail({
                to: employee.email,
                subject: 'Tus nuevas credenciales de acceso - Bienvenido nuevamente',
                html: credentialsTemplate({ name: buildFullName(employee), corporateEmail, password: tempPassword }),
            });
            emailSent = true;
        } catch (emailError) {
            console.error('Error al enviar credenciales de reactivación:', emailError);
        }

        return { ok: true, data: { employee, corporateEmail, tempPassword, emailSent } };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en reactivateEmployee:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}