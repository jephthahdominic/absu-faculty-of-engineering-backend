import { academicSessionRepository } from '../repositories/academicSession.repository';
import { StudentModel } from '../models/student.model';
import { IAcademicSessionResponse } from '../interfaces/academicSession.interface';
import { AppError } from './auth.service';
import { HTTP_STATUS } from '../constants/httpStatus';
import { logger } from '../utils/logger.util';

class AcademicSessionService {
  private mapToResponse(doc: { _id: unknown; session: string; startYear: number; isActive: boolean; updatedBy: string; createdAt?: Date; updatedAt?: Date }): IAcademicSessionResponse {
    return {
      _id: (doc._id as { toString(): string }).toString(),
      session: doc.session,
      startYear: doc.startYear,
      isActive: doc.isActive,
      updatedBy: doc.updatedBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Parse a session string "YYYY/YYYY" and return the start year.
   * Validates format and that end year = start year + 1.
   */
  parseSession(session: string): number {
    const match = /^(\d{4})\/(\d{4})$/.exec(session.trim());
    if (!match) {
      throw new AppError(
        'Session must be in format YYYY/YYYY (e.g. 2026/2027)',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    const startYear = parseInt(match[1], 10);
    const endYear = parseInt(match[2], 10);
    if (endYear !== startYear + 1) {
      throw new AppError(
        'Session end year must be exactly one year after start year',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    return startYear;
  }

  /**
   * Compute a student's level from their matric number and the session start year.
   * Matric format: YYYY/XXXXXX/type  (e.g. 2021/000001/regular)
   * Level = (sessionStartYear - matricEntryYear) * 100, clamped to [100, 500].
   */
  private computeLevel(matricNumber: string, sessionStartYear: number): string {
    const entryYear = parseInt(matricNumber.split('/')[0], 10);
    if (isNaN(entryYear)) return '100';
    const diff = sessionStartYear - entryYear;
    const raw = diff * 100;
    const clamped = Math.max(100, Math.min(500, raw));
    return String(clamped);
  }

  async updateSession(session: string, updatedById: string): Promise<IAcademicSessionResponse> {
    const startYear = this.parseSession(session);

    const sessionDoc = await academicSessionRepository.upsertActive(session, startYear, updatedById);

    // Recalculate all students' levels
    const allStudents = await StudentModel.find({}).exec();
    const bulkOps = allStudents.map((student) => ({
      updateOne: {
        filter: { _id: student._id },
        update: { $set: { level: this.computeLevel(student.matricNumber, startYear) } },
      },
    }));

    if (bulkOps.length > 0) {
      await StudentModel.bulkWrite(bulkOps);
      logger.info(`Updated levels for ${bulkOps.length} students for session ${session}`);
    }

    logger.info(`Academic session updated to ${session} by ${updatedById}`);
    return this.mapToResponse(sessionDoc);
  }

  async getCurrentSession(): Promise<IAcademicSessionResponse | null> {
    const doc = await academicSessionRepository.findActive();
    return doc ? this.mapToResponse(doc) : null;
  }
}

export const academicSessionService = new AcademicSessionService();
