// src/modules/users/controllers/SuperMaster.Controller.ts

import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { SuperMaster } from "../models/SuperMaster.model";
import { SuperMaster } from "../../models/index";
import { Company } from "../../models/index";

const signupSuperMaster = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { name, email, password } = req.body;

  try {
    const existing = await SuperMaster.findOne({ where: { email } });

    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // const newUser = await SuperMaster.create({
    //   name,
    //   email,
    //   password: hashedPassword,
    // });

    const newUser = await SuperMaster.create({
      name,
      email,
      password: hashedPassword,
    });

    const plainUser = newUser.get({ plain: true });

    return res.status(201).json({
      message: "Super master registered successfully",
      user: { id: plainUser.id, name: plainUser.name, email: plainUser.email },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: "Server error", error: err });
  }
  return console.log("test api");
};

// import { Request, Response } from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { SuperMaster } from "../models/SuperMaster.model";

const loginSuperMaster = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await SuperMaster.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Super master not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password); // ✅ now accessible

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: "super_master" }, // ✅ now accessible
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllCompanies = async (req: Request, res: Response): Promise<any> => {
  try {
    const companies = await Company.findAll({
      attributes: { exclude: ["password"] }, // Exclude password from response
    });
    return res.status(200).json({ companies });
  } catch (err) {
    console.error("Error fetching companies:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// export default { loginSuperMaster };
export { signupSuperMaster, loginSuperMaster, getAllCompanies };
