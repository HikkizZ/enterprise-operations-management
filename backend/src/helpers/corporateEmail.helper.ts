import crypto from 'crypto';
import { configEnv } from '../config/configEnv.js';
import { AppDataSource } from '../config/configDB.js';
import { User } from '../entity/user.entity.js';
import type { QueryRunner } from 'typeorm';

function normalizeNamePart(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFD') // Descomponer caracteres acentuados en su forma base + acento
        .replace(/\p{Diacritic}/gu, '') // Eliminar acentos y diacríticos
        .replace(/[^a-z]/g, ''); // Eliminar caracteres no alfabéticos
}

export function generateSecurePassword(): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '!@#$%^&*';
    const all = upper + lower + digits + special;

    const length = 12;
    const chars: string[] = [];

    // Garantizar al menos un carácter de cada tipo
    chars.push(upper[crypto.randomInt(upper.length)]!);
    chars.push(lower[crypto.randomInt(lower.length)]!);
    chars.push(digits[crypto.randomInt(digits.length)]!);
    chars.push(special[crypto.randomInt(special.length)]!);

    // Rellenar el resto de la contraseña con caracteres aleatorios
    for (let i = chars.length; i < length; i++) {
        chars.push(all[crypto.randomInt(all.length)]!);
    }

    // Mezclar los caracteres para evitar patrones predecibles
    for (let i = chars.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j]!, chars[i]!];
    }

    return chars.join('');
};

export async function generateCorporateEmail(
    firstName: string,
    paternalSurname: string,
    queryRunner?: QueryRunner
): Promise<string> {
    const domain = configEnv.company.emailDomain;
    const first = normalizeNamePart(firstName.split(' ')[0]!);
    const surname = normalizeNamePart(paternalSurname);
    const base = `${first}.${surname}`;

    const repo = queryRunner
        ? queryRunner.manager.getRepository(User)
        : AppDataSource.getRepository(User);

    // Inluir soft-deleted para evitar reutilizar correos historicos
    const used = await repo
        .createQueryBuilder('user')
        .select('user.corporateEmail')
        .where('user.corporateEmail ILIKE :pattern', { pattern: `${base}%@${domain}` })
        .withDeleted()
        .getMany();

    if (used.length === 0) return `${base}@${domain}`;

    const usedSet = new Set(used.map(u => u.corporateEmail?.toLowerCase()));

    if (!usedSet.has(`${base}@${domain}`)) return `${base}@${domain}`;

    let counter = 1;

    while (usedSet.has(`${base}${counter}@${domain}`)) counter++;

    return `${base}${counter}@${domain}`;
};
