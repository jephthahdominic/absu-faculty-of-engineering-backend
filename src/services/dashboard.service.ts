import { UserModel } from '../models/user.model';
import { StudentModel } from '../models/student.model';
import { DepartmentModel } from '../models/department.model';
import { LecturerModel } from '../models/lecturer.model';
import { PublicationModel } from '../models/publication.model';
import { LectureNoteModel } from '../models/lectureNote.model';
import { NewsModel } from '../models/news.model';
import { EventModel } from '../models/event.model';
import { ROLES, Role } from '../constants/roles';

interface SuperAdminStats {
  departments: number;
  departmentAdmins: number;
  students: number;
  lecturers: number;
  publications: number;
  lectureNotes: number;
  news: number;
  events: number;
}

interface DepartmentAdminStats {
  students: number;
  lecturers: number;
  publications: number;
  lectureNotes: number;
  news: number;
  events: number;
}

class DashboardService {
  async getStats(role: Role, departmentId?: string): Promise<SuperAdminStats | DepartmentAdminStats> {
    if (role === ROLES.SUPER_ADMIN || role === ROLES.DEAN) {
      return this.getSuperAdminStats();
    }
    return this.getDepartmentAdminStats(departmentId!);
  }

  private async getSuperAdminStats(): Promise<SuperAdminStats> {
    const [departments, departmentAdmins, students, lecturers, publications, lectureNotes, news, events] =
      await Promise.all([
        DepartmentModel.countDocuments(),
        UserModel.countDocuments({ role: ROLES.DEPARTMENT_ADMIN }),
        StudentModel.countDocuments(),
        LecturerModel.countDocuments(),
        PublicationModel.countDocuments(),
        LectureNoteModel.countDocuments(),
        NewsModel.countDocuments(),
        EventModel.countDocuments(),
      ]);

    return { departments, departmentAdmins, students, lecturers, publications, lectureNotes, news, events };
  }

  private async getDepartmentAdminStats(departmentId: string): Promise<DepartmentAdminStats> {
    const filter = { departmentId };
    const [students, lecturers, publications, lectureNotes, news, events] = await Promise.all([
      StudentModel.countDocuments(filter),
      LecturerModel.countDocuments(filter),
      PublicationModel.countDocuments(filter),
      LectureNoteModel.countDocuments(filter),
      NewsModel.countDocuments(filter),
      EventModel.countDocuments(filter),
    ]);

    return { students, lecturers, publications, lectureNotes, news, events };
  }
}

export const dashboardService = new DashboardService();
