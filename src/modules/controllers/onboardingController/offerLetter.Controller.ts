import { Request, Response } from "express";
import { OfferLetter } from "../../models/index";

const createOfferLetter = async (req: Request, res: Response): Promise<any> => {
  try {
    const { employee_id, terms } = req.body;

    const newOfferLetter = await OfferLetter.create({
      employee_id,
      terms,
      status: "Pending",
    });

    res.status(201).json({
      message: "Offer letter created",
      data: newOfferLetter,
    });
  } catch (error) {
    console.error("Error creating offer letter:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { createOfferLetter };
