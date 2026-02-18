import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    OneToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn
} from 'typeorm';

import { User } from '../user.entity.js';
import { EmploymentHistory } from './employmentHistory.entity.js';
import { Leave } from './leave.entity.js';
import { formatRut, cleanRut } from 'rut-kit';
import { EmployeeProfile } from './employeeProfile.entity.js';
import { makeDateTransformer } from '../../helpers/transformerDate.helper.js';

@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index('IDX_EMPLOYEE_RUT', { unique: true })
    @Column({
        type: 'varchar',
        length: 12,
        nullable: false,
        transformer: {
            to: (value: string | null) => (value ? formatRut(cleanRut(value)) : null),
            from: (value: string | null) => (value ? formatRut(cleanRut(value), 'formatted') : null),
        }
    })
    rut!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    names!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    paternalSurname!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    maternalSurname!: string | null;

    @Column({
        type: 'date',
        nullable: true,
        transformer: makeDateTransformer('Fecha de nacimiento inválida en transformer')
    })
    birthDate!: Date | null;

    @Column({ type: 'varchar', length: 15, nullable: true })
    phoneNumber!: string | null;

    @Index('IDX_EMPLOYEE_EMAIL', { unique: true })
    @Column({ type: 'varchar', length: 150, nullable: false })
    email!: string;

    @Column({ type: 'varchar', length: 12, nullable: true })
    emergencyContact!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address!: string | null;

    @Column({
        type: 'date',
        nullable: false,
        transformer: makeDateTransformer('Fecha de contratación inválida en transformer')
    })
    hireDate!: Date;

    @Column({ type: 'boolean', default: true })
    onSystem!: boolean;

    /* Relación 1:1 con ficha empresa */
    @OneToOne(() => EmployeeProfile, (profile) => profile.employee, { cascade: true })
    profile!: EmployeeProfile;

    /* Relación 1:N con historial laboral */
    @OneToMany(() => EmploymentHistory, (employmentHistory) => employmentHistory.employee, { cascade: ['insert'] })
    employmentHistories!: EmploymentHistory[];

    /* Relación 1:N con licencias */
    @OneToMany(() => Leave, (leave) => leave.employee, { cascade: false })
    leaves!: Leave[];

    /* Relación 1:1 con usuario del sistema (Por RUT) */
    @OneToOne(() => User, (user) => user.employee, {
        nullable: true,
        eager: false,
     })
     usuario!: User | null;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
    deletedAt!: Date | null;
}