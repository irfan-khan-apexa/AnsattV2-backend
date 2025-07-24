import { Request, Response } from "express";
import {
  Module,
  Role,
  RoleModulePermission,
  Permission,
} from "../../models/index";

// const createRole = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { name, description } = req.body;

//     if (!name || typeof name !== "string") {
//       return res
//         .status(400)
//         .json({ message: "Role name (string) is required" });
//     }

//     const existing = await Role.findOne({ where: { name } });
//     if (existing) {
//       return res.status(409).json({ message: "Role name already exists" });
//     }

//     const role = await Role.create({ name, description });

//     res.status(201).json({ message: "Role created successfully", role });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error while creating role" });
//   }
// };
// const createRole = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { name, description, permissions = [] } = req.body;

//     const existing = await Role.findOne({ where: { name } });
//     if (existing) {
//       return res.status(409).json({ message: "Role name already exists" });
//     }

//     const role = await Role.create({ name, description });

//     for (const perm of permissions) {
//       if (!perm.moduleId) continue;

//       await RoleModulePermission.create({
//         role_id: role.id,
//         module_id: perm.moduleId,
//         can_create: perm.canCreate || false,
//         can_read: perm.canRead || false,
//         can_update: perm.canUpdate || false,
//         can_delete: perm.canDelete || false,
//       });
//     }

//     // 🔁 Re-fetch with associations
//     const roleWithPermissions = await Role.findByPk(role.id, {
//       include: [
//         {
//           model: RoleModulePermission,
//           include: [Module], // 👈 includes module details inside each permission
//         },
//       ],
//     });

//     res.status(201).json({
//       message: "Role created with permissions",
//       role: roleWithPermissions,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error while creating role" });
//   }
// };

// const createRole = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { name, description, permissions = [] } = req.body;

//     if (!name || typeof name !== "string") {
//       return res
//         .status(400)
//         .json({ message: "Role name (string) is required" });
//     }

//     const existing = await Role.findOne({ where: { name } });
//     if (existing) {
//       return res.status(409).json({ message: "Role name already exists" });
//     }

//     // ✅ Step 1: Create Role
//     const role = await Role.create({ name, description });

//     // ✅ Step 2: Validate and Insert Permissions
//     for (const perm of permissions) {
//       if (!perm.moduleId) continue;

//       // 🔍 Check if module exists
//       const module = await Module.findByPk(perm.moduleId);
//       if (!module) {
//         return res.status(404).json({
//           message: `Module with ID ${perm.moduleId} does not exist`,
//         });
//       }

//       await RoleModulePermission.create({
//         role_id: role.id,
//         module_id: perm.moduleId,
//         can_create: perm.canCreate || false,
//         can_read: perm.canRead || false,
//         can_update: perm.canUpdate || false,
//         can_delete: perm.canDelete || false,
//       });
//     }

//     // ✅ Step 3: Re-fetch Role with its Permissions and Modules
//     const roleWithPermissions = await Role.findByPk(role.id, {
//       include: [
//         {
//           model: RoleModulePermission,
//           include: [Module],
//         },
//       ],
//     });

//     res.status(201).json({
//       message: "Role created with permissions",
//       role: roleWithPermissions,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error while creating role" });
//   }
// };
const createRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, permissions = [] } = req.body;

    if (!name) return res.status(400).json({ message: "Role name required" });

    const existing = await Role.findOne({ where: { name } });
    if (existing)
      return res.status(409).json({ message: "Role already exists" });

    const role = await Role.create({ name, description });

    // ✅ Fetch all master permission fields
    const availablePermissions = await Permission.findAll();
    const allFields = availablePermissions.map((p) => p.field);

    // ✅ Save each module's permissions
    for (const permObj of permissions) {
      const { moduleId, ...fields } = permObj;

      const module = await Module.findByPk(moduleId);
      if (!module)
        return res
          .status(400)
          .json({ message: `Module ${moduleId} not found` });

      const permissionData: any = {
        role_id: role.id,
        module_id: moduleId,
      };

      for (const field of allFields) {
        permissionData[field] = fields[field] ?? false;
      }

      await RoleModulePermission.create(permissionData);
    }

    const roleWithPermissions = await Role.findByPk(role.id, {
      include: [{ model: RoleModulePermission, include: [Module] }],
    });

    res.status(201).json({
      message: "Role created with dynamic permissions",
      role: roleWithPermissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating role" });
  }
};

// ✅ Get All Roles
const getAllRoles = async (req: Request, res: Response): Promise<any> => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: RoleModulePermission,
          include: [Module],
        },
      ],
    });

    res.status(200).json({ roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching roles" });
  }
};

const updateRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, description, permissions = [] } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // ✅ Update name & description
    if (name) role.name = name;
    if (description) role.description = description;
    await role.save();

    // ✅ Remove old permissions
    await RoleModulePermission.destroy({ where: { role_id: role.id } });

    // ✅ Add new permissions
    for (const perm of permissions) {
      if (!perm.moduleId) continue;

      const module = await Module.findByPk(perm.moduleId);
      if (!module) {
        return res.status(404).json({
          message: `Module with ID ${perm.moduleId} does not exist`,
        });
      }

      await RoleModulePermission.create({
        role_id: role.id,
        module_id: perm.moduleId,
        can_create: perm.canCreate || false,
        can_read: perm.canRead || false,
        can_update: perm.canUpdate || false,
        can_delete: perm.canDelete || false,
      });
    }

    // ✅ Re-fetch updated role with permissions
    const updatedRole = await Role.findByPk(role.id, {
      include: [
        {
          model: RoleModulePermission,
          include: [Module],
        },
      ],
    });

    res.status(200).json({
      message: "Role updated successfully",
      role: updatedRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating role" });
  }
};

const deleteRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // ✅ Delete related permissions
    await RoleModulePermission.destroy({ where: { role_id: id } });

    // ✅ Delete role itself
    await Role.destroy({ where: { id } });

    res.status(200).json({ message: "Role and related permissions deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting role" });
  }
};

export { createRole, getAllRoles, updateRole, deleteRole };
