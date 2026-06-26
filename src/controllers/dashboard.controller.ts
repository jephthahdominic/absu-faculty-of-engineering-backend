import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { Role } from '../constants/roles';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await dashboardService.getStats(
    req.user!.role as Role,
    req.user!.departmentId?.toString(),
  );
  sendSuccess(res, 'Dashboard statistics fetched successfully', stats);
});
