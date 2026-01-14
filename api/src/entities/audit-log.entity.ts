import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  userId!: number;

  @Column()
  action!: string;

  @Column()
  resource!: string;

  @Column({ type: 'integer', nullable: true })
  resourceId!: number | null;

  @Column({ type: 'text', default: '' })
  details!: string;

  @CreateDateColumn()
  timestamp!: Date;
}
