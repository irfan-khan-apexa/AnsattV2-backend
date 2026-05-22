export const exitLetterTemplate = (
  data: {
    name: string;
    designation: string;
    department: string;
    joining_date: string;
    exit_date: string;
    company_name: string;
  }
) => {
  return `

EXIT / RELIEVING LETTER


${data.company_name}

Human Resources Department

Date: ${new Date().toLocaleDateString()}


To,
${data.name}


Subject: Exit / Relieving Letter


Dear ${data.name},

This is to certify that you were employed with ${data.company_name} as a ${data.designation} in the ${data.department} department from ${data.joining_date} to ${data.exit_date}.

During your tenure with the organization, your performance and professional conduct were found to be satisfactory.

All responsibilities and duties assigned to you have been formally relieved effective from your last working day.

We sincerely thank you for your contributions to the organization and wish you success and prosperity in your future endeavors.


Warm Regards,

HR Department
${data.company_name}

Authorized Signatory

`;
};