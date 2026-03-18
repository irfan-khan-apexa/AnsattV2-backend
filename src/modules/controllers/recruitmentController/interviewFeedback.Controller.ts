import { Request, Response } from "express";
import { Interview, InterviewFeedback, JobApplication } from "../../models";

/* SUBMIT FEEDBACK */

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

    /* 🔥 validation (1–9 scale) */

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

    /* 🔥 create feedback */

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

    /* 🔥 mark interview completed */

    await interview.update({
      status: "completed"
    });

    /* 🔥 decision logic */

    if (final_recommendation === "reject") {

      await JobApplication.update(
        { status: "rejected" },
        { where: { id: interview.application_id } }
      );

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
export { submitFeedback,getAllFeedbacks,getFeedbackByApplicationId };