/**
 * Tests de integración — módulo Empleados
 *
 * Ejecutar:  npm test  (requiere NODE_ENV=test y una BD PostgreSQL accesible)
 *
 * Los tests usan la misma BD configurada en .env con NODE_ENV=test.
 * El setup crea usuarios y un empleado de prueba; el teardown elimina todos
 * los registros creados durante la ejecución.
 */

import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Application } from 'express';

import { setupTestServer } from '../server.js';
import { AppDataSource } from '../config/configDB.js';
import { configEnv } from '../config/configEnv.js';
import { User } from '../entity/user.entity.js';
import { Employee } from '../entity/rrhh/employee.entity.js';
import { EmployeeProfile } from '../entity/rrhh/employeeProfile.entity.js';
import { encryptPassword } from '../utils/encrypt.js';
import { userRoles, type UserRole } from '../types/user.types.js';

/* ─── Mock del servicio de correo ──────────────────────────────────────────── */
/*
 * Se mockea ANTES de que cualquier módulo lo importe.
 * La ruta es relativa a ESTE archivo de test.
 */
vi.mock('../services/email.service.js', () => ({
    sendEmail: vi.fn().mockResolvedValue(undefined),
}));

/* ─── RUTs chilenos válidos usados exclusivamente en tests ──────────────────
 *
 * Verificación del dígito verificador (algoritmo módulo 11):
 *   11.111.111-1 → suma=32,  32%11=10, 11-10=1  ✓
 *   12.345.678-5 → suma=138, 138%11=6, 11-6=5   ✓
 *   20.111.222-2 → suma=42,  42%11=9,  11-9=2   ✓
 *   15.123.456-9 → suma=90,  90%11=2,  11-2=9   ✓
 *   18.765.432-7 → suma=158, 158%11=4, 11-4=7   ✓
 *   19.234.567-7 → suma=125, 125%11=4, 11-4=7   ✓
 */
const RUTS_TEST = {
    base:        '11.111.111-1',  // empleado persistente para tests de GET/PATCH
    crear1:      '12.345.678-5',  // test: crear empleado exitoso
    emailDupl:   '20.111.222-2',  // test: conflicto por email duplicado
    selfPatch:   '15.123.456-9',  // test: PATCH en modo auto-servicio
    terminar:    '18.765.432-7',  // test: desvincular exitoso (DELETE)
    reactivar:   '19.234.567-7',  // test: flujo desvincular → reactivar
} as const;

/* ─── Estado compartido entre bloques describe ──────────────────────────────── */
let app: Application;
let serverInstance: ReturnType<typeof setTimeout>; // tipado real: http.Server
let tokenRRHH: string;
let tokenGerencia: string;
let tokenUsuario: string;

/** Empleado creado en beforeAll para tests de lectura y actualización */
let empleadoBase: { id: string; rut: string };

/** IDs acumulados de empleados creados durante los tests (para limpieza final) */
const empleadosParaLimpiar: string[] = [];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

/** Genera un JWT válido con el secret de la aplicación */
function generarToken(
    corporateEmail: string,
    role: UserRole,
    name: string,
    rut: string | null = null,
): string {
    return jwt.sign(
        { name, corporateEmail, role, rut },
        configEnv.auth.accessTokenSecret,
        { expiresIn: '1h' },
    );
}

/** Crea un usuario en la BD con la contraseña hasheada */
async function crearUsuarioTest(params: {
    name: string;
    corporateEmail: string;
    role: UserRole;
    rut: string | null;
}): Promise<User> {
    const repo = AppDataSource.getRepository(User);
    const usuario = repo.create({
        ...params,
        password: await encryptPassword('TestPass123!'),
        accountStatus: 'Activa',
    });
    return repo.save(usuario);
}

/**
 * Elimina un empleado de prueba y todos sus registros relacionados.
 * Orden: Usuario → EmployeeProfile → Employee (CASCADE elimina EmploymentHistory).
 */
async function limpiarEmpleado(employeeId: string): Promise<void> {
    const employeeRepo = AppDataSource.getRepository(Employee);
    const profileRepo = AppDataSource.getRepository(EmployeeProfile);
    const userRepo = AppDataSource.getRepository(User);

    const employee = await employeeRepo.findOne({
        where: { id: employeeId },
        withDeleted: true,
    });

    if (!employee) return;

    // El FK users.rut → employees.rut obliga a eliminar el User primero
    if (employee.rut) {
        await userRepo.delete({ rut: employee.rut });
    }

    // El FK employee_profiles.employeeId → employees.id
    await profileRepo.delete({ employee: { id: employeeId } });

    // El FK employment_histories.employeeId tiene onDelete: 'CASCADE' → se borra solo
    await employeeRepo.delete({ id: employeeId });
}

/* ─── Setup / Teardown global ───────────────────────────────────────────────── */

beforeAll(async () => {
    const resultado = await setupTestServer();
    app = resultado.app;
    serverInstance = resultado.server as unknown as ReturnType<typeof setTimeout>;

    /* Limpiar posibles residuos de ejecuciones anteriores con los mismos RUTs */
    const employeeRepo = AppDataSource.getRepository(Employee);
    for (const rut of Object.values(RUTS_TEST)) {
        const existente = await employeeRepo.findOne({ where: { rut }, withDeleted: true });
        if (existente) await limpiarEmpleado(existente.id);
    }

    /* Crear usuarios de prueba con distintos roles */
    const rrhhUser = await crearUsuarioTest({
        name: 'Test RRHH',
        corporateEmail: 'test.rrhh@eoms-test.internal',
        role: userRoles.RECURSOS_HUMANOS,
        rut: null,
    });
    tokenRRHH = generarToken(rrhhUser.corporateEmail, rrhhUser.role, rrhhUser.name);

    const gerenciaUser = await crearUsuarioTest({
        name: 'Test Gerencia',
        corporateEmail: 'test.gerencia@eoms-test.internal',
        role: userRoles.GERENCIA,
        rut: null,
    });
    tokenGerencia = generarToken(gerenciaUser.corporateEmail, gerenciaUser.role, gerenciaUser.name);

    const usuarioPlano = await crearUsuarioTest({
        name: 'Test Usuario',
        corporateEmail: 'test.usuario@eoms-test.internal',
        role: userRoles.USUARIO,
        rut: null,
    });
    tokenUsuario = generarToken(usuarioPlano.corporateEmail, usuarioPlano.role, usuarioPlano.name);

    /* Crear el empleado base que reutilizarán los tests de GET y PATCH */
    const respBase = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${tokenRRHH}`)
        .send({
            rut: RUTS_TEST.base,
            names: 'Juan Alberto',
            paternalSurname: 'Pérez',
            maternalSurname: 'González',
            email: 'juan.perez.base@test-personal.com',
            hireDate: '2023-01-15',
        });

    if (respBase.status !== 201) {
        throw new Error(
            `beforeAll: no se pudo crear el empleado base. Estado: ${respBase.status}. ` +
            `Body: ${JSON.stringify(respBase.body)}`,
        );
    }

    empleadoBase = {
        id: respBase.body.data.employee.id as string,
        rut: respBase.body.data.employee.rut as string,
    };
    empleadosParaLimpiar.push(empleadoBase.id);
});

afterAll(async () => {
    /* Eliminar todos los empleados de prueba */
    for (const id of empleadosParaLimpiar) {
        await limpiarEmpleado(id).catch(() => {
            /* Ignorar si ya fue eliminado en algún test específico */
        });
    }

    /* Eliminar usuarios de prueba auxiliares */
    const userRepo = AppDataSource.getRepository(User);
    await userRepo.delete({ corporateEmail: 'test.rrhh@eoms-test.internal' });
    await userRepo.delete({ corporateEmail: 'test.gerencia@eoms-test.internal' });
    await userRepo.delete({ corporateEmail: 'test.usuario@eoms-test.internal' });

    /* Cerrar el servidor HTTP */
    await new Promise<void>((resolve) => {
        (serverInstance as unknown as { close: (cb: () => void) => void }).close(resolve);
    });
});

/* ══════════════════════════════════════════════════════════════════════════════
 * GET /api/employees
 * ══════════════════════════════════════════════════════════════════════════════ */
describe('GET /api/employees', () => {
    it('debería retornar lista de empleados con rol Recursos Humanos', async () => {
        const res = await request(app)
            .get('/api/employees')
            .set('Authorization', `Bearer ${tokenRRHH}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
        // Al menos el empleado base debe estar presente
        const ids = (res.body.data as Array<{ id: string }>).map((e) => e.id);
        expect(ids).toContain(empleadoBase.id);
    });

    it('debería retornar lista de empleados con rol Gerencia', async () => {
        const res = await request(app)
            .get('/api/employees')
            .set('Authorization', `Bearer ${tokenGerencia}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('debería retornar 401 sin token de autenticación', async () => {
        const res = await request(app).get('/api/employees');

        expect(res.status).toBe(401);
    });

    it('debería retornar 403 con rol sin permisos (Usuario)', async () => {
        const res = await request(app)
            .get('/api/employees')
            .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(res.status).toBe(403);
    });

    it('debería filtrar empleados por nombre y retornar 200', async () => {
        const res = await request(app)
            .get('/api/employees?name=Juan')
            .set('Authorization', `Bearer ${tokenRRHH}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
    });

    it('debería retornar lista vacía cuando el filtro no coincide con ningún empleado', async () => {
        const res = await request(app)
            .get('/api/employees?name=NombreQueNoExisteEnAbsoluto9999')
            .set('Authorization', `Bearer ${tokenRRHH}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveLength(0);
    });

    it('debería retornar 400 con parámetro page inválido (negativo)', async () => {
        const res = await request(app)
            .get('/api/employees?page=-1')
            .set('Authorization', `Bearer ${tokenRRHH}`);

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });

    it('debería retornar 400 con parámetro limit mayor a 100', async () => {
        const res = await request(app)
            .get('/api/employees?limit=101')
            .set('Authorization', `Bearer ${tokenRRHH}`);

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });
});

/* ══════════════════════════════════════════════════════════════════════════════
 * GET /api/employees/:id
 * ══════════════════════════════════════════════════════════════════════════════ */
describe('GET /api/employees/:id', () => {
    it('debería retornar el empleado por ID con rol Recursos Humanos', async () => {
        const res = await request(app)
            .get(`/api/employees/${empleadoBase.id}`)
            .set('Authorization', `Bearer ${tokenRRHH}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.id).toBe(empleadoBase.id);
    });

    it('debería retornar el empleado por ID con rol Gerencia', async () => {
        const res = await request(app)
            .get(`/api/employees/${empleadoBase.id}`)
            .set('Authorization', `Bearer ${tokenGerencia}`);

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(empleadoBase.id);
    });

    it('debería retornar 401 sin token de autenticación', async () => {
        const res = await request(app).get(`/api/employees/${empleadoBase.id}`);

        expect(res.status).toBe(401);
    });

    it('debería retornar 403 cuando el usuario no tiene permiso ni es el mismo empleado', async () => {
        // tokenUsuario apunta a un usuario sin empleado vinculado → no es "self"
        const res = await request(app)
            .get(`/api/employees/${empleadoBase.id}`)
            .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(res.status).toBe(403);
    });

    it('debería retornar 404 para un UUID que no existe en la BD', async () => {
        const res = await request(app)
            .get('/api/employees/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${tokenRRHH}`);

        expect(res.status).toBe(404);
        expect(res.body.status).toBe('error');
    });

    it('debería retornar 400 cuando el ID no tiene formato UUID', async () => {
        const res = await request(app)
            .get('/api/employees/no-es-un-uuid-valido')
            .set('Authorization', `Bearer ${tokenRRHH}`);

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });
});

/* ══════════════════════════════════════════════════════════════════════════════
 * POST /api/employees
 * ══════════════════════════════════════════════════════════════════════════════ */
describe('POST /api/employees', () => {
    it('debería crear un empleado exitosamente con rol Recursos Humanos', async () => {
        const res = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({
                rut: RUTS_TEST.crear1,
                names: 'María José',
                paternalSurname: 'Rodríguez',
                maternalSurname: 'Vega',
                email: 'maria.rodriguez.crear1@test-personal.com',
                phoneNumber: '+56912345678',
                hireDate: '2024-03-01',
            });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.employee).toBeDefined();
        expect(res.body.data.corporateEmail).toMatch(/@/);
        expect(typeof res.body.data.emailSent).toBe('boolean');

        // Registrar para limpieza posterior
        empleadosParaLimpiar.push(res.body.data.employee.id as string);
    });

    it('debería retornar 401 sin token de autenticación', async () => {
        const res = await request(app)
            .post('/api/employees')
            .send({
                rut: RUTS_TEST.crear1,
                names: 'Test',
                paternalSurname: 'Test',
                email: 'test.sin.auth@test.com',
                hireDate: '2024-01-01',
            });

        expect(res.status).toBe(401);
    });

    it('debería retornar 403 con rol Gerencia (sin permiso para crear)', async () => {
        const res = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${tokenGerencia}`)
            .send({
                rut: RUTS_TEST.crear1,
                names: 'Test',
                paternalSurname: 'Test',
                email: 'test.gerencia.create@test.com',
                hireDate: '2024-01-01',
            });

        expect(res.status).toBe(403);
    });

    it('debería retornar 400 cuando faltan campos obligatorios (sin rut)', async () => {
        const res = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({
                names: 'Test',
                paternalSurname: 'Test',
                email: 'test.missing.rut@test.com',
                hireDate: '2024-01-01',
                // rut ausente
            });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });

    it('debería retornar 400 cuando faltan campos obligatorios (sin hireDate)', async () => {
        const res = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({
                rut: RUTS_TEST.crear1,
                names: 'Test',
                paternalSurname: 'Test',
                email: 'test.missing.hire@test.com',
                // hireDate ausente
            });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });

    it('debería retornar 400 con un RUT con dígito verificador incorrecto', async () => {
        const res = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({
                rut: '12.345.678-0',  // dígito correcto sería 5
                names: 'Test',
                paternalSurname: 'Test',
                email: 'test.rut.invalido@test.com',
                hireDate: '2024-01-01',
            });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });

    it('debería retornar 400 con un email personal con formato inválido', async () => {
        const res = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({
                rut: RUTS_TEST.crear1,
                names: 'Test',
                paternalSurname: 'Test',
                email: 'esto-no-es-un-email',
                hireDate: '2024-01-01',
            });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });

    it('debería retornar 409 cuando el RUT ya pertenece a un empleado activo', async () => {
        // RUTS_TEST.base ya está registrado en empleadoBase (beforeAll)
        const res = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({
                rut: RUTS_TEST.base,
                names: 'Duplicado',
                paternalSurname: 'RUT',
                email: 'duplicado.rut@test-personal.com',
                hireDate: '2024-01-01',
            });

        expect(res.status).toBe(409);
        expect(res.body.status).toBe('error');
    });

    it('debería retornar 409 cuando el email personal ya está registrado', async () => {
        /*
         * Usa RUTS_TEST.emailDupl (RUT distinto y sin uso previo) para que el
         * conflicto sea por el email del empleadoBase y no por un RUT duplicado.
         */
        const res = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({
                rut: RUTS_TEST.emailDupl,
                names: 'Otro',
                paternalSurname: 'Empleado',
                email: 'juan.perez.base@test-personal.com',  // email del empleadoBase
                hireDate: '2024-01-01',
            });

        expect(res.status).toBe(409);
        expect(res.body.status).toBe('error');
    });
});

/* ══════════════════════════════════════════════════════════════════════════════
 * PATCH /api/employees/:id
 * ══════════════════════════════════════════════════════════════════════════════ */
describe('PATCH /api/employees/:id', () => {
    it('debería actualizar datos del empleado con rol Recursos Humanos', async () => {
        const res = await request(app)
            .patch(`/api/employees/${empleadoBase.id}`)
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({ phoneNumber: '+56912345678' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toBeDefined();
    });

    it('debería permitir que el propio empleado actualice sus datos (auto-servicio)', async () => {
        /* Crear un empleado nuevo y usar el usuario que se genera para él */
        const respCrear = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({
                rut: RUTS_TEST.selfPatch,
                names: 'Carlos',
                paternalSurname: 'Muñoz',
                email: 'carlos.munoz.self@test-personal.com',
                hireDate: '2024-01-01',
            });

        expect(respCrear.status).toBe(201);

        const empSelf = respCrear.body.data.employee as { id: string; rut: string };
        const corpEmail = respCrear.body.data.corporateEmail as string;
        empleadosParaLimpiar.push(empSelf.id);

        /* Generar token para el Usuario que fue creado junto al empleado */
        const tokenSelf = generarToken(corpEmail, userRoles.USUARIO, 'Carlos Muñoz', empSelf.rut);

        /* El schema de auto-servicio sólo admite: email, phoneNumber, emergencyContact, address */
        const res = await request(app)
            .patch(`/api/employees/${empSelf.id}`)
            .set('Authorization', `Bearer ${tokenSelf}`)
            .send({ phoneNumber: '+56987654321' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
    });

    it('debería retornar 401 sin token de autenticación', async () => {
        const res = await request(app)
            .patch(`/api/employees/${empleadoBase.id}`)
            .send({ phoneNumber: '+56912345678' });

        expect(res.status).toBe(401);
    });

    it('debería retornar 403 con rol Gerencia sobre un empleado ajeno', async () => {
        const res = await request(app)
            .patch(`/api/employees/${empleadoBase.id}`)
            .set('Authorization', `Bearer ${tokenGerencia}`)
            .send({ phoneNumber: '+56912345678' });

        expect(res.status).toBe(403);
    });

    it('debería retornar 400 cuando el body está vacío (sin campos a actualizar)', async () => {
        const res = await request(app)
            .patch(`/api/employees/${empleadoBase.id}`)
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });

    it('debería retornar 400 con formato de teléfono inválido', async () => {
        const res = await request(app)
            .patch(`/api/employees/${empleadoBase.id}`)
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({ phoneNumber: 'no-es-telefono' });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });

    it('debería retornar 400 cuando el parámetro :id no tiene formato UUID', async () => {
        const res = await request(app)
            .patch('/api/employees/id-invalido')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({ phoneNumber: '+56912345678' });

        expect(res.status).toBe(400);
    });

    it('debería retornar 404 para un UUID de empleado que no existe', async () => {
        const res = await request(app)
            .patch('/api/employees/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({ phoneNumber: '+56912345678' });

        expect(res.status).toBe(404);
        expect(res.body.status).toBe('error');
    });
});

/* ══════════════════════════════════════════════════════════════════════════════
 * DELETE /api/employees/:id  (desvinculación — soft delete)
 * ══════════════════════════════════════════════════════════════════════════════ */
describe('DELETE /api/employees/:id', () => {
    it('debería retornar 401 sin token de autenticación', async () => {
        const res = await request(app)
            .delete(`/api/employees/${empleadoBase.id}`)
            .send({ reason: 'Renuncia voluntaria' });

        expect(res.status).toBe(401);
    });

    it('debería retornar 403 con rol Gerencia (sin permiso para desvincular)', async () => {
        const res = await request(app)
            .delete(`/api/employees/${empleadoBase.id}`)
            .set('Authorization', `Bearer ${tokenGerencia}`)
            .send({ reason: 'Renuncia voluntaria' });

        expect(res.status).toBe(403);
    });

    it('debería retornar 400 cuando falta el motivo de desvinculación', async () => {
        const res = await request(app)
            .delete(`/api/employees/${empleadoBase.id}`)
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });

    it('debería retornar 400 cuando el motivo es demasiado corto', async () => {
        const res = await request(app)
            .delete(`/api/employees/${empleadoBase.id}`)
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({ reason: 'No' });  // mínimo 3 caracteres

        expect(res.status).toBe(400);
    });

    it('debería retornar 404 para un UUID de empleado que no existe', async () => {
        const res = await request(app)
            .delete('/api/employees/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({ reason: 'Motivo de prueba suficientemente largo' });

        expect(res.status).toBe(404);
        expect(res.body.status).toBe('error');
    });

    it('debería desvincular un empleado exitosamente (soft delete)', async () => {
        /* Crear empleado exclusivo para este test */
        const respCrear = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({
                rut: RUTS_TEST.terminar,
                names: 'Pedro',
                paternalSurname: 'Soto',
                email: 'pedro.soto.terminar@test-personal.com',
                hireDate: '2022-06-01',
            });

        expect(respCrear.status).toBe(201);
        const empId = respCrear.body.data.employee.id as string;
        empleadosParaLimpiar.push(empId);

        /* Desvincular */
        const resDel = await request(app)
            .delete(`/api/employees/${empId}`)
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({ reason: 'Renuncia voluntaria del trabajador — test de integración' });

        expect(resDel.status).toBe(200);
        expect(resDel.body.status).toBe('success');
        expect(resDel.body.message).toMatch(/desvinculado/i);

        /* Verificar que el empleado ya no es visible (soft-deleted → 404) */
        const resGet = await request(app)
            .get(`/api/employees/${empId}`)
            .set('Authorization', `Bearer ${tokenRRHH}`);

        expect(resGet.status).toBe(404);
    });
});

/* ══════════════════════════════════════════════════════════════════════════════
 * POST /api/employees/:id/reactivate
 * ══════════════════════════════════════════════════════════════════════════════ */
describe('POST /api/employees/:id/reactivate', () => {
    it('debería retornar 401 sin token de autenticación', async () => {
        const res = await request(app)
            .post(`/api/employees/${empleadoBase.id}/reactivate`)
            .send({ reactivationReason: 'Motivo de prueba' });

        expect(res.status).toBe(401);
    });

    it('debería retornar 403 con rol Gerencia (sin permiso para reactivar)', async () => {
        const res = await request(app)
            .post(`/api/employees/${empleadoBase.id}/reactivate`)
            .set('Authorization', `Bearer ${tokenGerencia}`)
            .send({ reactivationReason: 'Motivo de prueba suficientemente largo' });

        expect(res.status).toBe(403);
    });

    it('debería retornar 400 cuando falta el motivo de reactivación', async () => {
        const res = await request(app)
            .post(`/api/employees/${empleadoBase.id}/reactivate`)
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });

    it('debería retornar 400 cuando el motivo de reactivación es demasiado corto', async () => {
        const res = await request(app)
            .post(`/api/employees/${empleadoBase.id}/reactivate`)
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({ reactivationReason: 'No' });  // mínimo 3 caracteres

        expect(res.status).toBe(400);
    });

    it('debería retornar 404 para un UUID de empleado que no existe', async () => {
        const res = await request(app)
            .post('/api/employees/00000000-0000-0000-0000-000000000000/reactivate')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({ reactivationReason: 'Motivo de reactivación de prueba suficiente' });

        expect(res.status).toBe(404);
        expect(res.body.status).toBe('error');
    });

    it('debería reactivar un empleado desvinculado exitosamente (flujo completo)', async () => {
        /* 1 — Crear empleado */
        const respCrear = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({
                rut: RUTS_TEST.reactivar,
                names: 'Laura',
                paternalSurname: 'Torres',
                email: 'laura.torres.reactiv@test-personal.com',
                hireDate: '2021-05-10',
            });

        expect(respCrear.status).toBe(201);
        const empId = respCrear.body.data.employee.id as string;
        empleadosParaLimpiar.push(empId);

        /* 2 — Desvincular */
        const resDel = await request(app)
            .delete(`/api/employees/${empId}`)
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({ reason: 'Fin de contrato — test de reactivación' });

        expect(resDel.status).toBe(200);

        /* 3 — Reactivar */
        const resReact = await request(app)
            .post(`/api/employees/${empId}/reactivate`)
            .set('Authorization', `Bearer ${tokenRRHH}`)
            .send({
                reactivationReason: 'Recontratación por necesidades del negocio — test de integración',
            });

        expect(resReact.status).toBe(200);
        expect(resReact.body.status).toBe('success');
        expect(resReact.body.data.employee).toBeDefined();
        expect(resReact.body.data.corporateEmail).toMatch(/@/);
        expect(resReact.body.message).toMatch(/reactivado/i);

        /* 4 — Verificar que el empleado vuelve a ser visible (ya no soft-deleted) */
        const resGet = await request(app)
            .get(`/api/employees/${empId}`)
            .set('Authorization', `Bearer ${tokenRRHH}`);

        expect(resGet.status).toBe(200);
        expect(resGet.body.data.id).toBe(empId);
    });
});
