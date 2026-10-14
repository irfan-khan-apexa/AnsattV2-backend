import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateRequest = <T>(schema: ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validation = schema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.flatten(),
      });

      return;
    }

    req.body = validation.data;

    next();
  };
};
