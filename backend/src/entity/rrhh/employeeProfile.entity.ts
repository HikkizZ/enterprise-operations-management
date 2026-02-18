import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from 'typeorm';

import type { EstadoLaboral, FondoAFP, SeguroCesantia, TipoPrevisionSalud } from '../../types/employeeProfile.types.js';
import { Employee } from './employee.entity.js';
import { makeDateTransformer } from '../../helpers/transformerDate.helper.js';

@Entity('employee_profiles')
export class EmployeeProfile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /* Relación con trabajador */
    @OneToOne(() => Employee, (employee) => employee.profile, { nullable: false })
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @Column({ type: 'varchar', length: 100, nullable: false })
    jobTitle!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    area!: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    contractType!: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    employmentType!: string;

    @Column({
        type: 'integer',
        nullable: false,
        default: 0,
        transformer: {
            to: (value: number | null) => Math.round(value ?? 0),
            from: (value: number | string | null) =>
                Math.round(typeof value === 'string' ? parseInt(value, 10) : value ?? 0),
        }
    })
    baseSalary!: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    previsionSalud!: TipoPrevisionSalud | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    fondoAFP!: FondoAFP | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    seguroCesantia!: SeguroCesantia | null;

    @Column({
        type: 'date',
        nullable: true,
        transformer: makeDateTransformer('Fecha de inicio de contrato inválida en transformer')
    })
    startDateContract!: Date | null;

    @Column({
        type: 'date',
        nullable: true,
        transformer: makeDateTransformer('Fecha de término de contrato inválida en transformer')
    })
    endDateContract!: Date | null;

    @Column({ type: 'varchar', length: 30, nullable: false })
    status!: EstadoLaboral;

    @Column({ type: 'text', nullable: true })
    terminationReason!: string | null;

    @Column({
        type: 'date',
        nullable: true,
        transformer: makeDateTransformer('Fecha de inicio de licencia inválida en transformer')
    })
    leaveStartDate!: Date | null;

    @Column({
        type: 'date',
        nullable: true,
        transformer: makeDateTransformer('Fecha de término de licencia inválida en transformer')
    })
    leaveEndDate!: Date | null;

    @Column({ type: 'text', nullable: true })
    leaveReason!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    contractURL!: string | null;
}