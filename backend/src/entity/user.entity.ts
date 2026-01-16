import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn} from 'typeorm';
import { userRoles } from '../types/user.types.js';
import type { UserRole } from '../types/user.types.js';
import { formatRut, cleanRut,  } from 'rut-kit'

const accountStatuses = ['Activa', 'Inactiva', 'Suspendida'] as const;
export type AccountStatus = (typeof accountStatuses)[number];

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @Column({ type: 'varchar', length: 100})
    name!: string;

    @Column({ type: 'varchar', length: 100, unique: true, name: 'corporate_email' })
    corporateEmail!: string;

    @Column({ type: 'varchar', length: 255 })
    password!: string;

    @Column({ type: 'enum', enum:userRoles, default: 'Usuario' })
    role!: UserRole;

    @Column({
        type: 'varchar',
        length:12,
        unique: true,
        nullable: true,
        transformer: {
            to: (value: string | null): string | null => {
                if (!value) return null;

                return formatRut(cleanRut(value));
            },
            from: (value: string | null): string | null => {
                if (!value) return null;
                return formatRut(value, 'formatted');
    }        }
    })
    rut!: string | null;

    @Column({ type: 'enum', enum: accountStatuses, default: 'Activa' })
    accountStatus!: AccountStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}