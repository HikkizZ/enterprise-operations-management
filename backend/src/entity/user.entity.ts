import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, DeleteDateColumn, Index } from 'typeorm';
import { accountStatuses, userRoles } from '../types/user.types.js';
import type { AccountStatus, UserRole } from '../types/user.types.js';
import { formatRut, cleanRut, } from 'rut-kit'
import { Employee } from './rrhh/employee.entity.js';
export { accountStatuses } from '../types/user.types.js';
export type { AccountStatus } from '../types/user.types.js';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'varchar', length: 100, unique: true, name: 'corporate_email' })
    corporateEmail!: string;

    @Column({ type: 'varchar', length: 255 })
    password!: string;

    @Column({ type: 'enum', enum: userRoles, default: 'Usuario' })
    role!: UserRole;

    @Index('IDX_USER_RUT', { unique: true })
    @Column({
        type: 'varchar',
        length: 12,
        unique: true,
        nullable: true,
        transformer: {
            to: (value: string | null) => (value ? formatRut(cleanRut(value)) : null),
            from: (value: string | null) => (value ? formatRut(cleanRut(value), 'formatted') : null),
        }
    })
    rut!: string | null;

    @Column({ type: 'enum', enum: accountStatuses, default: 'Activa' })
    accountStatus!: AccountStatus;

    @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
    deletedAt!: Date | null;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt!: Date;

    /* Relación con trabajador */
    @OneToOne(() => Employee, (employee) => employee.usuario, { nullable: true })
    @JoinColumn({
        name: 'rut',
        referencedColumnName: 'rut',
        foreignKeyConstraintName: 'FK_user_employee_rut'
    })
    employee!: Employee | null;
}

/* ------------- Codigo Modificado ------------- */
// to: (value: string | null): string | null => {
//     if (!value) return nul
//     return formatRut(cleanRut(value));
// },
// from: (value: string | null): string | null => {
//     if (!value) return null;
//     return formatRut(value, 'formatted');
// }