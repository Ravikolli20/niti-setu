import type { AuthTokenPayload } from '../models/auth.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
