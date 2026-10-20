import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        companyCode?: string;
        id?: number | string;
        role?: string;
        [key: string]: unknown;
      };
    }
  }
}

export {};
