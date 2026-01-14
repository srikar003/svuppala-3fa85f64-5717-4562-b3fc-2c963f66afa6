import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  // 2-level hierarchy: parent org id
  @Column({ type: 'integer', nullable: true })
  parentOrgId!: number | null;
}
