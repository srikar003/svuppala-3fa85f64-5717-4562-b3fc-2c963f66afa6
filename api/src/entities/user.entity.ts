import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '@stms/data';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'text' })
  role!: Role;

  @Column({ type: 'integer' })
  organizationId!: number;
}
