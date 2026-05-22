// import { Request, Response } from "express";
// import { Op } from "sequelize";
// import { GoalSetting, Onboarding } from "../../models/index";
// import { audit } from "../../../helpers/audit.helper";

// const createGoal = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const {
//       employeeId,
//       cycleId,
//       title,
//       description,
//       type,
//       targetValue,
//       weightage,
//       startDate,
//       endDate,
//     } = req.body;

//     const companyCode = (req as any).user.company_code;

//     if (!employeeId || !cycleId || !title || !type || !targetValue || !weightage) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const employee = await Onboarding.findOne({
//       where: { id: employeeId, company_code: companyCode },
//     });

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     const duplicate = await GoalSetting.findOne({
//       where: { employeeId, cycleId, title, companyCode },
//     });

//     if (duplicate) {
//       return res.status(400).json({
//         message: "Goal already exists in this cycle",
//       });
//     }

//     const totalWeightage = await GoalSetting.sum("weightage", {
//       where: { employeeId, cycleId, companyCode },
//     });

//     if ((totalWeightage || 0) + weightage > 100) {
//       return res.status(400).json({
//         message: "Total weightage cannot exceed 100",
//       });
//     }

//     const goal = await GoalSetting.create({
//       employeeId,
//       cycleId,
//       title,
//       description,
//       type,
//       targetValue,
//       weightage,
//       startDate,
//       endDate,
//       companyCode,
//     });

//     await audit(req, {
//       module: "goal",
//       action: "create",
//       record_id: goal.id,
//       new_value: goal,
//     });

//     res.status(201).json({ message: "Goal created", goal });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error creating goal" });
//   }
// };

// const getGoals = async (req: Request, res: Response) => {
//   try {
//     const companyCode = (req as any).user.company_code;

//     const goals = await GoalSetting.findAll({
//       where: { companyCode },
//     });

//     res.json(goals);
//   } catch {
//     res.status(500).json({ message: "Error fetching goals" });
//   }
// };

// const getGoalsByEmployeeCycle = async (req: Request, res: Response) => {
//   try {
//     const employeeId = Number(req.query.employeeId);
//     const cycleId = Number(req.query.cycleId);
//     const companyCode = (req as any).user.company_code;

//     if (!employeeId || !cycleId) {
//       return res.status(400).json({ message: "Invalid params" });
//     }

//     const goals = await GoalSetting.findAll({
//       where: { employeeId, cycleId, companyCode },
//     });

//     res.json(goals);
//   } catch {
//     res.status(500).json({ message: "Error fetching goals" });
//   }
// };

// const getGoalById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const companyCode = (req as any).user.company_code;

//     const goal = await GoalSetting.findOne({
//       where: { id, companyCode },
//     });

//     if (!goal) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     res.json(goal);
//   } catch {
//     res.status(500).json({ message: "Error fetching goal" });
//   }
// };

// const updateGoal = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const companyCode = (req as any).user.company_code;

//     const goal = await GoalSetting.findOne({ where: { id, companyCode } });

//     if (!goal) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     const oldGoal = goal.toJSON();

//     if (req.body.weightage) {
//       const totalWeightage = await GoalSetting.sum("weightage", {
//         where: {
//           employeeId: goal.employeeId,
//           cycleId: goal.cycleId,
//           companyCode,
//           id: { [Op.ne]: goal.id },
//         },
//       });

//       if ((totalWeightage || 0) + req.body.weightage > 100) {
//         return res.status(400).json({
//           message: "Total weightage cannot exceed 100",
//         });
//       }
//     }

//     await goal.update(req.body);

//     await audit(req, {
//       module: "goal",
//       action: "update",
//       record_id: goal.id,
//       old_value: oldGoal,
//       new_value: goal,
//     });

//     res.json({ message: "Goal updated", goal });

//   } catch {
//     res.status(500).json({ message: "Error updating goal" });
//   }
// };

// const deleteGoal = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const companyCode = (req as any).user.company_code;

//     const goal = await GoalSetting.findOne({ where: { id, companyCode } });

//     if (!goal) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     const oldGoal = goal.toJSON();

//     await goal.destroy();

//     await audit(req, {
//       module: "goal",
//       action: "delete",
//       record_id: oldGoal.id,
//       old_value: oldGoal,
//     });

//     res.json({ message: "Goal deleted" });

//   } catch {
//     res.status(500).json({ message: "Error deleting goal" });
//   }
// };

// export {
//   createGoal,
//   getGoals,
//   getGoalsByEmployeeCycle,
//   getGoalById,
//   updateGoal,
//   deleteGoal,
// };  

import { Request, Response } from "express";
import { Op } from "sequelize";
import { GoalSetting, Onboarding } from "../../models/index";
import { audit } from "../../../helpers/audit.helper";

const createGoal = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      employeeId,
      cycleId,
      title,
      description,
      type,
      targetValue,
      weightage,
      startDate,
      endDate,
    } = req.body;

    const companyCode = (req as any).user.company_code;

    if (!employeeId || !cycleId || !title || !type || !targetValue || !weightage) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const employee = await Onboarding.findOne({
      where: { id: employeeId, company_code: companyCode },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const duplicate = await GoalSetting.findOne({
      where: { employeeId, cycleId, title, companyCode },
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Goal already exists in this cycle",
      });
    }

    const totalWeightage = await GoalSetting.sum("weightage", {
      where: { employeeId, cycleId, companyCode },
    });

    if ((totalWeightage || 0) + weightage > 100) {
      return res.status(400).json({
        message: "Total weightage cannot exceed 100",
      });
    }

    const goal = await GoalSetting.create({
      employeeId,
      cycleId,
      title,
      description,
      type,
      targetValue,
      weightage,
      startDate,
      endDate,
      companyCode,
    });

    // 🔥 AUDIT
    await audit(req, {
      module: "goal",
      action: "create",
      record_id: goal.id,
      new_value: goal.toJSON(),
    });

    res.status(201).json({ message: "Goal created", goal });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating goal" });
  }
};

const getGoals = async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).user.company_code;

    const goals = await GoalSetting.findAll({
      where: { companyCode },
    });

    res.json(goals);
  } catch {
    res.status(500).json({ message: "Error fetching goals" });
  }
};

const getGoalsByEmployeeCycle = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.query.employeeId);
    const cycleId = Number(req.query.cycleId);
    const companyCode = (req as any).user.company_code;

    if (!employeeId || !cycleId) {
      return res.status(400).json({ message: "Invalid params" });
    }

    const goals = await GoalSetting.findAll({
      where: { employeeId, cycleId, companyCode },
    });

    res.json(goals);
  } catch {
    res.status(500).json({ message: "Error fetching goals" });
  }
};

const getGoalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyCode = (req as any).user.company_code;

    const goal = await GoalSetting.findOne({
      where: { id, companyCode },
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(goal);
  } catch {
    res.status(500).json({ message: "Error fetching goal" });
  }
};

const updateGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyCode = (req as any).user.company_code;

    const goal = await GoalSetting.findOne({ where: { id, companyCode } });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const oldGoal = goal.toJSON();

    if (req.body.weightage) {
      const totalWeightage = await GoalSetting.sum("weightage", {
        where: {
          employeeId: goal.employeeId,
          cycleId: goal.cycleId,
          companyCode,
          id: { [Op.ne]: goal.id },
        },
      });

      if ((totalWeightage || 0) + req.body.weightage > 100) {
        return res.status(400).json({
          message: "Total weightage cannot exceed 100",
        });
      }
    }

    await goal.update(req.body);

    // 🔥 AUDIT
    await audit(req, {
      module: "goal",
      action: "update",
      record_id: goal.id,
      old_value: oldGoal,
      new_value: goal.toJSON(),
    });

    res.json({ message: "Goal updated", goal });

  } catch {
    res.status(500).json({ message: "Error updating goal" });
  }
};

const deleteGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyCode = (req as any).user.company_code;

    const goal = await GoalSetting.findOne({ where: { id, companyCode } });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const oldGoal = goal.toJSON();

    await goal.destroy();

    // 🔥 AUDIT
    await audit(req, {
      module: "goal",
      action: "delete",
      record_id: oldGoal.id,
      old_value: oldGoal,
    });

    res.json({ message: "Goal deleted" });

  } catch {
    res.status(500).json({ message: "Error deleting goal" });
  }
};

export {
  createGoal,
  getGoals,
  getGoalsByEmployeeCycle,
  getGoalById,
  updateGoal,
  deleteGoal,
};