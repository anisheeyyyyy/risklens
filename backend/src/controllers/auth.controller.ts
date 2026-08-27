import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { signToken } from '../utils/jwt';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please provide a valid work email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (at least 2 characters)'),
  email: z.string().email('Please provide a valid work email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid work email address'),
});

export const AuthController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            message: parseResult.error.errors[0]?.message || 'Invalid input data',
          },
        });
        return;
      }

      const { email, password } = parseResult.data;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const user = await UserModel.authenticateUser(email, password, ip);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            avatarUrl: user.avatar_url,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          },
          token: signToken({ sub: user.id, email: user.email, role: user.role }),
          message: 'Signed in successfully. Session authenticated with Supabase.',
        },
      });
    } catch (err: any) {
      console.error('[AuthController Login Error]:', err.message);
      res.status(401).json({
        success: false,
        error: {
          message: err.message || 'Authentication failed',
        },
      });
    }
  },

  async register(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            message: parseResult.error.errors[0]?.message || 'Invalid input data',
          },
        });
        return;
      }

      const { fullName, email, password, role, avatarUrl } = parseResult.data;

      const user = await UserModel.registerUser({
        fullName,
        email,
        password,
        role: role || 'SecOps Analyst',
        avatarUrl: avatarUrl || undefined,
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            avatarUrl: user.avatar_url,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          },
          token: signToken({ sub: user.id, email: user.email, role: user.role }),
          message: 'Account registered and saved to Supabase PostgreSQL database successfully.',
        },
      });
    } catch (err: any) {
      console.error('[AuthController Register Error]:', err.message);
      res.status(400).json({
        success: false,
        error: {
          message: err.message || 'Registration failed',
        },
      });
    }
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = resetPasswordSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            message: parseResult.error.errors[0]?.message || 'Invalid input data',
          },
        });
        return;
      }

      const { token, newPassword } = parseResult.data;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const user = await UserModel.consumePasswordResetToken(token, newPassword, ip);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
          },
          message: 'Password reset successfully. You can now sign in with your new credentials.',
        },
      });
    } catch (err: any) {
      console.error('[AuthController Reset Password Error]:', err.message);
      res.status(400).json({
        success: false,
        error: {
          message: err.message || 'Password reset failed',
        },
      });
    }
  },

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserModel.findAll();
      res.status(200).json({
        success: true,
        data: users.map((u) => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          avatarUrl: u.avatar_url,
          createdAt: u.created_at,
          updatedAt: u.updated_at,
        })),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message },
      });
    }
  },

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      
      const userId = req.user.id;
      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: { message: 'User not found in Supabase database' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message },
      });
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    try {
      if (req.user && req.user.id) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
        await UserModel.recordLogout(req.user.id, ip);
      }
      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
        message: 'Logged out successfully',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  async switchUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId, email } = req.body;
      let user = null;
      if (userId) {
        user = await UserModel.findById(userId);
      } else if (email) {
        user = await UserModel.findByEmail(email);
      }

      if (!user) {
        res.status(404).json({ success: false, error: { message: 'Target user not found' } });
        return;
      }

      const token = signToken({ sub: user.id, email: user.email, role: user.role });
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            avatarUrl: user.avatar_url,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          },
          token,
          message: `Switched session to ${user.full_name} (${user.role}).`,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = forgotPasswordSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: { message: parseResult.error.errors[0]?.message || 'Invalid input data' },
        });
        return;
      }
      
      const { email } = parseResult.data;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      
      const { devLink } = await UserModel.createPasswordResetToken(email, ip);
      
      res.status(200).json({
        success: true,
        data: {
          message: 'Password reset instructions have been sent to your email.',
          devLink, // Exposed for demo purposes
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },
};
