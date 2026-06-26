import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import studentRoutes from './student.routes';
import departmentRoutes from './department.routes';
import lecturerRoutes from './lecturer.routes';
import publicationRoutes from './publication.routes';
import lectureNoteRoutes from './lectureNote.routes';
import newsRoutes from './news.routes';
import eventRoutes from './event.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/departments', departmentRoutes);
router.use('/lecturers', lecturerRoutes);
router.use('/publications', publicationRoutes);
router.use('/lecture-notes', lectureNoteRoutes);
router.use('/news', newsRoutes);
router.use('/events', eventRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
