export const exitLetterTemplate = ({
  name,
  designation,
  department,
  joining_date,
  exit_date,
  company_name,
}: {
  name: string;
  designation: string;
  department?: string;
  joining_date: string;
  exit_date: string;
  company_name: string;
}) => {
  return `
${company_name}
Date: ${new Date().toLocaleDateString()}

To,
${name}

Subject: Exit Letter / reliving Letter ///////*

Dear ${name},

This is to certify that you were employed with ${company_name} as a ${designation}${
    department ? ` in the ${department} department` : ""
  } from ${joining_date} to ${exit_date}.

During your tenure, your performance was satisfactory and your conduct was professional.

We thank you for your services and wish you success in your future endeavors.

Sincerely,  
HR Department  
${company_name}
  `;
};
