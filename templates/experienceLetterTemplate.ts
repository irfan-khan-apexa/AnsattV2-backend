export const experienceLetterTemplate = ({
  name,
  designation,
  department,
  joining_date,
  exit_date,
  company_name,
  company_address,
}: {
  name: string;
  designation: string;
  department?: string;
  joining_date: string;
  exit_date: string;
  company_name: string;
  company_address?: string;
}) => {
  return `
${company_name}
Date: ${new Date().toLocaleDateString()}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that ${name} was employed with ${company_name} as a ${designation}${
    department ? ` in the ${department} department` : ""
  } from ${joining_date} to ${exit_date}.

During the tenure of their employment, ${
    name.split(" ")[0]
  } demonstrated professionalism, dedication, and a strong commitment to their responsibilities. Their performance was satisfactory, and they maintained cordial relations with colleagues and management.

We appreciate the contributions made by ${
    name.split(" ")[0]
  } during their tenure with us and wish them all the best for their future endeavors.

Sincerely,
HR Department
${company_name}${company_address ? `\n${company_address}` : ""}
  `;
};
