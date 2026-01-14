import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '@svuppala-3fa85f64-5717-4562-b3fc-2c963f66afa6/data';

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
