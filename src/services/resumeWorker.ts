// import { Worker } from "bullmq";
// import { connection } from "../config/redis";
// import { JobApplication, JobPosting } from "../modules/models/index";
// import pdfParse from "pdf-parse";
// import mammoth from "mammoth";
// import axios from "axios";
// import { decrypt } from "../utils/encryption";
// import { generatePresignedGetUrl } from "../utils/generatePresignedUrl";

// console.log("ATS Worker Started");

// /* ------------------------------------------------ */
// function section(title: string) {
//   console.log("\n==================================================");
//   console.log(title);
//   console.log("==================================================");
// }
// /* ------------------------------------------------ */

// /* ---------------- Normalize ---------------- */

// function normalize(text: string) {
//   return text
//     .toLowerCase()
//     .replace(/[^\w\s]/g, "")
//     .replace(/\s+/g, " ");
// }

// /* ---------------- Extract Skills ---------------- */

// function extractSkills(text: string, requiredSkills: string[]) {

//   section("SKILL MATCHING");

//   const normalizedText = normalize(text);

//   const matched: string[] = [];

//   requiredSkills.forEach(skill => {

//     const skillNormalized = normalize(skill);

//     if (normalizedText.includes(skillNormalized)) {
//       matched.push(skill);
//     }

//   });

//   console.log("Matched skill count:", matched.length);
//   console.log("Matched skills:", matched);

//   return matched;
// }

// /* ------------------------------------------------ */
// /* EXPERIENCE (FIXED LOGIC) */
// /* ------------------------------------------------ */

// function extractExperience(text: string) {

//   section("EXPERIENCE DETECTION");

//   let totalMonths = 0;

//   const today = new Date();

//   /* ---- Detect year ranges (2020 - 2022 / 2020 – Present) ---- */

//   const yearRanges =
//     text.match(/(20\d{2})\s*[-–]\s*(20\d{2}|present)/gi);

//   if (yearRanges) {

//     yearRanges.forEach(range => {

//       const parts =
//         range.split(/[-–]/).map(p => p.trim().toLowerCase());

//       const startYear = parseInt(parts[0]);

//       const endDate =
//         parts[1] === "present"
//           ? today
//           : new Date(`${parts[1]}-01-01`);

//       const startDate = new Date(`${startYear}-01-01`);

//       const months =
//         (endDate.getFullYear() - startDate.getFullYear()) * 12 +
//         (endDate.getMonth() - startDate.getMonth());

//       if (months > 0) {
//         totalMonths += months;
//       }

//     });

//   }

//   /* ---- Detect full date ranges (01/01/2025 – Present) ---- */

//   const dateRanges =
//     text.match(/(\d{2}\/\d{2}\/20\d{2})\s*[-–]\s*(present|\d{2}\/\d{2}\/20\d{2})/gi);

//   if (dateRanges) {

//     dateRanges.forEach(range => {

//       const parts =
//         range.split(/[-–]/).map(p => p.trim().toLowerCase());

//       const startDate = new Date(parts[0]);

//       const endDate =
//         parts[1] === "present"
//           ? today
//           : new Date(parts[1]);

//       const months =
//         (endDate.getFullYear() - startDate.getFullYear()) * 12 +
//         (endDate.getMonth() - startDate.getMonth());

//       if (months > 0) {
//         totalMonths += months;
//       }

//     });

//   }

//   const years = Math.floor(totalMonths / 12);

//   console.log("Calculated experience (years):", years);

//   return years;
// }

// /* ------------------------------------------------ */
// /* PROJECT IMPACT */
// /* ------------------------------------------------ */

// function detectProjectImpact(text: string) {

//   section("PROJECT IMPACT");

//   const verbs = [
//     "built","developed","implemented","designed",
//     "optimized","engineered","created","improved",
//     "integrated","automated","scaled","deployed",
//     "configured","managed","architected"
//   ];

//   const clean = normalize(text);

//   let score = 0;

//   verbs.forEach(v => {
//     if (clean.includes(v)) {
//       score += 3;
//     }
//   });

//   score = Math.min(score, 35);

//   console.log("Project impact score:", score);

//   return score;
// }

// /* ------------------------------------------------ */
// /* ATS SCORE */
// /* ------------------------------------------------ */

// function calculateScore(
//   foundSkills: string[],
//   requiredSkills: string[],
//   experience: number,
//   minExp: number,
//   maxExp: number,
//   projectImpact: number
// ) {

//   section("ATS SCORE CALCULATION");

//   const skillMatch =
//     foundSkills.filter(s => requiredSkills.includes(s));

//   const skillScore =
//     requiredSkills.length
//       ? (skillMatch.length / requiredSkills.length) * 40
//       : 0;

//   /* -------- Experience Score -------- */

//   let expScore = 0;

//   if (experience >= minExp && experience <= maxExp) {
//     expScore = 20;
//   }
//   else if (experience > maxExp) {
//     expScore = 20;
//   }
//   else if (experience >= minExp) {
//     expScore = 15;
//   }
//   else if (experience >= minExp * 0.5) {
//     expScore = 8;
//   }

//   /* -------- Extra score commented -------- */

//   // const extraScore =
//   //   Math.min((foundSkills.length - skillMatch.length) * 2, 15);

//   /* -------- Project Score -------- */

//   const projectScore =
//     Math.min(projectImpact, 35);

//   const finalScore =
//     Math.min(
//       Math.round(
//         skillScore +
//         expScore +
//         projectScore
//       ),
//       100
//     );

//   console.log("Skill score:", Math.round(skillScore));
//   console.log("Experience score:", expScore);
//   console.log("Project score:", projectScore);
//   console.log("Final ATS score:", finalScore);

//   return finalScore;
// }

// /* ------------------------------------------------ */
// /* RANKING */
// /* ------------------------------------------------ */

// async function rankCandidates(jobId: number) {

//   section("RANKING CANDIDATES");

//   const candidates =
//     await JobApplication.findAll({
//       where: { job_id: jobId },
//       order: [
//         ["match_score", "DESC"],
//         ["createdAt", "ASC"]
//       ]
//     });

//   let rank = 1;

//   for (const c of candidates as any[]) {

//     await c.update({ rank });

//     console.log(
//       `Candidate ${c.id} → Rank ${rank} (Score ${c.match_score})`
//     );

//     rank++;

//   }
// }

// /* ------------------------------------------------ */
// /* WORKER */
// /* ------------------------------------------------ */

// new Worker(

// "resume-processing",

// async (job) => {

// try {

// section("PROCESSING APPLICATION");

// const { applicationId } = job.data;

// console.log("Application ID:", applicationId);

// const application: any =
// await JobApplication.findByPk(applicationId);

// if (!application) {
// console.log("Application not found");
// return;
// }

// const jobPost: any =
// await JobPosting.findByPk(application.job_id);

// if (!jobPost) {
// console.log("Job posting not found");
// return;
// }

// console.log("Job title:", jobPost.job_title);

// const requiredSkills =
// jobPost.skills_required
// ? jobPost.skills_required.split(",").map((s:string)=>s.trim())
// : [];

// section("JD SKILL EXTRACTION");

// console.log("JD skill count:", requiredSkills.length);
// console.log("JD skills:", requiredSkills);

// /* -------- Resume Download -------- */

// section("RESUME DOWNLOAD");

// const resumeUrl = decrypt(application.resume_url);

// console.log("Resume URL:", resumeUrl);

// const key =
// resumeUrl.split(`${process.env.WASABI_BUCKET_NAME}/`)[1];

// const presignedUrl =
// await generatePresignedGetUrl(key,300);

// console.log("Presigned URL generated");

// const response =
// await axios.get(presignedUrl,{
// responseType:"arraybuffer",
// timeout:15000
// });

// console.log("Resume downloaded:",response.data.length);

// /* -------- Resume Parsing -------- */

// section("RESUME PARSING");

// let text = "";

// if(resumeUrl.endsWith(".pdf")){

// console.log("Parsing PDF");

// const parsed = await pdfParse(response.data);

// text = parsed.text;

// }

// if(resumeUrl.endsWith(".docx")){

// console.log("Parsing DOCX");

// const parsed =
// await mammoth.extractRawText({
// buffer:response.data
// });

// text = parsed.value;

// }

// if(!text){
// console.log("No text extracted");
// return;
// }

// console.log("Resume text length:",text.length);

// /* -------- Skill Extraction -------- */

// section("RESUME SKILL EXTRACTION");

// const foundSkills =
// extractSkills(text, requiredSkills);

// console.log("Resume skill count:",foundSkills.length);
// console.log("Top resume skills:",foundSkills);

// /* -------- Experience -------- */

// const experience =
// extractExperience(text);

// /* -------- Project Impact -------- */

// const projectImpact =
// detectProjectImpact(text);

// /* -------- Score -------- */

// const score =
// calculateScore(
// foundSkills,
// requiredSkills,
// experience,
// jobPost.experience_min,
// jobPost.experience_max,
// projectImpact
// );

// /* -------- Save Result -------- */

// section("SAVE RESULT");

// await application.update({
// parsed_skills:foundSkills.join(","),
// match_score:score
// });

// console.log("Score saved");

// /* -------- Rank Candidates -------- */

// await rankCandidates(application.job_id);

// section("APPLICATION PROCESSED");

// console.log("Application",applicationId,"completed");

// }
// catch(error){

// console.error("ATS worker error:",error);

// }

// },

// {
// connection,
// concurrency:5
// }

// );