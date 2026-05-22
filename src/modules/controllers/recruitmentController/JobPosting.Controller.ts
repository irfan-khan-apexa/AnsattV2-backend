// import { Response } from "express";
// import { JobPosting } from "../../models/index";
// import { CompanyRequest } from "../../../middlewares/authMiddleware";

// const createJobPosting = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const company_code = req.user.company_code;

//     const job = await JobPosting.create({
//       ...req.body,
//       company_code,
//     });

//     return res.status(201).json({
//       message: "Job created successfully",
//       data: job,
//     });
//   } catch (error: any) {
//     return res.status(500).json({
//       message: "Failed to create job",
//       error: error.message,
//     });
//   }
// };

// const getAllJobs = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const jobs = await JobPosting.findAll({
//       where: { company_code: req.user.company_code },
//     });

//     return res.status(200).json({ data: jobs });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Failed to fetch jobs",
//     });
//   }
// };

// const getJobById = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;

//     const job = await JobPosting.findOne({
//       where: {
//         id,
//         company_code: req.user.company_code,
//       },
//     });

//     if (!job) {
//       return res.status(404).json({ message: "Job not found" });
//     }

//     return res.status(200).json({ data: job });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Error fetching job",
//     });
//   }
// };

// const updateJob = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;

//     const job = await JobPosting.findOne({
//       where: { id, company_code: req.user.company_code },
//     });

//     if (!job) {
//       return res.status(404).json({ message: "Job not found" });
//     }

//     await job.update(req.body);

//     return res.status(200).json({
//       message: "Job updated successfully",
//       data: job,
//     });
//   } catch (error: any) {
//     return res.status(500).json({
//       message: "Failed to update job",
//       error: error.message,
//     });
//   }
// };

// const deleteJob = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } = req.params;

//     const job = await JobPosting.findOne({
//       where: { id, company_code: req.user.company_code },
//     });

//     if (!job) {
//       return res.status(404).json({ message: "Job not found" });
//     }

//     await job.destroy();

//     return res.status(200).json({
//       message: "Job deleted successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Failed to delete job",
//     });
//   }
// };

// export {
//   createJobPosting,
//   getAllJobs,
//   getJobById,
//   updateJob,
//   deleteJob,
// };
import { Response } from "express";
import { JobPosting } from "../../models/index";
import { CompanyRequest } from "../../../middlewares/authMiddleware";
import { audit } from "../../../helpers/audit.helper"; // 🔥 ADDED

const createJobPosting = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const company_code = req.user.company_code;

    const job = await JobPosting.create({
      ...req.body,
      company_code,
    });

    // 🔥 AUDIT
    await audit(req, {
      module: "recruitment",
      action: "create",
      record_id: job.id,
      new_value: job.toJSON(),
    });

    return res.status(201).json({
      message: "Job created successfully",
      data: job,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to create job",
      error: error.message,
    });
  }
};

const getAllJobs = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const jobs = await JobPosting.findAll({
      where: { company_code: req.user.company_code },
    });

    return res.status(200).json({ data: jobs });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch jobs",
    });
  }
};

const getJobById = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const job = await JobPosting.findOne({
      where: {
        id,
        company_code: req.user.company_code,
      },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ data: job });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching job",
    });
  }
};

const updateJob = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const job = await JobPosting.findOne({
      where: { id, company_code: req.user.company_code },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const oldData = job.toJSON(); // 🔥

    await job.update(req.body);

    // 🔥 AUDIT
    await audit(req, {
      module: "recruitment",
      action: "update",
      record_id: job.id,
      old_value: oldData,
      new_value: job.toJSON(),
    });

    return res.status(200).json({
      message: "Job updated successfully",
      data: job,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to update job",
      error: error.message,
    });
  }
};

const deleteJob = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const job = await JobPosting.findOne({
      where: { id, company_code: req.user.company_code },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const oldData = job.toJSON(); // 🔥

    await job.destroy();

    // 🔥 AUDIT
    await audit(req, {
      module: "recruitment",
      action: "delete",
      record_id: oldData.id,
      old_value: oldData,
    });

    return res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete job",
    });
  }
};

export {
  createJobPosting,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};