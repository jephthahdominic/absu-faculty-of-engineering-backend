import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { AssignmentModel } from '../models/assignment.model';
import { SubmissionModel } from '../models/submission.model';
import { IAssignmentDocument, ISubmissionDocument } from '../interfaces/assignment.interface';

export class AssignmentRepository extends BaseRepository<IAssignmentDocument> {
  constructor() {
    super(AssignmentModel);
  }

  async findById(id: string): Promise<IAssignmentDocument | null> {
    return AssignmentModel.findById(id).populate('lecturerId').populate('departmentIds').exec();
  }

  async findPaginated(
    filter: FilterQuery<IAssignmentDocument>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: IAssignmentDocument[]; total: number }> {
    return this.paginate(filter, page, limit, sort, ['lecturerId', 'departmentIds']);
  }
}

export class SubmissionRepository extends BaseRepository<ISubmissionDocument> {
  constructor() {
    super(SubmissionModel);
  }

  async findByAssignmentAndStudent(assignmentId: string, studentId: string): Promise<ISubmissionDocument | null> {
    return SubmissionModel.findOne({ assignmentId, studentId }).exec();
  }

  async findByAssignment(assignmentId: string): Promise<ISubmissionDocument[]> {
    return SubmissionModel.find({ assignmentId })
      .populate('studentId', 'fullName matricNumber email level departmentId')
      .sort({ submittedAt: -1 })
      .exec();
  }

  async findByStudentAndAssignments(studentId: string, assignmentIds: string[]): Promise<ISubmissionDocument[]> {
    return SubmissionModel.find({ studentId, assignmentId: { $in: assignmentIds } }).exec();
  }

  async countByAssignments(assignmentIds: string[]): Promise<Record<string, number>> {
    const rows = await SubmissionModel.aggregate<{ _id: unknown; count: number }>([
      { $match: { assignmentId: { $in: assignmentIds.map((id) => new Types.ObjectId(id)) } } },
      { $group: { _id: '$assignmentId', count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((r) => [String(r._id), r.count]));
  }

  async findByIdPopulated(id: string): Promise<ISubmissionDocument | null> {
    return SubmissionModel.findById(id)
      .populate('studentId', 'fullName matricNumber email level departmentId')
      .exec();
  }

  async deleteByAssignment(assignmentId: string): Promise<ISubmissionDocument[]> {
    const subs = await SubmissionModel.find({ assignmentId }).exec();
    await SubmissionModel.deleteMany({ assignmentId }).exec();
    return subs;
  }
}

export const assignmentRepository = new AssignmentRepository();
export const submissionRepository = new SubmissionRepository();
