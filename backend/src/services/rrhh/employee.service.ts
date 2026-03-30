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
import { estadoLaboral } from "../../types/employeeProfile.types.js";
import type { ServiceResponse } from "../../types/common.types.js";
import type {
    CreateEmployeeInput,
    EmployeeQueryParams,
    ReactivateEmployeeInput,
    UpdateEmployeeInput
} from "../../types/employee.types.js";

function buildFullName(employee: Employee): string {
    return [employee.names, employee.paternalSurname, employee.maternalSurname].filter(Boolean).join(' ');
}

/* Crear un nuevo empleado */
export async function createEmployee(
    input: CreateEmployeeInput,
    registeredBy?: User
): Promise<ServiceResponse<{ employee: Employee; coorporateEmail: string; tempPassword: string; emailSent: boolean }>> {
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

        return { ok: true, data: { employee: savedEmployee, coorporateEmail: corporateEmail, tempPassword, emailSent } };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en createEmployee:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}