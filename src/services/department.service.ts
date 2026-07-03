import { departmentRepository } from '../repositories/department.repository';
import { IDepartmentDocument } from '../interfaces/department.interface';
import { IPaginationQuery, IPaginationResult } from '../interfaces/pagination.interface';
import { buildPaginationResult } from '../utils/pagination.util';
import { logger } from '../utils/logger.util';
import { AppError } from './auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';
import { FilterQuery } from 'mongoose';

class DepartmentService {
  async createDepartment(data: { name: string; code: string; description: string }): Promise<IDepartmentDocument> {
    const codeExists = await departmentRepository.findByCode(data.code);
    if (codeExists) {
      throw new AppError('Department code already in use', HTTP_STATUS.CONFLICT);
    }

    const dept = await departmentRepository.create(data);
    logger.info(`Department created: ${dept.name} (${dept.code})`);
    return dept;
  }

  async getDepartments(query: IPaginationQuery): Promise<IPaginationResult<IDepartmentDocument>> {
    const { page = 1, limit = 20, search, sort = 'createdAt', order = 'desc' } = query;

    const filter: FilterQuery<IDepartmentDocument> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const { data, total } = await departmentRepository.findPaginated(filter, page, limit, { [sort]: sortOrder });
    return buildPaginationResult(data, total, page, limit);
  }

  async getPublicDepartments(): Promise<IDepartmentDocument[]> {
    return departmentRepository.findAllPublic();
  }

  async getDepartmentById(id: string): Promise<IDepartmentDocument> {
    const dept = await departmentRepository.findById(id);
    if (!dept) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
    }
    return dept;
  }

  async updateDepartment(id: string, data: Partial<{ name: string; code: string; description: string }>): Promise<IDepartmentDocument> {
    const dept = await departmentRepository.findById(id);
    if (!dept) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
    }

    if (data.code && data.code.toUpperCase() !== dept.code) {
      const codeExists = await departmentRepository.findByCode(data.code);
      if (codeExists) {
        throw new AppError('Department code already in use', HTTP_STATUS.CONFLICT);
      }
    }

    const updated = await departmentRepository.updateById(id, data);
    logger.info(`Department updated: ${id}`);
    return updated!;
  }

  async deleteDepartment(id: string): Promise<void> {
    const dept = await departmentRepository.findById(id);
    if (!dept) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
    }
    await departmentRepository.deleteById(id);
    logger.info(`Department deleted: ${id}`);
  }
}

export const departmentService = new DepartmentService();
