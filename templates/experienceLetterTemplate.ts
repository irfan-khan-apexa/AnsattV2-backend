export const experienceLetterTemplate = (
  data: {
    name: string;
    designation: string;
    department: string;
    joining_date: string;
    exit_date: string;
    company_name: string;
    company_address?: string;
  }
) => {
  return `

EXPERIENCE LETTER


${data.company_name}

Human Resources Department

Date: ${new Date().toLocaleDateString()}


TO WHOMSOEVER IT MAY CONCERN


This is to certify that Mr./Ms. ${data.name} was employed with ${data.company_name} as a ${data.designation} in the ${data.department} department from ${data.joining_date} to ${data.exit_date}.

During the tenure of employment, the employee demonstrated professionalism, dedication, and sincerity towards assigned responsibilities.

The conduct and performance of the employee were found to be satisfactory throughout the employment period.

We appreciate the contributions made during the association with the organization and wish them success in all future endeavors.


Warm Regards,

HR Department
${data.company_name}

Authorized Signatory

`;
};