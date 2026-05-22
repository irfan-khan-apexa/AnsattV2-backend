// import { Request, Response } from "express";
// import {CompanySettings, Role} from "../../models/index";
// import { PERMISSION_REGISTRY } from "../../../middlewares/checkPermission";

// //  const createRole = async (req: Request, res: Response):Promise<any> => {
// //   try {
// //     const user: any = (req as any).user;
// //     const { name, type, permissions,company_code  } = req.body;
    

// //     if (!name || !type || !permissions ||!company_code) {
// //       return res.status(400).json({ message: "Missing fields" });
// //     }

// //     const role = await Role.create({
// //       name,
// //       type,
// //       permissions,
// //       // company_code: type === "SUPER_ADMIN" ? null : user.company_code,
// //       company_code,
// //     });

// //     return res.status(201).json({ data: role });
// //   } catch (err: any) {
// //     return res.status(500).json({ message: err.message });
// //   }
// // };
// // const createRole = async (req: Request, res: Response): Promise<any> => {
// //   try {
// //     const user: any = (req as any).user;
// //     const { name, type, permissions, company_code } = req.body;

// //     if (!name || !type || !permissions || !company_code) {
// //       return res.status(400).json({ message: "Missing fields" });
// //     }

// //     // 🔥 1. Load company settings
// //     const settings = await CompanySettings.findOne({
// //       where: { company_code },
// //       raw: true,
// //     });

// //     if (!settings || !settings.permissions) {
// //       return res.status(400).json({
// //         message: "Company permissions not configured",
// //       });
// //     }

// //     const companyPermissions: Record<string, string[]> =
// //       settings.permissions;

// //     // 🔥 2. VALIDATE role permissions ⊆ company permissions
// //     for (const module of Object.keys(permissions)) {
// //       // module allowed?
// //       if (!companyPermissions[module]) {
// //         return res.status(400).json({
// //           message: `Module '${module}' not allowed for this company`,
// //         });
// //       }

// //       for (const action of permissions[module]) {
// //         if (!companyPermissions[module].includes(action)) {
// //           return res.status(400).json({
// //             message: `Action '${action}' not allowed on module '${module}'`,
// //           });
// //         }
// //       }
// //     }

// //     // 🔥 3. Create role
// //     const role = await Role.create({
// //       name,
// //       type,
// //       permissions,
// //       company_code,
// //     });

// //     return res.status(201).json({ data: role });
// //   } catch (err: any) {
// //     return res.status(500).json({ message: err.message });
// //   }
// // };

// const createRole = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const user: any = (req as any).user;

//     const company_code = user.company_code;

//     const { name, type, permissions } = req.body;

//     if (!name || !type || !permissions) {
//       return res.status(400).json({ message: "Missing fields" });
//     }

//     const settings = await CompanySettings.findOne({
//       where: { company_code },
//       raw: true,
//     });

//     if (!settings || !settings.permissions) {
//       return res.status(400).json({
//         message: "Company permissions not configured",
//       });
//     }

//     const companyPermissions: Record<string, string[]> = settings.permissions;

//     for (const module of Object.keys(permissions)) {
//       if (!companyPermissions[module]) {
//         return res.status(400).json({
//           message: `Module '${module}' not allowed for this company`,
//         });
//       }

//       for (const action of permissions[module]) {
//         if (!companyPermissions[module].includes(action)) {
//           return res.status(400).json({
//             message: `Action '${action}' not allowed on module '${module}'`,
//           });
//         }
//       }
//     }

//     const role = await Role.create({
//       name,
//       type,
//       permissions,
//       company_code, 
//     });

//     return res.status(201).json({ data: role });
//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };


//  const getRoles = async (req: Request, res: Response) :Promise<any>=> {
//   try {
//     const user: any = (req as any).user;

//     const where =
//       user.role === "super_master"
//         ? {}
//         : { company_code: user.company_code };

//     const roles = await Role.findAll({ where });

//     return res.status(200).json({ data: roles });
//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };

//  const getRoleById = async (req: Request, res: Response):Promise<any> => {
//   try {
//     const role = await Role.findByPk(req.params.id);
//     if (!role) {
//       return res.status(404).json({ message: "Role not found" });
//     }
//     return res.status(200).json({ data: role });
//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };

//  const updateRole = async (req: Request, res: Response):Promise<any> => {
//   try {
//     const role = await Role.findByPk(req.params.id);
//     if (!role) {
//       return res.status(404).json({ message: "Role not found" });
//     }

//     await role.update(req.body);

//     return res.status(200).json({ data: role });
//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };

//  const deleteRole = async (req: Request, res: Response):Promise<any> => {
//   try {
//     const role = await Role.findByPk(req.params.id);
//     if (!role) {
//       return res.status(404).json({ message: "Role not found" });
//     }

//     await role.destroy();
//     return res.status(200).json({ message: "Role deleted" });
//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };

//  const getPermissionRegistry = async (_: Request, res: Response):Promise<any> => {
//   return res.status(200).json({ data: PERMISSION_REGISTRY });
// };

// export {createRole,getRoles,getRoleById,updateRole,deleteRole,getPermissionRegistry}

import { Request, Response } from "express";
import { CompanySettings, Role } from "../../models/index";
import { PERMISSION_REGISTRY } from "../../../middlewares/checkPermission";
import { audit } from "../../../helpers/audit.helper"; // 🔥 ADDED

const createRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const user: any = (req as any).user;

    const company_code = user.company_code;

    const { name, type, permissions } = req.body;

    if (!name || !type || !permissions) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const settings = await CompanySettings.findOne({
      where: { company_code },
      raw: true,
    });

    if (!settings || !settings.permissions) {
      return res.status(400).json({
        message: "Company permissions not configured",
      });
    }

    const companyPermissions: Record<string, string[]> = settings.permissions;

    for (const module of Object.keys(permissions)) {
      if (!companyPermissions[module]) {
        return res.status(400).json({
          message: `Module '${module}' not allowed for this company`,
        });
      }

      for (const action of permissions[module]) {
        if (!companyPermissions[module].includes(action)) {
          return res.status(400).json({
            message: `Action '${action}' not allowed on module '${module}'`,
          });
        }
      }
    }

    const role = await Role.create({
      name,
      type,
      permissions,
      company_code, 
    });

    // 🔥 AUDIT
    await audit(req, {
      module: "role",
      action: "create",
      record_id: role.id,
      new_value: role.toJSON(),
    });

    return res.status(201).json({ data: role });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


const getRoles = async (req: Request, res: Response): Promise<any> => {
  try {
    const user: any = (req as any).user;

    const where =
      user.role === "super_master"
        ? {}
        : { company_code: user.company_code };

    const roles = await Role.findAll({ where });

    return res.status(200).json({ data: roles });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

const getRoleById = async (req: Request, res: Response): Promise<any> => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    return res.status(200).json({ data: role });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

const updateRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const oldData = role.toJSON(); // 🔥

    await role.update(req.body);

    // 🔥 AUDIT
    await audit(req, {
      module: "role",
      action: "update",
      record_id: role.id,
      old_value: oldData,
      new_value: role.toJSON(),
    });

    return res.status(200).json({ data: role });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const oldData = role.toJSON(); // 🔥

    await role.destroy();

    // 🔥 AUDIT
    await audit(req, {
      module: "role",
      action: "delete",
      record_id: oldData.id,
      old_value: oldData,
    });

    return res.status(200).json({ message: "Role deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

const getPermissionRegistry = async (_: Request, res: Response): Promise<any> => {
  return res.status(200).json({ data: PERMISSION_REGISTRY });
};

export {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getPermissionRegistry
};