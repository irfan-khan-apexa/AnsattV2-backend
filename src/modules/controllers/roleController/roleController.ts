import { Request, Response } from "express";
import {Role} from "../../models/index";
import { PERMISSION_REGISTRY } from "../../../middlewares/checkPermission";

/* CREATE ROLE */
 const createRole = async (req: Request, res: Response):Promise<any> => {
  try {
    const user: any = (req as any).user;
    const { name, type, permissions,company_code  } = req.body;
    

    if (!name || !type || !permissions ||!company_code) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const role = await Role.create({
      name,
      type,
      permissions,
      // company_code: type === "SUPER_ADMIN" ? null : user.company_code,
      company_code,
    });

    return res.status(201).json({ data: role });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

/* GET ROLES */
 const getRoles = async (req: Request, res: Response) :Promise<any>=> {
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

/* GET SINGLE ROLE */
 const getRoleById = async (req: Request, res: Response):Promise<any> => {
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

/* UPDATE ROLE */
 const updateRole = async (req: Request, res: Response):Promise<any> => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await role.update(req.body);

    return res.status(200).json({ data: role });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

/* DELETE ROLE */
 const deleteRole = async (req: Request, res: Response):Promise<any> => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await role.destroy();
    return res.status(200).json({ message: "Role deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

/* GET PERMISSION REGISTRY */
 const getPermissionRegistry = async (_: Request, res: Response):Promise<any> => {
  return res.status(200).json({ data: PERMISSION_REGISTRY });
};

export {createRole,getRoles,getRoleById,updateRole,deleteRole,getPermissionRegistry}