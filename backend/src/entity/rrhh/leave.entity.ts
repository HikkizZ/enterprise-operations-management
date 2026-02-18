import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
} from 'typeorm';

import { TipoSolicitud, EstadoSolicitud } from '../../types/leave.types.js';

import { Employee } from './employee.entity.js';
import { User } from '../user.entity.js';
import { makeDateTransformer } from '../../helpers/transformerDate.helper.js';

@Entity('leaves')
export class Leave {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /* Relación con Trabajador */
    @ManyToOne(() => Employee, (employee) => employee.leaves, { nullable: false })
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @Column({ type: 'enum', enum: Object.values(TipoSolicitud), nullable: false })
    type!: TipoSolicitud;

    @Column({
        type: 'date',
        nullable: false,
        transformer: makeDateTransformer('Fecha de inicio inválida en transformer')
    })
    startDate!: Date;

    @Column({
        type: 'date',
        nullable: false,
        transformer: makeDateTransformer('Fecha de término inválida en transformer')
    })
    endDate!: Date;

    @Column({ type: 'text', nullable: false })
    reason!: string;

    @Column({ type: 'enum', enum: Object.values(EstadoSolicitud), default: EstadoSolicitud.PENDIENTE })
    status!: EstadoSolicitud;

    @Column({ type: 'text', nullable: true })
    comments!: string | null;

    /* Relación con Usuario (Quien revisa la solicitud) */
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reviewedByUserId' })
    reviewedBy!: User | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    attachedFileURL!: string | null;

    @CreateDateColumn({ type: 'timestamp' })
    applicationDate!: Date;

}


