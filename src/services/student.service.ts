import { Types } from 'mongoose';
import { FilterQuery } from 'mongoose';
import { studentRepository } from '../repositories/student.repository';
import { departmentRepository } from '../repositories/department.repository';
import { academicSessionRepository } from '../repositories/academicSession.repository';
import { IStudentDocument, IStudentResponse } from '../interfaces/student.interface';
import { IPaginationQuery, IPaginationResult } from '../interfaces/pagination.interface';
import { buildPaginationResult } from '../utils/pagination.util';
import { logger } from '../utils/logger.util';
import { AppError } from './auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';
import { ROLES, Role } from '../constants/roles';
import { IDepartment } from '@/interfaces/department.interface';

class StudentService {
  private parseEnrollmentYear(matricNumber: string): number {
    const year = parseInt(matricNumber.split('/')[0], 10);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      throw new AppError('Invalid matric number format: cannot determine enrollment year', HTTP_STATUS.BAD_REQUEST);
    }
    return year;
  }

  private calculateLevel(enrollmentYear: number, sessionStartYear: number): string {
    return String((sessionStartYear - enrollmentYear) * 100);
  }

  private mapToResponse(student: IStudentDocument): IStudentResponse {
    const obj = student.toJSON() as unknown as IStudentDocument & { createdAt?: Date; updatedAt?: Date };
    return {
      _id: student._id.toString(),
      fullName: student.fullName,
      email: student.email,
      role: student.role,
      matricNumber: student.matricNumber,
      level: student.level,
      departmentId: student.departmentId as IDepartment | Types.ObjectId,
      profileImage: student.profileImage,
      isActive: student.isActive,
      lastLogin: student.lastLogin,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  async createStudent(
    data: {
      fullName: string;
      email: string;
      password: string;
      matricNumber: string;
      departmentId: string;
    },
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<IStudentResponse> {
    if (requesterRole === ROLES.DEPARTMENT_ADMIN && data.departmentId !== requesterDeptId) {
      throw new AppError('You can only add students to your department', HTTP_STATUS.FORBIDDEN);
    }

    const activeSession = await academicSessionRepository.findActive();
    if (!activeSession) throw new AppError('No active academic session found', HTTP_STATUS.BAD_REQUEST);

    const dept = await departmentRepository.findById(data.departmentId);
    if (!dept) throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);

    const emailExists = await studentRepository.findByEmailWithoutPassword(data.email);
    if (emailExists) throw new AppError('Email already in use', HTTP_STATUS.CONFLICT);

    const matricExists = await studentRepository.findByMatricNumber(data.matricNumber);
    if (matricExists) throw new AppError('Matriculation number already in use', HTTP_STATUS.CONFLICT);

    const enrollmentYear = this.parseEnrollmentYear(data.matricNumber);
    const level = this.calculateLevel(enrollmentYear, activeSession.startYear);

    const student = await studentRepository.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      matricNumber: data.matricNumber,
      level,
      departmentId: new Types.ObjectId(data.departmentId),
      isActive: true,
    });

    logger.info(`Student created: ${student.email}`);
    return this.mapToResponse(student);
  }

  async createStudentsBulk(
    students: Array<{
      fullName: string;
      email: string;
      password: string;
      matricNumber: string;
      departmentId: string;
    }>,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<{ created: number; failed: Array<{ index: number; email: string; reason: string }> }> {
    const result = {
      created: 0,
      failed: [] as Array<{ index: number; email: string; reason: string }>,
    };

    for (let i = 0; i < students.length; i++) {
      try {
        await this.createStudent(students[i], requesterRole, requesterDeptId);
        result.created++;
      } catch (error) {
        result.failed.push({ index: i, email: students[i].email, reason: (error as Error).message });
      }
    }

    logger.info(`Bulk student creation: ${result.created} created, ${result.failed.length} failed`);
    return result;
  }

  async getStudents(
    query: IPaginationQuery,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<IPaginationResult<IStudentResponse>> {
    const { page = 1, limit = 20, search, sort = 'createdAt', order = 'desc', departmentId, level } = query;

    const filter: FilterQuery<IStudentDocument> = {};

    if (requesterRole === ROLES.DEPARTMENT_ADMIN) {
      filter.departmentId = requesterDeptId;
    } else if (departmentId) {
      filter.departmentId = departmentId;
    }

    if (level) filter.level = level;

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { matricNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const { data, total } = await studentRepository.findPaginated(filter, page, limit, { [sort]: sortOrder });
    return buildPaginationResult(data.map((s) => this.mapToResponse(s)), total, page, limit);
  }

  async getStudentById(id: string, requesterRole: Role, requesterDeptId?: string): Promise<IStudentResponse> {
    const student = await studentRepository.findById(id);
    if (!student) throw new AppError('Student not found', HTTP_STATUS.NOT_FOUND);

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && student.departmentId.toString() !== requesterDeptId) {
      throw new AppError('You can only access students in your department', HTTP_STATUS.FORBIDDEN);
    }

    return this.mapToResponse(student);
  }

  async updateStudent(
    id: string,
    data: Partial<{
      fullName: string;
      email: string;
      level: string;
      matricNumber: string;
      departmentId: string;
      isActive: boolean;
    }>,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<IStudentResponse> {
    const student = await studentRepository.findById(id);
    if (!student) throw new AppError('Student not found', HTTP_STATUS.NOT_FOUND);

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && student.departmentId.toString() !== requesterDeptId) {
      throw new AppError('You can only update students in your department', HTTP_STATUS.FORBIDDEN);
    }

    if (data.email && data.email !== student.email) {
      const emailExists = await studentRepository.findByEmailWithoutPassword(data.email);
      if (emailExists) throw new AppError('Email already in use', HTTP_STATUS.CONFLICT);
    }

    if (data.matricNumber && data.matricNumber !== student.matricNumber) {
      const matricExists = await studentRepository.findByMatricNumber(data.matricNumber);
      if (matricExists) throw new AppError('Matriculation number already in use', HTTP_STATUS.CONFLICT);
    }

    const updateData: Partial<IStudentDocument> = {};
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.email) updateData.email = data.email;
    if (data.level) updateData.level = data.level;
    if (data.matricNumber) updateData.matricNumber = data.matricNumber;
    if (data.departmentId) updateData.departmentId = new Types.ObjectId(data.departmentId);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await studentRepository.updateById(id, updateData);
    logger.info(`Student updated: ${id}`);
    return this.mapToResponse(updated!);
  }

  async deleteStudent(id: string, requesterRole: Role, requesterDeptId?: string): Promise<void> {
    const student = await studentRepository.findById(id);
    if (!student) throw new AppError('Student not found', HTTP_STATUS.NOT_FOUND);

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && student.departmentId.toString() !== requesterDeptId) {
      throw new AppError('You can only delete students in your department', HTTP_STATUS.FORBIDDEN);
    }

    await studentRepository.deleteById(id);
    logger.info(`Student deleted: ${id}`);
  }
}

export const studentService = new StudentService();
