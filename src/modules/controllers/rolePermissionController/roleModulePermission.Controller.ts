import { Request, Response } from "express";
import { RoleModulePermission, Module, Role } from "../../models/index";

const createRoleModulePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { role_id, permissions } = req.body;

    // ✅ Check if role_id exists in Roles table
    const role = await Role.findByPk(role_id);
    if (!role) {
      return res
        .status(400)
        .json({ message: "Invalid role_id: Role does not exist" });
    }

    if (
      !permissions ||
      (Array.isArray(permissions) && permissions.length === 0)
    ) {
      return res
        .status(400)
        .json({ message: "At least one permission is required" });
    }

    let createdPermissions;

    // ✅ Bulk create if permissions is array
    if (Array.isArray(permissions)) {
      const bulkData = permissions.map((perm: any) => ({
        role_id,
        module_id: perm.module_id,
        can_read: perm.can_read || false,
        can_create: perm.can_create || false,
        can_update: perm.can_update || false,
        can_delete: perm.can_delete || false,
      }));

      createdPermissions = await RoleModulePermission.bulkCreate(bulkData);
    }
    // ✅ Single object create
    else {
      const { module_id, can_read, can_create, can_update, can_delete } =
        permissions;

      createdPermissions = await RoleModulePermission.create({
        role_id,
        module_id,
        can_read: can_read || false,
        can_create: can_create || false,
        can_update: can_update || false,
        can_delete: can_delete || false,
      });
    }

    res.status(201).json({
      message: "Permission(s) assigned successfully",
      createdPermissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error assigning permissions" });
  }
};
const getRolePermissions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { role_id } = req.params;

    if (!role_id) {
      return res.status(400).json({ message: "Role ID is required" });
    }

    const permissions = await RoleModulePermission.findAll({
      where: { role_id },
      include: [{ model: Module, attributes: ["name"] }],
    });

    res.status(200).json({ permissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching permissions" });
  }
};
const updateRoleModulePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { role_id } = req.params;
    const { can_read, can_create, can_update, can_delete } = req.body;

    // ✅ 1. Check if permission exists
    const permission = await RoleModulePermission.findByPk(role_id);

    if (!permission) {
      return res.status(404).json({ message: "Permission record not found" });
    }

    // ✅ 2. Check if the Role for this permission exists
    const role = await Role.findByPk(permission.role_id);
    if (!role) {
      return res.status(400).json({
        message: "Associated role does not exist for this permission",
      });
    }

    // ✅ 3. Proceed with update
    permission.can_read =
      can_read !== undefined ? can_read : permission.can_read;
    permission.can_create =
      can_create !== undefined ? can_create : permission.can_create;
    permission.can_update =
      can_update !== undefined ? can_update : permission.can_update;
    permission.can_delete =
      can_delete !== undefined ? can_delete : permission.can_delete;

    await permission.save();

    res
      .status(200)
      .json({ message: "Permission updated successfully", permission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating permission" });
  }
};

const deleteRoleModulePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { role_id } = req.params;

    const permission = await RoleModulePermission.findByPk(role_id);
    if (!permission) {
      return res.status(404).json({ message: "Permission record not found" });
    }

    await permission.destroy();

    res.status(200).json({ message: "Permission deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting permission" });
  }
};

export {
  createRoleModulePermission,
  getRolePermissions,
  updateRoleModulePermission,
  deleteRoleModulePermission,
};
