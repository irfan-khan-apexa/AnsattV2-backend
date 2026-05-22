// import { Request, Response } from "express";
// import { Interview, JobApplication } from "../../models/index";


// const createInterview = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const user: any = (req as any).user;

//     const {
//       application_id,
//       round_number,
//       interview_type,
//       scheduled_date,
//       start_time,
//       end_time,
//       interviewers,
//       platform,
//       meeting_link,
//       notes,
//     } = req.body;

//     if (!application_id || !round_number || !interview_type) {
//       return res.status(400).json({ message: "Missing fields" });
//     }

//     const application: any = await JobApplication.findByPk(application_id);

//     if (!application) {
//       return res.status(404).json({ message: "Application not found" });
//     }

//     /* Prevent duplicate round */

//     const existing = await Interview.findOne({
//       where: { application_id, round_number },
//     });

//     if (existing) {
//       return res.status(400).json({
//         message: "Interview round already exists",
//       });
//     }

//     const interview = await Interview.create({
//       application_id,
//       job_id: application.job_id,
//       company_code: application.company_code,

//       round_number,
//       interview_type,

//       scheduled_date,
//       start_time,
//       end_time,

//       interviewers: JSON.stringify(interviewers),

//       platform,
//       meeting_link,
//       notes,

//       created_by: user?.id || "system",
//     });

//     return res.status(201).json({ data: interview });

//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };


// const getAllInterviews = async (_: Request, res: Response): Promise<any> => {
//   try {
//     const data = await Interview.findAll({
//       order: [["createdAt", "DESC"]],
//     });

//     return res.status(200).json({ data });

//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };


// const getByApplication = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { id } = req.params;

//     const data = await Interview.findAll({
//       where: { application_id: id },
//       order: [["round_number", "ASC"]],
//     });

//     return res.status(200).json({ data });

//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };



// const updateInterview = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const interview: any = await Interview.findByPk(req.params.id);

//     if (!interview) {
//       return res.status(404).json({ message: "Interview not found" });
//     }

//     await interview.update(req.body);

//     return res.status(200).json({ data: interview });

//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };





// const deleteInterview = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const interview: any = await Interview.findByPk(req.params.id);

//     if (!interview) {
//       return res.status(404).json({ message: "Interview not found" });
//     }

//     await interview.destroy();

//     return res.status(200).json({ message: "Deleted successfully" });

//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };

// export {
//   createInterview,
//   getAllInterviews,
//   getByApplication,
//   updateInterview,
//   deleteInterview,
// };
import { Request, Response } from "express";
import { Interview, JobApplication } from "../../models/index";
import { audit } from "../../../helpers/audit.helper"; // 🔥 ADDED


const createInterview = async (req: Request, res: Response): Promise<any> => {
  try {
    const user: any = (req as any).user;

    const {
      application_id,
      round_number,
      interview_type,
      scheduled_date,
      start_time,
      end_time,
      interviewers,
      platform,
      meeting_link,
      notes,
    } = req.body;

    if (!application_id || !round_number || !interview_type) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const application: any = await JobApplication.findByPk(application_id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const existing = await Interview.findOne({
      where: { application_id, round_number },
    });

    if (existing) {
      return res.status(400).json({
        message: "Interview round already exists",
      });
    }

    const interview = await Interview.create({
      application_id,
      job_id: application.job_id,
      company_code: application.company_code,
      round_number,
      interview_type,
      scheduled_date,
      start_time,
      end_time,
      interviewers: JSON.stringify(interviewers),
      platform,
      meeting_link,
      notes,
      created_by: user?.id || "system",
    });

    // 🔥 AUDIT
    await audit(req, {
      module: "recruitment",
      action: "create",
      record_id: interview.id,
      new_value: interview.toJSON(),
    });

    return res.status(201).json({ data: interview });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


const getAllInterviews = async (_: Request, res: Response): Promise<any> => {
  try {
    const data = await Interview.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ data });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


const getByApplication = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const data = await Interview.findAll({
      where: { application_id: id },
      order: [["round_number", "ASC"]],
    });

    return res.status(200).json({ data });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};



const updateInterview = async (req: Request, res: Response): Promise<any> => {
  try {
    const interview: any = await Interview.findByPk(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const oldData = interview.toJSON(); // 🔥

    await interview.update(req.body);

    // 🔥 AUDIT
    await audit(req, {
      module: "recruitment",
      action: "update",
      record_id: interview.id,
      old_value: oldData,
      new_value: interview.toJSON(),
    });

    return res.status(200).json({ data: interview });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};



const deleteInterview = async (req: Request, res: Response): Promise<any> => {
  try {
    const interview: any = await Interview.findByPk(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const oldData = interview.toJSON(); // 🔥

    await interview.destroy();

    // 🔥 AUDIT
    await audit(req, {
      module: "recruitment",
      action: "delete",
      record_id: oldData.id,
      old_value: oldData,
    });

    return res.status(200).json({ message: "Deleted successfully" });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export {
  createInterview,
  getAllInterviews,
  getByApplication,
  updateInterview,
  deleteInterview,
};