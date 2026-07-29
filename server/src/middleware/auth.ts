import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Clerk requires CLERK_SECRET_KEY in the environmentt.
export const requireAuth = ClerkExpressRequireAuth({
  // options if any
}) as unknown as RequestHandler;

export const authErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'UnauthorizedError' || err.message?.includes('Unauthenticated')) {
    res.status(401).json({ error: { message: 'Unauthorized: Invalid or expired token' } });
  } else {
    next(err);
  }
};
