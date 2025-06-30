import { Request, Response } from "express";
import { RoleModulePermission, Module } from "../../models/index";

const createRoleModulePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { role_id, module_id, can_read, can_create, can_update, can_delete } =
      req.body;

    if (!role_id || !module_id) {
      return res
        .status(400)
        .json({ message: "role_id and module_id are required" });
    }

    const permission = await RoleModulePermission.create({
      role_id,
      module_id,
      can_read: can_read || false,
      can_create: can_create || false,
      can_update: can_update || false,
      can_delete: can_delete || false,
    });

    res.status(201).json({ message: "Permission assigned", permission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error assigning permission" });
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

export { createRoleModulePermission, getRolePermissions };
