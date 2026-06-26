import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';
import { env } from '../config/environment';
import { UserModel } from '../models/user.model';
import { StudentModel } from '../models/student.model';
import { DepartmentModel } from '../models/department.model';
import { ROLES } from '../constants/roles';
import { departmentSeedData } from './data/departments';

const seed = async (): Promise<void> => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to database');

    console.log('\n--- Seeding Departments ---');
    const departments: { [key: string]: string } = {};

    for (const deptData of departmentSeedData) {
      const existing = await DepartmentModel.findOne({ code: deptData.code });
      if (existing) {
        console.log(`  Department already exists: ${deptData.name} (${deptData.code})`);
        departments[deptData.code] = existing._id.toString();
      } else {
        const dept = await DepartmentModel.create(deptData);
        departments[deptData.code] = dept._id.toString();
        console.log(`  Created: ${dept.name} (${dept.code}) - ID: ${dept._id}`);
      }
    }

    console.log('\n--- Seeding Super Admin ---');
    const superAdminEmail = env.DEFAULT_ADMIN_EMAIL;
    const existingSuperAdmin = await UserModel.findOne({ email: superAdminEmail });

    if (existingSuperAdmin) {
      console.log(`  Super admin already exists: ${superAdminEmail}`);
    } else {
      const superAdmin = await UserModel.create({
        fullName: env.DEFAULT_ADMIN_NAME,
        email: superAdminEmail,
        password: env.DEFAULT_ADMIN_PASSWORD,
        role: ROLES.SUPER_ADMIN,
        isActive: true,
      });
      console.log(`  Created super admin: ${superAdmin.email} (ID: ${superAdmin._id})`);
      console.log(`  Password: ${env.DEFAULT_ADMIN_PASSWORD}`);
    }

    console.log('\n--- Seeding Department Admins ---');
    const deptAdmins = [
      {
        fullName: 'Dr. Emmanuel Okafor',
        email: 'admin.csc@absu.edu.ng',
        password: 'Admin@123456',
        role: ROLES.DEPARTMENT_ADMIN,
        departmentCode: 'CSC',
      },
      {
        fullName: 'Dr. Ngozi Eze',
        email: 'admin.mth@absu.edu.ng',
        password: 'Admin@123456',
        role: ROLES.DEPARTMENT_ADMIN,
        departmentCode: 'MTH',
      },
    ];

    for (const admin of deptAdmins) {
      const existing = await UserModel.findOne({ email: admin.email });
      if (existing) {
        console.log(`  Department admin already exists: ${admin.email}`);
        continue;
      }

      const deptId = departments[admin.departmentCode];
      if (!deptId) {
        console.log(`  Department not found for code: ${admin.departmentCode}`);
        continue;
      }

      const user = await UserModel.create({
        fullName: admin.fullName,
        email: admin.email,
        password: admin.password,
        role: admin.role,
        departmentId: new mongoose.Types.ObjectId(deptId),
        isActive: true,
      });
      console.log(`  Created: ${user.fullName} (${user.email}) - Dept: ${admin.departmentCode}`);
    }

    console.log('\n--- Seeding Sample Students ---');
    const students = [
      {
        fullName: 'Chukwuemeka Obi',
        email: 'student1.csc@absu.edu.ng',
        password: 'Student@123456',
        matricNumber: 'CSC/2021/001',
        level: '300',
        departmentCode: 'CSC',
      },
      {
        fullName: 'Adaeze Nwosu',
        email: 'student2.csc@absu.edu.ng',
        password: 'Student@123456',
        matricNumber: 'CSC/2022/001',
        level: '200',
        departmentCode: 'CSC',
      },
      {
        fullName: 'Ikenna Eze',
        email: 'student1.mth@absu.edu.ng',
        password: 'Student@123456',
        matricNumber: 'MTH/2021/001',
        level: '300',
        departmentCode: 'MTH',
      },
    ];

    for (const student of students) {
      const existing = await StudentModel.findOne({ email: student.email });
      if (existing) {
        console.log(`  Student already exists: ${student.email}`);
        continue;
      }

      const deptId = departments[student.departmentCode];
      if (!deptId) continue;

      const created = await StudentModel.create({
        fullName: student.fullName,
        email: student.email,
        password: student.password,
        matricNumber: student.matricNumber,
        level: student.level,
        departmentId: new mongoose.Types.ObjectId(deptId),
        isActive: true,
      });
      console.log(`  Created: ${created.fullName} (${created.email}) - Matric: ${student.matricNumber}`);
    }

    console.log('\n=== Seeding completed successfully ===\n');
    console.log('Login credentials:');
    console.log(`  Super Admin: ${env.DEFAULT_ADMIN_EMAIL} / ${env.DEFAULT_ADMIN_PASSWORD}`);
    console.log('  Department Admin: admin.csc@absu.edu.ng / Admin@123456');
    console.log('  Student: student1.csc@absu.edu.ng / Student@123456');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
    process.exit(0);
  }
};

seed();
