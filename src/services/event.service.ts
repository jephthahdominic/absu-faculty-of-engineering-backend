import { Types } from 'mongoose';
import { eventRepository } from '../repositories/event.repository';
import { departmentRepository } from '../repositories/department.repository';
import { r2Service } from './r2.service';
import { IEventDocument } from '../interfaces/event.interface';
import { IPaginationQuery, IPaginationResult } from '../interfaces/pagination.interface';
import { buildPaginationResult } from '../utils/pagination.util';
import { generateSlug } from '../utils/slug.util';
import { logger } from '../utils/logger.util';
import { AppError } from './auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';
import { FilterQuery } from 'mongoose';
import { ROLES, Role } from '../constants/roles';

class EventService {
  async createEvent(
    data: {
      title: string;
      description: string;
      venue: string;
      eventDate: Date;
      isPublished?: boolean;
      departmentId: string;
    },
    file: Express.Multer.File,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<IEventDocument> {
    if (requesterRole === ROLES.DEPARTMENT_ADMIN && data.departmentId !== requesterDeptId) {
      throw new AppError('You can only add events to your department', HTTP_STATUS.FORBIDDEN);
    }

    const dept = await departmentRepository.findById(data.departmentId);
    if (!dept) throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);

    const { fileId, fileUrl } = await r2Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'event-images',
    );

    const slug = generateSlug(data.title);

    const createData: Partial<IEventDocument> = {
      title: data.title,
      description: data.description,
      venue: data.venue,
      eventDate: data.eventDate,
      isPublished: data.isPublished ?? false,
      slug,
      featuredImage: fileUrl,
      featuredImageId: fileId,
      departmentId: new Types.ObjectId(data.departmentId),
    };

    const event = await eventRepository.create(createData);
    logger.info(`Event created: ${event.title}`);
    return event;
  }

  async getEvents(
    query: IPaginationQuery,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<IPaginationResult<IEventDocument>> {
    const { page = 1, limit = 20, search, sort = 'eventDate', order = 'asc', departmentId, isPublished } = query;

    const filter: FilterQuery<IEventDocument> = {};

    if (requesterRole === ROLES.DEPARTMENT_ADMIN || requesterRole === ROLES.STUDENT) {
      filter.departmentId = requesterDeptId;
    } else if (departmentId) {
      filter.departmentId = departmentId;
    }

    if (requesterRole === ROLES.STUDENT) {
      filter.isPublished = true;
    } else if (isPublished !== undefined) {
      filter.isPublished = isPublished;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const { data, total } = await eventRepository.findPaginated(filter, page, limit, { [sort]: sortOrder });
    return buildPaginationResult(data, total, page, limit);
  }

  async getEventById(id: string, requesterRole: Role, requesterDeptId?: string): Promise<IEventDocument> {
    const event = await eventRepository.findById(id);
    if (!event) throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);

    if (
      (requesterRole === ROLES.DEPARTMENT_ADMIN || requesterRole === ROLES.STUDENT) &&
      event.departmentId.toString() !== requesterDeptId
    ) {
      throw new AppError('You can only access resources in your department', HTTP_STATUS.FORBIDDEN);
    }

    if (requesterRole === ROLES.STUDENT && !event.isPublished) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    return event;
  }

  async updateEvent(
    id: string,
    data: Partial<{ title: string; description: string; venue: string; eventDate: Date; isPublished: boolean }>,
    file: Express.Multer.File | undefined,
    requesterRole: Role,
    requesterDeptId?: string,
  ): Promise<IEventDocument> {
    const event = await eventRepository.findById(id);
    if (!event) throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && event.departmentId.toString() !== requesterDeptId) {
      throw new AppError('You can only update events in your department', HTTP_STATUS.FORBIDDEN);
    }

    const updateData: Partial<IEventDocument> = {};
    if (data.title) {
      updateData.title = data.title;
      if (data.title !== event.title) updateData.slug = generateSlug(data.title);
    }
    if (data.description) updateData.description = data.description;
    if (data.venue) updateData.venue = data.venue;
    if (data.eventDate) updateData.eventDate = data.eventDate;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    if (file) {
      if (event.featuredImageId) {
        try {
          await r2Service.deleteFile(event.featuredImageId);
        } catch {
          logger.warn(`Failed to delete old event image`);
        }
      }
      const { fileId, fileUrl } = await r2Service.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        'event-images',
      );
      updateData.featuredImage = fileUrl;
      updateData.featuredImageId = fileId;
    }

    const updated = await eventRepository.updateById(id, updateData);
    logger.info(`Event updated: ${id}`);
    return updated!;
  }

  async deleteEvent(id: string, requesterRole: Role, requesterDeptId?: string): Promise<void> {
    const event = await eventRepository.findById(id);
    if (!event) throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);

    if (requesterRole === ROLES.DEPARTMENT_ADMIN && event.departmentId.toString() !== requesterDeptId) {
      throw new AppError('You can only delete events in your department', HTTP_STATUS.FORBIDDEN);
    }

    if (event.featuredImageId) {
      try {
        await r2Service.deleteFile(event.featuredImageId);
      } catch {
        logger.warn(`Failed to delete event image from Drive`);
      }
    }

    await eventRepository.deleteById(id);
    logger.info(`Event deleted: ${id}`);
  }
}

export const eventService = new EventService();
