import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthenticatedRequest extends Request {
  user?: any;
}
export interface CompanyRequest extends Request {
  user?: any;
}

// export interface AuthenticatedRequest extends Request {
//   user?: any;
// }

export const authenticateSuperMaster = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return Promise.resolve(res.status(401).json({ message: "Token missing" }));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    if ((decoded as any).role !== "super_master") {
      return Promise.resolve(
        res.status(403).json({ message: "Forbidden: Not a super master" })
      );
    }
    req.user = decoded;
    next();
    return Promise.resolve();
  } catch (err) {
    return Promise.resolve(res.status(401).json({ message: "Invalid token" }));
  }
};

export const authenticateCompanyMaster = (
  req: CompanyRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return Promise.resolve(res.status(401).json({ message: "Token missing" }));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    if ((decoded as any).role !== "company_master") {
      return Promise.resolve(
        res.status(403).json({ message: "Forbidden: Not a company master" })
      );
    }

    req.user = decoded;
    next();
    return Promise.resolve();
  } catch (err) {
    return Promise.resolve(res.status(401).json({ message: "Invalid token" }));
  }
};

export const authenticateEmployee = (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return Promise.resolve(
      res.status(401).json({ message: "No token provided" })
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    (req as any).user = decoded; // ✅ attach user to request
    next();
    return Promise.resolve();
  } catch (err) {
    return Promise.resolve(res.status(401).json({ message: "Invalid token" }));
  }
};

// export const authenticateRole = (allowedRoles: string[]) => {
//   return (
//     req: AuthenticatedRequest,
//     res: Response,
//     next: NextFunction
//   ): Promise<any> => {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return Promise.resolve(
//         res.status(401).json({ message: "Token missing" })
//       );
//     }

//     try {
//       const decoded = jwt.verify(token, config.jwt.secret);
//       const role = (decoded as any).role;

//       // Reject if role is not allowed
//       if (!allowedRoles.includes(role)) {
//         switch (role) {
//           case "company_master":
//             return Promise.resolve(
//               res
//                 .status(403)
//                 .json({ message: "Forbidden: Not a company master" })
//             );
//           case "super_master":
//             return Promise.resolve(
//               res.status(403).json({ message: "Forbidden: Not a super master" })
//             );
//           default:
//             return Promise.resolve(
//               res.status(403).json({ message: "Forbidden: Unauthorized role" })
//             );
//         }
//       }

//       req.user = decoded;
//       next();
//       return Promise.resolve();
//     } catch (err) {
//       return Promise.resolve(
//         res.status(401).json({ message: "Invalid token" })
//       );
//     }
//   };
// };
