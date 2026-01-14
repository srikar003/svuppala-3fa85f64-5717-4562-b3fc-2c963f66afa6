import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Role } from '@svuppala-3fa85f64-5717-4562-b3fc-2c963f66afa6/data';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Task } from './entities/task.entity';
import { AuditLog } from './entities/audit-log.entity';

async function seed() {
  dotenv.config({ path: 'api/.env' });

  const ds = new DataSource({
    type: 'sqlite',
    database: process.env.DB_PATH || 'task_management.sqlite',
    entities: [User, Organization, Task, AuditLog],
    synchronize: true,
  });

  await ds.initialize();

  const orgRepo = ds.getRepository(Organization);
  const userRepo = ds.getRepository(User);
  const taskRepo = ds.getRepository(Task);
  const auditRepo = ds.getRepository(AuditLog);

  // ✅ Clear in dependency order (children first)
  await auditRepo.clear();
  await taskRepo.clear();
  await userRepo.clear();
  await orgRepo.clear();

  // Create org hierarchy (2-level)
  const parentOrg = await orgRepo.save({ name: 'ParentOrg', parentOrgId: null });
  const childOrg = await orgRepo.save({ name: 'ChildOrg', parentOrgId: parentOrg.id });

  const createUser = async (email: string, role: Role, organizationId: number) => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    return userRepo.save({ email, role, organizationId, passwordHash });
  };

  await createUser('owner@demo.com', Role.OWNER, parentOrg.id);
  await createUser('admin@demo.com', Role.ADMIN, parentOrg.id);
  await createUser('viewer@demo.com', Role.VIEWER, parentOrg.id);
  await createUser('child-admin@demo.com', Role.ADMIN, childOrg.id);

  console.log('✅ Seed completed successfully');
  console.log('🔑 Password for all users: Password123!');
  console.log('📧 Users: owner@demo.com | admin@demo.com | viewer@demo.com | child-admin@demo.com');

  await ds.destroy();
}

seed().catch((e) => {
  console.error('❌ Seed failed', e);
  process.exit(1);
});
