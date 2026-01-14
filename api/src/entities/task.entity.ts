import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  category!: string;

  @Column({ type: 'text', default: 'Todo' })
  status!: 'Todo' | 'InProgress' | 'Done';

  @Column({ type: 'integer', default: 0 })
  order!: number;

  @Column({ type: 'integer' })
  organizationId!: number;

  @Column({ type: 'integer' })
  createdBy!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
