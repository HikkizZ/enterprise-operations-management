import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity.js';
import { User } from '../user.entity.js';

@Entity('employment_histories')
export class EmploymentHistory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    jobTitle!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    area!: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    contractType!: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    employmentType!: string;

    @Column({ type: 'int', nullable: false })
    baseSalary!: number;

    @Column({ type: 'date', nullable: false })
    startDate!: Date;

    @Column({ type: 'date', nullable: true })
    endDate!: Date | null;

    @Column({ type: 'text', nullable: true })
    terminationReason!: string | null;

    @Column({ type: 'text', nullable: true })
    reactivationReason!: string | null;

    @Column({ type: 'text', nullable: true })
    notes!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    contractURL!: string | null;

    @Column({ type: 'varchar', length: 100, nullable: false })
    afp!: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    healthInsurance!: string;

    @Column({ type: 'varchar', length: 20, nullable: false })
    unemploymentInsurance!: string;

    @Column({ type: 'varchar', length: 30, nullable: false })
    status!: string;

    @Column({ type: 'date', nullable: true })
    leaveStartDate!: Date | null;

    @Column({ type: 'date', nullable: true })
    leaveEndDate!: Date | null;

    @Column({ type: 'text', nullable: true })
    leaveReason!: string | null;

    /* Relación con trabajador */
    @ManyToOne(() => Employee, (employee) => employee.employmentHistories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    /* Relación con usuario */
    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'userId' })
    registeredBy!: User | null;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt!: Date;
}