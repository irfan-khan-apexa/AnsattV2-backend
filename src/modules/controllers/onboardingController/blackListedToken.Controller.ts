import { Request, Response } from "express";
import { BlackListedToken } from "../../models";
import { CompanyRequest } from "../../../middlewares/authMiddleware";

const addToken = async (req: CompanyRequest, res: Response): Promise<any> => {
  try {
    const { token, company_code, expiresAt } = req.body;
    // const company_code = req.user.company_code;
    const tokendata = await BlackListedToken.create({
      company_code,
      token,
      expiresAt,
    });

    return res
      .status(201)
      .json({ message: "tokendata created", data: tokendata });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "error creating token data", error: error.message });
  }
};

const getBlacklistedToken = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const tokendata = await BlackListedToken.findAll();

    return res
      .status(200)
      .json({ message: "fetched all data", data: tokendata });
  } catch (error: any) {
    return res
      .status(500)
      .json({ messsage: "error fetching tokens", error: error.message });
  }
};

const checktoken = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.body;
    const tokendata = await BlackListedToken.findOne({ where: { token } });

    if (!tokendata) {
      return res.json({ message: "token is not blacklisted" });
    } else {
      return res
        .status(200)
        .json({ message: "token is blackliested", data: tokendata });
    }
  } catch (error: any) {
    return res
      .status(500)
      .json({ messsage: "error fetching tokens", error: error.message });
  }
};

export { addToken, getBlacklistedToken, checktoken };
