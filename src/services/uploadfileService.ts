import axios from "axios";
import FormData from "form-data";

const BASE_URL = process.env.FILE_SERVICE_URL!;

const API_KEY = process.env.FILE_SERVICE_API_KEY!;
const SECRET_KEY = process.env.FILE_SERVICE_SECRET_KEY!;

// 🔥 API AUTH HEADER
const AUTH_TOKEN = `${API_KEY}:${SECRET_KEY}`;

// ================= UPLOAD =================
export const uploadToCentralStorage = async (
  file: Express.Multer.File
) => {
  try {
    const formData = new FormData();

   formData.append(
  "file",
  file.buffer,
  {
    filename:
      file.originalname,

    contentType:
      file.mimetype,
  }
);
console.log(
  "📤 SENDING FILE:",
  {
    name: file.originalname,
    type: file.mimetype,
    size: file.buffer?.length,
  }
);

    const response = await axios.post(
      `${BASE_URL}/api/v1/files/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),

          Authorization: `Bearer ${AUTH_TOKEN}`,
        },

        maxBodyLength: Infinity,
      }
    );

    return response.data.data;

    /*
      {
        id,
        fileId,
        hash,
        size,
        originalName
      }
    */
  } catch (error: any) {
    console.error(
      "UPLOAD ERROR:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "File upload failed"
    );
  }
};

// ================= SIGNED URL =================
export const getSignedUrl = async (
  fileId: string,
  expiresInMinutes: number = 60
) => {
  try {
    const response = await axios.post(
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

    return response.data.data.url;
  } catch (error: any) {
    console.error(
      "SIGNED URL ERROR:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to generate signed URL"
    );
  }
};

// ================= DELETE FILE =================
export const deleteFile = async (
  fileId: string
) => {
  try {
    const response = await axios.delete(
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
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to delete file"
    );
  }
};