import { BaseRepository } from './base.repository';
import { AcademicSessionModel } from '../models/academicSession.model';
import { IAcademicSessionDocument } from '../interfaces/academicSession.interface';

class AcademicSessionRepository extends BaseRepository<IAcademicSessionDocument> {
  constructor() {
    super(AcademicSessionModel);
  }

  async findActive(): Promise<IAcademicSessionDocument | null> {
    return AcademicSessionModel.findOne({ isActive: true }).exec();
  }

  async upsertActive(
    session: string,
    startYear: number,
    updatedBy: string,
  ): Promise<IAcademicSessionDocument> {
    return AcademicSessionModel.findOneAndUpdate(
      { isActive: true },
      { session, startYear, updatedBy, isActive: true },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).exec() as Promise<IAcademicSessionDocument>;
  }
}

export const academicSessionRepository = new AcademicSessionRepository();
