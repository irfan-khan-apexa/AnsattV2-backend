import { Request, Response } from "express";
import { JobApplication } from "../../models/index";
import { encrypt, decrypt } from "../../../utils/encryption";
import { generatePresignedGetUrl } from "../../../utils/generatePresignedUrl";
import { resumeQueue } from "../../../config/redis";

// const applyForJob = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { job_id, company_code, name, email, phone } = req.body;

//     const file = req.files as any;

//     const resume_url = file?.resume?.[0]?.location
//       ? encrypt(file.resume[0].location)
//       : undefined;

//     // check 6 month rejection rule
//     const existing = await JobApplication.findOne({
//       where: {
//         email,
//         job_id,
//         company_code,
//         status: "rejected",
//       },
//     });

//     if (existing && existing.rejected_at) {
//       const sixMonthsAgo = new Date();
//       sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

//       if (existing.rejected_at > sixMonthsAgo) {
//         return res.status(400).json({
//           message:
//             "You cannot reapply for this job until 6 months after rejection.",
//         });
//       }
//     }

//     const application = await JobApplication.create({
//       company_code,
//       job_id,
//       name,
//       email,
//       phone,
//       resume_url,
//     });

//     // push resume parsing job to queue
//     // await resumeQueue.add("parse-resume", {
//     //   applicationId: application.id,
//     // });


//     console.log("Resume job pushed to queue");

//     return res.status(201).json({
//       message: "Application submitted successfully",
//       data: application,
//     });
//   } catch (error: any) {
//     console.error("Apply job error:", error);

//     return res.status(500).json({
//       message: "Failed to apply for job",
//       error: error.message,
//     });
//   }
// };

const applyForJob = async (req: Request, res: Response): Promise<any> => {
  try {
    const { job_id, company_code, name, email, phone } = req.body;

    const file = req.files as any;

    const resume_url = file?.resume?.[0]?.location
      ? encrypt(file.resume[0].location)
      : undefined;

    const application = await JobApplication.create({
      company_code,
      job_id,
      name,
      email,
      phone,
      resume_url,
    });

    // ✅ QUEUE PUSH (FIXED)
    await resumeQueue.add("resume-processing", {
      applicationId: application.id,
    });

//     await resumeQueue.add("resume-processing", {
//   applicationId: application.id,
// });

    // console.log("✅ Resume job pushed to queue");

    return res.status(201).json({
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error: any) {
    console.error("Apply job error:", error);

    return res.status(500).json({
      message: "Failed to apply for job",
      error: error.message,
    });
  }
};

const getAllApplications = async (req: Request, res: Response): Promise<any> => {
  try {
    const company_code = (req as any).user.company_code;

    const applications = await JobApplication.findAll({
      where: { company_code },
      order: [["createdAt", "DESC"]],
    });

    const data = await Promise.all(
      applications.map(async (app: any) => {
        let resume_download_url = null;

        if (app.resume_url) {
          const realUrl = decrypt(app.resume_url);

          // bucket remove karke actual key nikalo
          const key = realUrl.split(`${process.env.WASABI_BUCKET_NAME}/`)[1];

          const signedUrl = await generatePresignedGetUrl(key, 300);

          resume_download_url = signedUrl;
        }

        return {
          ...app.toJSON(),
          resume_download_url,
        };
      })
    );

    return res.status(200).json({
      data,
    });

  } catch (error: any) {
    console.error("Fetch applications error:", error);

    return res.status(500).json({
      message: "Error fetching applications",
      error: error.message,
    });
  }
};

const updateApplicationStatus = async (req: Request, res: Response): Promise<any>  => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const record = await JobApplication.findByPk(id);

    if (!record) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updateData: any = { status };

    if (status === "rejected") {
      updateData.rejected_at = new Date();
    }

    await record.update(updateData);

    return res.status(200).json({
      message: "Application status updated",
      data: record,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
};

export {
  applyForJob,
  getAllApplications,
  updateApplicationStatus,
};