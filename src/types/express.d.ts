import { IAuthUser } from '../interfaces/auth.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
      file?: Express.Multer.File;
    }
  }
}

export {};
