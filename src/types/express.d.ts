import "express";

declare global {
  namespace Express {
    interface User {
      companyCode?: string;
      [key: string]: any;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
