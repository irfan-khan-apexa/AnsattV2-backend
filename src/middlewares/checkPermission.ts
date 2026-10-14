import { Role } from "../modules/models";

export const PERMISSION_REGISTRY = {
  asset: ["read", "create", "update", "delete"],
  department: ["read", "create", "update", "delete"],
  employee: ["read", "create", "update", "delete"],
  exitRequest: ["read", "create", "update", "delete"],
  leaves: ["read", "create", "update", "delete"],
  onboarding: ["read", "create", "update", "delete"],
  policy: ["read", "create", "update", "delete"],
  salary: [
    "read",
    "create",
    "update",
    "delete",
    "download",
    "bulk_upload",
    "export",
  ],
  hrAnnouncement: ["read", "create", "update", "delete"],
  roles: ["read", "create", "update", "delete"],
};

export const authorizePermission = (module: string, action: string) => {
  return (req: any, res: any, next: any) => {
    const permissions = req.user?.permissions;
    if (!permissions?.[module]?.includes(action)) {
      return res.status(403).json({
        message: "permission denied",
      });
    }
    next();
  };
};

// export const authorizeOwnEmployeeResource = async (
//   req: any,
//   res: any,
//   next: any,
// ) => {
//   try {
//     const { role_id, company_code, id } = req.user;

//     const role = await Role.findOne({
//       where: {
//         id: role_id,
//         company_code,
//       },
//     });

//     if (!role) {
//       return res.status(403).json({
//         message: "Role not found",
//       });
//     }
//     const roleType = role.get("type");
//     if (roleType === "EMPLOYEE") {
//       if (String(id) !== String(req.params.employee_id)) {
//         return res.status(403).json({
//           message: "You can access only your own salaray",
//         });
//       }
//     }
//     next();
//   } catch (error) {
//     return res.status(500).json({
//       message: "Authorizattion failed",
//     });
//   }
// };
