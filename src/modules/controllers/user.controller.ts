// import { Request, Response } from "express";
// import { User } from "../src/modules/users/models";

// export const addUser = async (req: Request, res: Response) => {
//   try {
//     const { name, phone } = req.body;
//     const newUser = await User.create({ name, phone });

//     res.status(201).json({
//       success: true,
//       message: "User added",
//       user: newUser,
//     });
//   } catch (err) {
//     console.error("Error adding user:", err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// export const getUser = async (req: Request, res: Response) => {
//   try {
//     const users = await User.findAll();
//     res.json({ success: true, users });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };
