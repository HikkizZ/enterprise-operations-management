import type { User } from '../../entity/user.entity.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
