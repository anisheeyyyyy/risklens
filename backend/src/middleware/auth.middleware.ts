import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { verifyToken } from '../utils/jwt';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  // Allow X-Dev-Token for Quick Switch (Demo/Dev only)
  const devToken = req.headers['x-dev-token'] as string;
  if (devToken && process.env.NODE_ENV !== 'production') {
     // Wait, the plan states Quick Switch shouldn't bypass JWT on protected endpoints in production.
     // But for dev, we can let it pass if we decide, or we just rely on the frontend 
     // doing a real login under the hood for Quick Switch.
     // The frontend `LoginModal` does a real `login` using the demo passwords.
     // So we don't need a backdoor dev token. The frontend will have a real JWT!
  }
  return null;
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    // You could fetch from DB if you need latest fields, 
    // but JWT payload has enough for basic auth
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      fullName: 'User', // We can fetch from DB if needed, or rely on token
      role: decoded.role,
    };
    
    // Optionally fetch full user to get avatar, exact name, etc.
    const dbUser = await UserModel.findById(decoded.sub);
    if (dbUser) {
      req.user.fullName = dbUser.full_name;
      req.user.avatarUrl = dbUser.avatar_url;
      req.user.role = dbUser.role; // sync role
    }
  } catch (e) {
    // Invalid token, just proceed as unauthenticated
  }

  next();
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req);
  
  if (!token) {
    res.status(401).json({ success: false, error: { message: 'Authentication required' } });
    return;
  }

  try {
    const decoded = verifyToken(token);
    const dbUser = await UserModel.findById(decoded.sub);
    
    if (!dbUser) {
      res.status(401).json({ success: false, error: { message: 'User no longer exists' } });
      return;
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.full_name,
      role: dbUser.role,
      avatarUrl: dbUser.avatar_url,
    };
    
    next();
  } catch (e) {
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Authentication required' } });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { message: 'Insufficient permissions' } });
      return;
    }

    next();
  };
};
