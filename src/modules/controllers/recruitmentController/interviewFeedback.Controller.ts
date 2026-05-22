// import { Request, Response } from "express";
// import { Interview, InterviewFeedback, JobApplication } from "../../models";


// const submitFeedback = async (req: Request, res: Response): Promise<any> => {
//   try {

//     const {
//       interview_id,
//       technical_skills,
//       communication,
//       culture_fit,
//       problem_solving,
//       leadership,
//       additional_notes,
//       final_recommendation
//     } = req.body;

//     if (!interview_id) {
//       return res.status(400).json({ message: "Interview ID required" });
//     }

//     const interview: any = await Interview.findByPk(interview_id);

//     if (!interview) {
//       return res.status(404).json({ message: "Interview not found" });
//     }



//     const scores = [
//       technical_skills,
//       communication,
//       culture_fit,
//       problem_solving,
//       leadership
//     ];

//     for (const s of scores) {
//       if (s < 1 || s > 9) {
//         return res.status(400).json({
//           message: "Scores must be between 1 and 9"
//         });
//       }
//     }


//     const feedback = await InterviewFeedback.create({
//       interview_id,
//       application_id: interview.application_id,
//       round_number: interview.round_number,

//       technical_skills,
//       communication,
//       culture_fit,
//       problem_solving,
//       leadership,
//       additional_notes,
//       final_recommendation,
//     });



//     await interview.update({
//       status: "completed"
//     });


//     if (final_recommendation === "reject") {

//       await JobApplication.update(
//         { status: "rejected" },
//         { where: { id: interview.application_id } }
//       );

//     }

//     return res.status(201).json({ data: feedback });

//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };
// const getAllFeedbacks = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const feedbacks = await InterviewFeedback.findAll({
//       order: [["createdAt", "DESC"]],
//     });

//     return res.status(200).json({ data: feedbacks });

//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };
// const getFeedbackByApplicationId = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { application_id } = req.params;

//     if (!application_id) {
//       return res.status(400).json({ message: "Application ID required" });
//     }

//     const feedbacks = await InterviewFeedback.findAll({
//       where: { application_id },
//       order: [["round_number", "ASC"]],
//     });

//     if (!feedbacks || feedbacks.length === 0) {
//       return res.status(404).json({
//         message: "No feedback found for this application",
//       });
//     }

//     return res.status(200).json({ data: feedbacks });

//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };
// export { submitFeedback,getAllFeedbacks,getFeedbackByApplicationId };

import { Request, Response } from "express";
import { Interview, InterviewFeedback, JobApplication } from "../../models";
import { audit } from "../../../helpers/audit.helper"; // 🔥 ADDED


const submitFeedback = async (req: Request, res: Response): Promise<any> => {
  try {

    const {
      interview_id,
      technical_skills,
      communication,
      culture_fit,
      problem_solving,
      leadership,
      additional_notes,
      final_recommendation
    } = req.body;

    if (!interview_id) {
      return res.status(400).json({ message: "Interview ID required" });
    }

    const interview: any = await Interview.findByPk(interview_id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const scores = [
      technical_skills,
      communication,
      culture_fit,
      problem_solving,
      leadership
    ];

    for (const s of scores) {
      if (s < 1 || s > 9) {
        return res.status(400).json({
          message: "Scores must be between 1 and 9"
        });
      }
    }

    const feedback = await InterviewFeedback.create({
      interview_id,
      application_id: interview.application_id,
      round_number: interview.round_number,
      technical_skills,
      communication,
      culture_fit,
      problem_solving,
      leadership,
      additional_notes,
      final_recommendation,
    });

    // 🔥 AUDIT (Feedback Created)
    await audit(req, {
      module: "recruitment",
      action: "create",
      record_id: feedback.id,
      new_value: feedback.toJSON(),
    });

    const oldInterview = interview.toJSON(); // 🔥

    await interview.update({
      status: "completed"
    });

    // 🔥 AUDIT (Interview status update)
    await audit(req, {
      module: "recruitment",
      action: "update",
      record_id: interview.id,
      old_value: oldInterview,
      new_value: interview.toJSON(),
    });

    if (final_recommendation === "reject") {

      const oldApplication = await JobApplication.findByPk(interview.application_id);

      await JobApplication.update(
        { status: "rejected" },
        { where: { id: interview.application_id } }
      );

      // 🔥 AUDIT (Application rejected)
      await audit(req, {
        module: "recruitment",
        action: "update",
        record_id: interview.application_id,
        old_value: oldApplication?.toJSON(),
        new_value: { status: "rejected" },
      });
    }

    return res.status(201).json({ data: feedback });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


const getAllFeedbacks = async (req: Request, res: Response): Promise<any> => {
  try {
    const feedbacks = await InterviewFeedback.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ data: feedbacks });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


const getFeedbackByApplicationId = async (req: Request, res: Response): Promise<any> => {
  try {
    const { application_id } = req.params;

    if (!application_id) {
      return res.status(400).json({ message: "Application ID required" });
    }

    const feedbacks = await InterviewFeedback.findAll({
      where: { application_id },
      order: [["round_number", "ASC"]],
    });

    if (!feedbacks || feedbacks.length === 0) {
      return res.status(404).json({
        message: "No feedback found for this application",
      });
    }

    return res.status(200).json({ data: feedbacks });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export {
  submitFeedback,
  getAllFeedbacks,
  getFeedbackByApplicationId
};