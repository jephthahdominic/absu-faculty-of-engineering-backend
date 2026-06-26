import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { LectureNoteModel } from '../models/lectureNote.model';
import { ILectureNoteDocument } from '../interfaces/lectureNote.interface';

export class LectureNoteRepository extends BaseRepository<ILectureNoteDocument> {
  constructor() {
    super(LectureNoteModel);
  }

  async findPaginated(
    filter: FilterQuery<ILectureNoteDocument>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: ILectureNoteDocument[]; total: number }> {
    return this.paginate(filter, page, limit, sort, ['lecturerId', 'departmentId']);
  }
}

export const lectureNoteRepository = new LectureNoteRepository();
