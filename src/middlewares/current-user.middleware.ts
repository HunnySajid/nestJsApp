/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-namespace */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

declare global {
  namespace Express {
    interface Request {
      currentUser?: Partial<User>;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // @ts-ignore
    const { userId } = req.session || {};

    if (userId) {
      const user = this.usersService.findById(userId);
      // @ts-ignore
      req.currentUser = user;
    }

    next();
  }
}
