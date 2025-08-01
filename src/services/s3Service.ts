// import AWS from "aws-sdk";

// // Setup for Wasabi
// const s3 = new AWS.S3({
//   endpoint: "https://s3.ap-northeast-1.wasabisys.com",
//   accessKeyId: process.env.WASABI_ACCESS_KEY,
//   secretAccessKey: process.env.WASABI_SECRET_KEY,
//   region: "ap-northeast-1",
//   signatureVersion: "v4",
// });

// // Presigned URL generator
// export const getPresignedUrl = async (
//   bucket: string,
//   key: string,
//   expiresIn = 60
// ) => {
//   const params = {
//     Bucket: bucket,
//     Key: key,
//     Expires: expiresIn, // time in seconds (e.g., 60 seconds = 1 min)
//   };

//   try {
//     const url = await s3.getSignedUrlPromise("getObject", params);
//     return url;
//   } catch (err) {
//     console.error(`Error generating presigned URL for ${key}:`, err);
//     return null;
//   }
// };
