import { Request, Response } from "express";

import {
  ExitRequest,
  Onboarding,
  Company,
  Asset,
  ExitFeedback,
} from "../../models/index";

import {
  AuthenticatedRequest,
  CompanyRequest,
} from "../../../middlewares/authMiddleware";

import { createLetter } from "../../../services/generateExitLetter";

import {
  encrypt,
  decrypt,
} from "../../../utils/encryption";

import { audit } from "../../../helpers/audit.helper";

import { getSignedUrl } from "../../../services/uploadfileService";

// ================= CREATE EXIT REQUEST =================
const createExitRequest = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      company_code,
      id,
    } = (req as any).user;

    const employee_id =
      id;

    const {
      exit_type,
      notice_start_date,
      notice_end_date,
      remarks,
    } = req.body;

    if (
      !exit_type ||
      !notice_start_date ||
      !notice_end_date
    ) {
      return res
        .status(400)
        .json({
          message:
            "Missing required fields",
        });
    }

    const employee =
      await Onboarding.findOne({
        where: {
          id:
            employee_id,
          company_code,
        },
      });

    if (!employee) {
      return res
        .status(404)
        .json({
          message:
            "Employee not found",
        });
    }

    const existingRequest =
      await ExitRequest.findOne({
        where: {
          employee_id,
          company_code,
        },
      });

    if (
      existingRequest
    ) {
      return res
        .status(400)
        .json({
          message:
            "Exit request already exists for this employee",
        });
    }

    const newExit =
      await ExitRequest.create(
        {
          company_code,
          employee_id,
          exit_type,
          notice_start_date,
          notice_end_date,
          remarks,
        }
      );

    await audit(req, {
      module:
        "exitRequest",
      action:
        "create",
      record_id:
        newExit.id,
      new_value:
        newExit,
    });

    return res
      .status(201)
      .json({
        message:
          "Exit request created",
        data:
          newExit,
      });
  } catch (err) {
    console.error(
      "Error creating exit request:",
      err
    );

    return res
      .status(500)
      .json({
        message:
          "Internal Server Error",
      });
  }
};

// ================= GET MY EXIT REQUEST =================
const getMyExitRequest =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const employee_id =
        req.user.id;

      const company_code =
        req.user
          .company_code;

      if (
        !employee_id ||
        !company_code
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid token data",
          });
      }

      const exitRequest =
        await ExitRequest.findOne(
          {
            where: {
              employee_id:
                employee_id,
              company_code:
                company_code,
            },
          }
        );

      if (!exitRequest) {
        return res
          .status(200)
          .json({
            message:
              "No exit request found",
            data: null,
          });
      }

      return res
        .status(200)
        .json({
          message:
            "Exit request fetched successfully",

          data:
            exitRequest,
        });
    } catch (error) {
      console.error(
        "Error fetching exit request:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Internal Server Error",
        });
    }
  };

// ================= GET ALL EXIT REQUESTS =================
const getAllExitRequests =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const requests =
        await ExitRequest.findAll(
          {
            where: {
              company_code:
                req.user
                  .company_code,
            },

            include: [
              {
                model:
                  Onboarding,

                attributes:
                  [
                    "name",
                    "email",
                    "department",
                    "designation",
                  ],
              },
            ],
          }
        );

      return res
        .status(200)
        .json({
          data:
            requests,
        });
    } catch (error) {
      console.error(
        "Error fetching exit requests:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Internal Server Error",
        });
    }
  };

// ================= GET EXIT REQUEST BY ID =================
const getExitRequestById =
  async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const { id } =
        req.params;

      const request =
        await ExitRequest.findByPk(
          id,
          {
            include: [
              {
                model:
                  Onboarding,

                attributes:
                  [
                    "name",
                    "email",
                    "department",
                    "designation",
                  ],
              },
            ],
          }
        );

      if (!request) {
        return res
          .status(404)
          .json({
            message:
              "Exit request not found",
          });
      }

      return res
        .status(200)
        .json({
          data:
            request,
        });
    } catch (err) {
      console.error(
        "Error fetching exit request:",
        err
      );

      return res
        .status(500)
        .json({
          message:
            "Internal Server Error",
        });
    }
  };

// ================= UPDATE EXIT STATUS =================
const updateExitRequestStatus =
  async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const { id } =
        req.params;

      const {
        notice_status,
        overall_status,
        current_stage,
      } = req.body;

      const request =
        await ExitRequest.findByPk(
          id
        );

      if (!request) {
        return res
          .status(404)
          .json({
            message:
              "Exit request not found",
          });
      }

      const oldData =
        request.toJSON();

      if (
        notice_status
      ) {
        request.notice_status =
          notice_status;
      }

      if (
        overall_status
      ) {
        request.overall_status =
          overall_status;
      }

      if (
        current_stage
      ) {
        request.current_stage =
          current_stage;
      }

      await request.save();

      await audit(req, {
        module:
          "exitRequest",

        action:
          "update",

        record_id:
          request.id,

        old_value:
          oldData,

        new_value:
          request,
      });

      return res
        .status(200)
        .json({
          message:
            "Exit request updated successfully",

          data:
            request,
        });
    } catch (err) {
      console.error(
        "Error updating exit request:",
        err
      );

      return res
        .status(500)
        .json({
          message:
            "Internal Server Error",
        });
    }
  };

// ================= GENERATE EXIT LETTER =================
const generateExitLetterById =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { id } =
        req.params;

      const {
        company_code,
        company_name,
      } = req.user;

      let {
        type = "exit",
        exit_date,
      } =
        req.query as {
          type?: string;
          exit_date?: string;
        };

      const normalizedType =
        typeof type ===
          "string" &&
        type
          .toLowerCase()
          .startsWith(
            "experience"
          )
          ? "experience"
          : "exit";

      const employee: any =
        await Onboarding.findOne(
          {
            where: {
              id,
              company_code,
            },
          }
        );

      if (!employee) {
        return res
          .status(404)
          .json({
            message:
              "Employee not found",
          });
      }

      const assignedAssets =
        await Asset.findAll(
          {
            where: {
              company_code,
              assigned_to:
                id,
              status:
                "assigned",
            },

            attributes:
              [
                "id",
                "name",
                "serial_number",
                "assigned_to",
                "status",
              ],

            raw: true,
          }
        );

      if (
        assignedAssets &&
        assignedAssets.length >
          0
      ) {
        return res
          .status(400)
          .json({
            message:
              "Cannot generate exit letter: employee has unreturned assigned assets.",

            assets:
              assignedAssets,
          });
      }

      if (exit_date) {
        employee.exit_date =
          new Date(
            exit_date
          );

        await employee.save();
      }

      // ================= GENERATE LETTER =================
      const urls: {
        pdf?: string;
        docx?: string;
      } =
        await createLetter(
          normalizedType as
            | "exit"
            | "experience",

          employee,

          company_name
        );

      // ================= STORE JSON =================
      const encryptedPayload =
        encrypt(
          JSON.stringify(
            {
              pdf:
                urls.pdf ||
                null,

              docx:
                urls.docx ||
                null,
            }
          )
        );

      if (
        normalizedType ===
        "exit"
      ) {
        employee.exit_letter =
          encryptedPayload;
      }

      if (
        normalizedType ===
        "experience"
      ) {
        employee.experience_letter =
          encryptedPayload;
      }

      await employee.save();

      await audit(req, {
        module:
          "exitRequest",

        action:
          "update",

        record_id:
          employee.id,

        new_value:
          employee,
      });

      return res
        .status(200)
        .json({
          message: `${normalizedType} letter generated successfully`,

          data: {
            pdf:
              urls.pdf ||
              "",

            docx:
              urls.docx ||
              "",

            employee,
          },
        });
    } catch (err) {
      console.error(
        "Error generating letter:",
        err
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to generate letter",

          error:
            (
              err as Error
            ).message,
        });
    }
  };

// ================= DOWNLOAD EXIT LETTER =================
const downloadExitLetter =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const id =
        req.params.id;

      const type =
        req.params.type;

      const format =
        req.params.format?.toLowerCase();

      const company_code =
        req.user
          .company_code;

      // ================= VALIDATE FORMAT =================
      if (
        !format ||
        ![
          "pdf",
          "docx",
        ].includes(format)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid format",
          });
      }

      const employee: any =
        await Onboarding.findOne(
          {
            where: {
              id,
              company_code,
            },
          }
        );

      if (!employee) {
        return res
          .status(404)
          .json({
            message:
              "Employee not found",
          });
      }

      let encryptedData =
        "";

      if (
        type ===
        "exit"
      ) {
        encryptedData =
          employee.exit_letter ||
          "";
      }

      if (
        type ===
        "experience"
      ) {
        encryptedData =
          employee.experience_letter ||
          "";
      }

      if (
        !encryptedData
      ) {
        return res
          .status(404)
          .json({
            message:
              "Letter not found",
          });
      }

      console.log(
        "ENCRYPTED LETTER DATA:",
        encryptedData
      );

      // ================= DECRYPT =================
      let decrypted =
        "";

      try {
        decrypted =
          decrypt(
            encryptedData
          );

        console.log(
          "DECRYPTED LETTER DATA:",
          decrypted
        );
      } catch (
        decryptError: any
      ) {
        console.error(
          "DECRYPT ERROR:",
          decryptError
        );

        return res
          .status(500)
          .json({
            message:
              "Failed to decrypt letter",
          });
      }

      // ================= PARSE JSON =================
      const parsed: {
        pdf?: string | null;
        docx?: string | null;
      } = (() => {
        try {
          return JSON.parse(
            decrypted
          );
        } catch {
          return {
            pdf:
              decrypted,
            docx:
              null,
          };
        }
      })();

      // ================= GET FILE ID =================
      let fileId =
        "";

      if (
        format ===
        "pdf"
      ) {
        fileId =
          parsed.pdf ||
          "";
      }

      if (
        format ===
        "docx"
      ) {
        fileId =
          parsed.docx ||
          "";
      }

      if (!fileId) {
        return res
          .status(404)
          .json({
            message:
              `${format} file not found`,
          });
      }

      console.log(
        "FILE ID:",
        fileId
      );

      // ================= GET SIGNED URL =================
      const signedUrl =
        await getSignedUrl(
          fileId
        );

      return res
        .status(200)
        .json({
          url:
            signedUrl,
        });
    } catch (error: any) {
      console.error(
        "DOWNLOAD EXIT LETTER ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Internal server error",

          error:
            error.message,
        });
    }
  };

// ================= CREATE FEEDBACK =================
const createExitFeedback =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const user =
        (req as any)
          .user;

      if (
        !user ||
        !user.id ||
        !user.company_code
      ) {
        return res
          .status(401)
          .json({
            message:
              "Invalid token",
          });
      }

      const company_code =
        user.company_code;

      const created_by =
        user.id;

      const employee_id =
        Number(
          created_by
        );

      const {
        improvements,
        problems,
        positives,
        comments,
        rating,
      } = req.body;

      if (
        !Array.isArray(
          improvements
        ) ||
        improvements.length ===
          0
      ) {
        return res
          .status(400)
          .json({
            message:
              "improvements array required",
          });
      }

      if (
        !Array.isArray(
          problems
        ) ||
        problems.length ===
          0
      ) {
        return res
          .status(400)
          .json({
            message:
              "problems array required",
          });
      }

      if (
        !Array.isArray(
          positives
        ) ||
        positives.length ===
          0
      ) {
        return res
          .status(400)
          .json({
            message:
              "positives array required",
          });
      }

      const trimTo3 = (
        arr: any[]
      ) =>
        arr
          .slice(0, 3)
          .map(String);

      const payload = {
        company_code,
        employee_id,

        improvements:
          trimTo3(
            improvements
          ),

        problems:
          trimTo3(
            problems
          ),

        positives:
          trimTo3(
            positives
          ),

        comments:
          comments ??
          null,

        rating:
          rating
            ? Number(
                rating
              )
            : null,

        created_by,
      };

      const fb =
        await ExitFeedback.create(
          payload as any
        );

      await audit(req, {
        module:
          "exitRequest",

        action:
          "create",

        record_id:
          fb.id,

        new_value:
          fb,
      });

      return res
        .status(201)
        .json({
          message:
            "Feedback saved",

          data: fb,
        });
    } catch (err: any) {
      console.error(
        "createExitFeedbackByEmployee error:",
        err
      );

      return res
        .status(500)
        .json({
          message:
            "Error saving feedback",

          error:
            err.message,
        });
    }
  };

// ================= GET FEEDBACKS =================
const getFeedbacksForEmployee =
  async (
    req: CompanyRequest,
    res: Response
  ): Promise<any> => {
    try {
      const company_code =
        req.user
          .company_code;

      const employee_id =
        Number(
          req.params
            .employee_id ??
            req.params.id
        );

      if (
        !employee_id
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid employee_id",
          });
      }

      const feedbacks =
        await ExitFeedback.findAll(
          {
            where: {
              company_code,
              employee_id,
            },

            order: [
              [
                "createdAt",
                "DESC",
              ],
            ],

            raw: true,
          }
        );

      return res
        .status(200)
        .json({
          data:
            feedbacks,
        });
    } catch (err: any) {
      console.error(
        "getFeedbacksForEmployee error:",
        err
      );

      return res
        .status(500)
        .json({
          message:
            "Error fetching feedbacks",

          error:
            err.message,
        });
    }
  };

export {
  createExitRequest,
  getAllExitRequests,
  getExitRequestById,
  updateExitRequestStatus,
  generateExitLetterById,
  downloadExitLetter,
  createExitFeedback,
  getFeedbacksForEmployee,
  getMyExitRequest,
};