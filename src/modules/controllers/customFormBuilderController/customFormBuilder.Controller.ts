import { Response } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";

import { CustomDocument } from "../../models/index";
import { CompanyRequest } from "../../../middlewares/authMiddleware";
import { audit } from "../../../helpers/audit.helper";

/**
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const MAX_REQUEST_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_SECTIONS = 500;
const MAX_SECTION_LIST = 500;

/**
 * =========================================================
 * POSITION VALIDATION
 * =========================================================
 */

const positionSchema = z
  .object({
    x: z
      .number()
      .finite()
      .min(-10000)
      .max(10000),

    y: z
      .number()
      .finite()
      .min(-10000)
      .max(10000),
  })
  .strict();

/**
 * =========================================================
 * SECTION VALIDATION
 * =========================================================
 *
 * .passthrough() is intentionally used because the
 * frontend can have different dynamic section types.
 *
 * Example:
 * headerInfo
 * text
 * input
 * employeeField
 * signature
 * etc.
 *
 * Unknown future properties will not be rejected.
 */

const sectionSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1)
      .max(150),

    type: z
      .string()
      .trim()
      .min(1)
      .max(100),

    label: z
      .string()
      .trim()
      .max(500)
      .optional(),

    content: z
      .string()
      .max(10000)
      .optional(),

    enabled: z
      .boolean()
      .optional(),

    fontSize: z
      .number()
      .finite()
      .min(1)
      .max(200)
      .optional(),

    align: z
      .enum([
        "left",
        "center",
        "right",
        "justify",
      ])
      .optional(),

    bold: z
      .boolean()
      .optional(),

    color: z
      .string()
      .regex(
        /^#[0-9A-Fa-f]{6}$/,
        "Invalid color format"
      )
      .optional(),

    width: z
      .string()
      .max(50)
      .optional(),

    orderIndex: z
      .number()
      .int()
      .min(0)
      .max(MAX_SECTION_LIST)
      .optional(),

    position: positionSchema.optional(),
  })
  .passthrough();

/**
 * =========================================================
 * SECTIONS OBJECT
 * =========================================================
 *
 * Example:
 *
 * {
 *   "sec_123": {
 *      ...
 *   }
 * }
 */

const sectionsSchema = z
  .record(
    z
      .string()
      .min(1)
      .max(150),

    sectionSchema
  )
  .refine(
    (sections) =>
      Object.keys(sections).length <=
      MAX_SECTIONS,
    {
      message:
        `Maximum ${MAX_SECTIONS} sections are allowed`,
    }
  );

/**
 * =========================================================
 * SECTION LIST
 * =========================================================
 */

const sectionListSchema = z
  .array(sectionSchema)
  .max(
    MAX_SECTION_LIST,
    `Maximum ${MAX_SECTION_LIST} sections are allowed`
  );

/**
 * =========================================================
 * CREATE VALIDATION
 * =========================================================
 */

const createCustomDocumentSchema = z
  .object({
    /**
     * Optional because backend can generate
     * an ID if frontend does not provide one.
     */
    id: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Invalid document ID"
      )
      .optional(),

    /**
     * Document name
     */
    docName: z
      .string()
      .trim()
      .min(
        1,
        "Document name is required"
      )
      .max(
        200,
        "Document name cannot exceed 200 characters"
      ),

    /**
     * Dynamic sections
     */
    sections:
      sectionsSchema.optional(),

    /**
     * Ordered sections
     */
    sectionList:
      sectionListSchema.optional(),

    /**
     * Logo size
     */
    logoSize: z
      .number()
      .finite()
      .int()
      .min(0)
      .max(1000)
      .optional(),

    /**
     * Logo can be URL/path/base64
     * depending on your frontend implementation.
     */
    logo: z
      .string()
      .trim()
      .max(2000)
      .nullable()
      .optional(),

    /**
     * Document position
     */
    pos:
      positionSchema.optional(),

    /**
     * Font family
     *
     * No whitelist validation for now.
     */
    fontFamily: z
      .string()
      .trim()
      .max(100)
      .optional(),

    /**
     * Page border
     */
    pageBorder: z
      .boolean()
      .optional(),

    /**
     * Draft status
     */
    isDraft: z
      .boolean()
      .optional(),
  })
  .strict();

/**
 * =========================================================
 * UPDATE VALIDATION
 * =========================================================
 */

const updateCustomDocumentSchema =
  createCustomDocumentSchema
    .partial()
    .strict();

/**
 * =========================================================
 * REQUEST SIZE VALIDATION
 * =========================================================
 */

const validateRequestSize = (
  body: unknown
): boolean => {
  try {
    const size = Buffer.byteLength(
      JSON.stringify(body || {}),
      "utf8"
    );

    return size <= MAX_REQUEST_SIZE;
  } catch {
    return false;
  }
};

/**
 * =========================================================
 * DOCUMENT ID VALIDATION
 * =========================================================
 */

const validateDocumentId = (
  id: unknown
): id is string => {
  if (typeof id !== "string") {
    return false;
  }

  return /^[a-zA-Z0-9_-]{1,100}$/.test(id);
};

/**
 * =========================================================
 * CREATE CUSTOM DOCUMENT
 * =========================================================
 */

const upsertCustomDocument = async ( 
  req: CompanyRequest, 
  res: Response 
): Promise<any> => { 
  try { 
    /** 
     * ===================================================== 
     * AUTHENTICATION / TENANT SECURITY 
     * ===================================================== 
     */ 
 
    const company_code = 
      req.user?.company_code; 
 
    const generated_by = 
      req.user?.id; 
 
    if (!company_code || !generated_by) { 
      return res.status(401).json({ 
        message: "Unauthorized", 
      }); 
    } 
 
    /** 
     * ===================================================== 
     * REQUEST SIZE PROTECTION 
     * ===================================================== 
     */ 
 
    if (!validateRequestSize(req.body)) { 
      return res.status(413).json({ 
        message: 
          "Request payload is too large. Maximum allowed size is 2 MB.", 
      }); 
    } 
 
    /** 
     * ===================================================== 
     * BODY VALIDATION 
     * ===================================================== 
     */ 
 
    const validation = 
      createCustomDocumentSchema.safeParse( 
        req.body 
      ); 
 
    if (!validation.success) { 
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: 
          validation.error.flatten(), 
      }); 
    } 
 
    const data = 
      validation.data; 
 
    /** 
     * ===================================================== 
     * DOCUMENT ID 
     * ===================================================== 
     * 
     * If frontend sends ID: 
     *   -> check whether document exists 
     * 
     * If no ID: 
     *   -> create a new UUID 
     */ 
 
    const documentId = 
      data.id || randomUUID(); 
 
    /** 
     * ===================================================== 
     * FIND EXISTING DOCUMENT 
     * ===================================================== 
     * 
     * IMPORTANT: 
     * company_code is always included. 
     * 
     * This prevents one company from accessing 
     * another company's document. 
     */ 
 
    const existingDocument = 
      await CustomDocument.findOne({ 
        where: { 
          id: documentId, 
          company_code, 
        }, 
      }); 
 
    /** 
     * ===================================================== 
     * UPDATE EXISTING DOCUMENT 
     * ===================================================== 
     */ 
 
    if (existingDocument) { 
      /** 
       * Old value for audit 
       */ 
      const oldDocument = 
        existingDocument.toJSON(); 
 
      /** 
       * Explicit update object. 
       * 
       * Do NOT use req.body directly. 
       */ 
 
      const updates: { 
        doc_name?: string; 
        sections?: Record< 
          string, 
          any 
        >; 
        section_list?: any[]; 
        logo_size?: number; 
        logo?: string | null; 
        pos?: { 
          x: number; 
          y: number; 
        }; 
        font_family?: string; 
        page_border?: boolean; 
        is_draft?: boolean; 
      } = {}; 
 
      /** 
       * Document name 
       */ 
      if ( 
        data.docName !== undefined 
      ) { 
        updates.doc_name = 
          data.docName; 
      } 
 
      /** 
       * Sections 
       */ 
      if ( 
        data.sections !== undefined 
      ) { 
        updates.sections = 
          data.sections; 
      } 
 
      /** 
       * Section list 
       */ 
      if ( 
        data.sectionList !== undefined 
      ) { 
        updates.section_list = 
          data.sectionList; 
      } 
 
      /** 
       * Logo size 
       */ 
      if ( 
        data.logoSize !== undefined 
      ) { 
        updates.logo_size = 
          data.logoSize; 
      } 
 
      /** 
       * Logo 
       */ 
      if ( 
        data.logo !== undefined 
      ) { 
        updates.logo = 
          data.logo; 
      } 
 
      /** 
       * Position 
       */ 
      if ( 
        data.pos !== undefined 
      ) { 
        updates.pos = 
          data.pos; 
      } 
 
      /** 
       * Font family 
       * 
       * No whitelist validation. 
       */ 
      if ( 
        data.fontFamily !== undefined 
      ) { 
        updates.font_family = 
          data.fontFamily; 
      } 
 
      /** 
       * Page border 
       */ 
      if ( 
        data.pageBorder !== undefined 
      ) { 
        updates.page_border = 
          data.pageBorder; 
      } 
 
      /** 
       * Draft status 
       */ 
      if ( 
        data.isDraft !== undefined 
      ) { 
        updates.is_draft = 
          data.isDraft; 
      } 
 
      /** 
       * Prevent empty update 
       */ 
      if ( 
        Object.keys(updates).length === 0 
      ) { 
        return res.status(400).json({ 
          message: 
            "No fields provided for update", 
        }); 
      } 
 
      /** 
       * Update document 
       */ 
      await existingDocument.update( 
        updates 
      ); 
 
      /** 
       * =================================================== 
       * AUDIT UPDATE 
       * =================================================== 
       */ 
 
      await audit(req, { 
        module: 
          "custom_document", 
 
        action: 
          "update", 
 
        record_id: 
          existingDocument.id, 
 
        old_value: 
          oldDocument, 
 
        new_value: 
          existingDocument.toJSON(), 
      }); 
 
      return res.status(200).json({ 
        message: 
          "Custom document updated successfully", 
 
        data: 
          existingDocument, 
      }); 
    } 
 
    /** 
     * ===================================================== 
     * CREATE NEW DOCUMENT 
     * ===================================================== 
     */ 
 
    const document = 
      await CustomDocument.create({ 
        /** 
         * Primary key 
         */ 
        id: documentId, 
 
        /** 
         * IMPORTANT: 
         * company_code comes ONLY from JWT. 
         */ 
        company_code, 
 
        /** 
         * Document name 
         */ 
        doc_name: 
          data.docName, 
 
        /** 
         * Dynamic sections 
         */ 
        sections: 
          data.sections || {}, 
 
        /** 
         * Ordered section list 
         */ 
        section_list: 
          data.sectionList || [], 
 
        /** 
         * Logo size 
         */ 
        logo_size: 
          data.logoSize ?? 80, 
 
        /** 
         * Logo 
         */ 
        logo: 
          data.logo ?? null, 
 
        /** 
         * Position 
         */ 
        pos: 
          data.pos || { 
            x: 0, 
            y: 0, 
          }, 
 
        /** 
         * Font family 
         */ 
        font_family: 
          data.fontFamily || 
          "sans-serif", 
 
        /** 
         * Page border 
         */ 
        page_border: 
          data.pageBorder ?? false, 
 
        /** 
         * Draft status 
         */ 
        is_draft: 
          data.isDraft ?? true, 
 
        /** 
         * IMPORTANT: 
         * generated_by comes ONLY from JWT. 
         */ 
        generated_by, 
      }); 
 
    /** 
     * ===================================================== 
     * AUDIT CREATE 
     * ===================================================== 
     */ 
 
    await audit(req, { 
      module: 
        "custom_document", 
 
      action: 
        "create", 
 
      record_id: 
        document.id, 
 
      new_value: 
        document.toJSON(), 
    }); 
 
    return res.status(201).json({ 
      message: 
        "Custom document created successfully", 
 
      data: 
        document, 
    }); 
  } catch (err: any) { 
    console.error( 
      "saveCustomDocument error:", 
      err 
    ); 
 
    return res.status(500).json({ 
      message: 
        "Error saving custom document", 
    }); 
  } 
};

/**
 * =========================================================
 * GET ALL CUSTOM DOCUMENTS
 * =========================================================
 */

const getAllCustomDocuments = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    /**
     * =====================================================
     * TENANT
     * =====================================================
     */

    const company_code =
      req.user?.company_code;

    if (!company_code) {
      return res.status(401).json({
        message:
          "Unauthorized",
      });
    }

    /**
     * =====================================================
     * FETCH DOCUMENTS
     * =====================================================
     */

    const documents =
      await CustomDocument.findAll({
        where: {
          /**
           * Tenant isolation
           */
          company_code,
        },

        order: [
          [
            "createdAt",
            "DESC",
          ],
        ],
      });

    return res.status(200).json({
      data:
        documents,
    });
  } catch (err: any) {
    console.error(
      "getAllCustomDocuments error:",
      err
    );

    return res.status(500).json({
      message:
        "Error fetching custom documents",
    });
  }
};

/**
 * =========================================================
 * GET SINGLE CUSTOM DOCUMENT
 * =========================================================
 */

const getCustomDocument = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } =
      req.params;

    const company_code =
      req.user?.company_code;

    /**
     * =====================================================
     * AUTH
     * =====================================================
     */

    if (!company_code) {
      return res.status(401).json({
        message:
          "Unauthorized",
      });
    }

    /**
     * =====================================================
     * ID VALIDATION
     * =====================================================
     */

    if (
      !validateDocumentId(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid document ID",
      });
    }

    /**
     * =====================================================
     * FETCH
     * =====================================================
     */

    const document =
      await CustomDocument.findOne({
        where: {
          /**
           * ID
           */
          id,

          /**
           * Tenant isolation
           */
          company_code,
        },
      });

    if (!document) {
      return res.status(404).json({
        message:
          "Custom document not found",
      });
    }

    return res.status(200).json({
      data:
        document,
    });
  } catch (err: any) {
    console.error(
      "getCustomDocument error:",
      err
    );

    return res.status(500).json({
      message:
        "Error fetching custom document",
    });
  }
};


//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id } =
//       req.params;

//     const company_code =
//       req.user?.company_code;

//     /**
//      * =====================================================
//      * AUTH
//      * =====================================================
//      */

//     if (!company_code) {
//       return res.status(401).json({
//         message:
//           "Unauthorized",
//       });
//     }

//     /**
//      * =====================================================
//      * ID VALIDATION
//      * =====================================================
//      */

//     if (
//       !validateDocumentId(id)
//     ) {
//       return res.status(400).json({
//         message:
//           "Invalid document ID",
//       });
//     }

//     /**
//      * =====================================================
//      * REQUEST SIZE
//      * =====================================================
//      */

//     if (
//       !validateRequestSize(req.body)
//     ) {
//       return res.status(413).json({
//         message:
//           "Request payload is too large. Maximum allowed size is 2 MB.",
//       });
//     }

//     /**
//      * =====================================================
//      * BODY VALIDATION
//      * =====================================================
//      */

//     const validation =
//       updateCustomDocumentSchema.safeParse(
//         req.body
//       );

//     if (!validation.success) {
//       return res.status(400).json({
//         message:
//           "Validation failed",

//         errors:
//           validation.error.flatten(),
//       });
//     }

//     const data =
//       validation.data;

//     /**
//      * =====================================================
//      * EMPTY UPDATE PROTECTION
//      * =====================================================
//      */

//     if (
//       Object.keys(data).length === 0
//     ) {
//       return res.status(400).json({
//         message:
//           "At least one field is required for update",
//       });
//     }

//     /**
//      * =====================================================
//      * FIND DOCUMENT
//      * =====================================================
//      */

//     const document =
//       await CustomDocument.findOne({
//         where: {
//           id,
//           company_code,
//         },
//       });

//     if (!document) {
//       return res.status(404).json({
//         message:
//           "Custom document not found",
//       });
//     }

//     /**
//      * =====================================================
//      * OLD VALUE FOR AUDIT
//      * =====================================================
//      */

//     const oldDocument =
//       document.toJSON();

//     /**
//      * =====================================================
//      * EXPLICIT UPDATE OBJECT
//      * =====================================================
//      *
//      * Do NOT use:
//      *
//      * document.update(req.body)
//      *
//      * because that can lead to mass assignment
//      * problems.
//      */

//     const updates: {
//       doc_name?: string;
//       sections?: Record<
//         string,
//         any
//       >;
//       section_list?: any[];
//       logo_size?: number;
//       logo?: string | null;
//       pos?: {
//         x: number;
//         y: number;
//       };
//       font_family?: string;
//       page_border?: boolean;
//       is_draft?: boolean;
//     } = {};

//     /**
//      * Document name
//      */
//     if (
//       data.docName !== undefined
//     ) {
//       updates.doc_name =
//         data.docName;
//     }

//     /**
//      * Sections
//      */
//     if (
//       data.sections !== undefined
//     ) {
//       updates.sections =
//         data.sections;
//     }

//     /**
//      * Section list
//      */
//     if (
//       data.sectionList !== undefined
//     ) {
//       updates.section_list =
//         data.sectionList;
//     }

//     /**
//      * Logo size
//      */
//     if (
//       data.logoSize !== undefined
//     ) {
//       updates.logo_size =
//         data.logoSize;
//     }

//     /**
//      * Logo
//      */
//     if (
//       data.logo !== undefined
//     ) {
//       updates.logo =
//         data.logo;
//     }

//     /**
//      * Position
//      */
//     if (
//       data.pos !== undefined
//     ) {
//       updates.pos =
//         data.pos;
//     }

//     /**
//      * Font family
//      */
//     if (
//       data.fontFamily !== undefined
//     ) {
//       updates.font_family =
//         data.fontFamily;
//     }

//     /**
//      * Page border
//      */
//     if (
//       data.pageBorder !== undefined
//     ) {
//       updates.page_border =
//         data.pageBorder;
//     }

//     /**
//      * Draft status
//      */
//     if (
//       data.isDraft !== undefined
//     ) {
//       updates.is_draft =
//         data.isDraft;
//     }

//     /**
//      * =====================================================
//      * UPDATE
//      * =====================================================
//      */

//     await document.update(
//       updates
//     );

//     /**
//      * =====================================================
//      * AUDIT
//      * =====================================================
//      */

//     await audit(req, {
//       module:
//         "custom_document",

//       action:
//         "update",

//       record_id:
//         document.id,

//       old_value:
//         oldDocument,

//       new_value:
//         document.toJSON(),
//     });

//     return res.status(200).json({
//       message:
//         "Custom document updated successfully",

//       data:
//         document,
//     });
//   } catch (err: any) {
//     console.error(
//       "updateCustomDocument error:",
//       err
//     );

//     return res.status(500).json({
//       message:
//         "Error updating custom document",
//     });
//   }
// };

/**
 * =========================================================
 * DELETE CUSTOM DOCUMENT
 * =========================================================
 */

const deleteCustomDocument = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } =
      req.params;

    const company_code =
      req.user?.company_code;

    /**
     * =====================================================
     * AUTH
     * =====================================================
     */

    if (!company_code) {
      return res.status(401).json({
        message:
          "Unauthorized",
      });
    }

    /**
     * =====================================================
     * ID VALIDATION
     * =====================================================
     */

    if (
      !validateDocumentId(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid document ID",
      });
    }

    /**
     * =====================================================
     * FIND DOCUMENT
     * =====================================================
     */

    const document =
      await CustomDocument.findOne({
        where: {
          id,
          company_code,
        },
      });

    if (!document) {
      return res.status(404).json({
        message:
          "Custom document not found",
      });
    }

    /**
     * =====================================================
     * OLD VALUE
     * =====================================================
     */

    const oldDocument =
      document.toJSON();

    /**
     * =====================================================
     * DELETE
     * =====================================================
     */

    await document.destroy();

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     */

    await audit(req, {
      module:
        "custom_document",

      action:
        "delete",

      record_id:
        document.id,

      old_value:
        oldDocument,
    });

    return res.status(200).json({
      message:
        "Custom document deleted successfully",
    });
  } catch (err: any) {
    console.error(
      "deleteCustomDocument error:",
      err
    );

    return res.status(500).json({
      message:
        "Error deleting custom document",
    });
  }
};

/**
 * =========================================================
 * EXPORTS
 * =========================================================
 */

export {
  upsertCustomDocument,
  getAllCustomDocuments,
  getCustomDocument,
  deleteCustomDocument,
};