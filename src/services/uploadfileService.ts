import axios from "axios";
import FormData from "form-data";

const BASE_URL =
  process.env.FILE_SERVICE_URL!;

const API_KEY =
  process.env.FILE_SERVICE_API_KEY!;

const SECRET_KEY =
  process.env.FILE_SERVICE_SECRET_KEY!;

const AUTH_TOKEN =
  `${API_KEY}:${SECRET_KEY}`;

const mimeTypes: Record<
  string,
  string
> = {
  pdf: "application/pdf",

  docx:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  doc: "application/msword",
    jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

const getContentType = (
  filename: string
) => {
  const extension =
    filename
      .split(".")
      .pop()
      ?.toLowerCase() || "";

  return (
    mimeTypes[
      extension
    ] ||
    "application/octet-stream"
  );
};

export const uploadToCentralStorage =
  async (
    file: Express.Multer.File
  ) => {
    try {
      const formData =
        new FormData();

      const contentType =
        getContentType(
          file.originalname
        );

      formData.append(
        "file",
        file.buffer,
        {
          filename:
            file.originalname,

          contentType,
        }
      );

      console.log(
        "📤 SENDING FILE:",
        {
          name:
            file.originalname,

          type:
            contentType,

          size:
            file.buffer
              ?.length,
        }
      );

      const response =
        await axios.post(
          `${BASE_URL}/api/v1/files/upload`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),

              Authorization: `Bearer ${AUTH_TOKEN}`,
            },

            timeout: 30000,

            maxContentLength:
              Infinity,

            maxBodyLength:
              Infinity,
          }
        );

      return response.data
        .data;
    } catch (error: any) {
      console.error(
        "UPLOAD ERROR:",
        error.response
          ?.data ||
          error.message
      );

      throw new Error(
        error.response?.data
          ?.message ||
          "File upload failed"
      );
    }
  };

export const getSignedUrl =
  async (
    fileId: string,
    expiresInMinutes: number = 60
  ) => {
    try {
      const response =
        await axios.post(
          `${BASE_URL}/api/v1/files/signed-url`,
          {
            fileId,
            expiresInMinutes,
          },
          {
            headers: {
              Authorization: `Bearer ${AUTH_TOKEN}`,
            },
          }
        );

      return response.data
        .data.url;
    } catch (error: any) {
      console.error(
        "SIGNED URL ERROR:",
        error.response
          ?.data ||
          error.message
      );

      throw new Error(
        error.response?.data
          ?.message ||
          "Failed to generate signed URL"
      );
    }
  };

export const getFileUrlByFormat =
  async (
    pdfFileId: string,
    docxFileId: string,
    format:
      | "pdf"
      | "docx",
    expiresInMinutes: number = 60
  ) => {
    try {
      let fileId = "";

      if (
        format === "pdf"
      ) {
        fileId =
          pdfFileId;
      }

      if (
        format === "docx"
      ) {
        fileId =
          docxFileId;
      }

      if (!fileId) {
        throw new Error(
          `No ${format} file found`
        );
      }

      const signedUrl =
        await getSignedUrl(
          fileId,
          expiresInMinutes
        );

      return signedUrl;
    } catch (error: any) {
      console.error(
        "FORMAT URL ERROR:",
        error.message
      );

      throw new Error(
        error.message ||
          "Failed to get file URL"
      );
    }
  };

export const deleteFile =
  async (fileId: string) => {
    try {
      const response =
        await axios.delete(
          `${BASE_URL}/api/v1/files/${fileId}`,
          {
            headers: {
              Authorization: `Bearer ${AUTH_TOKEN}`,
            },
          }
        );

      return response.data;
    } catch (error: any) {
      console.error(
        "DELETE FILE ERROR:",
        error.response
          ?.data ||
          error.message
      );

      throw new Error(
        error.response?.data
          ?.message ||
          "Failed to delete file"
      );
    }
  };