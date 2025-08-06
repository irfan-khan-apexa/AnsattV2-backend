const executiveOfferTemplate = (data: {
  name: string;
  designation: string;
  department: string;
  joining_date: string;
  company_name: string;
  probation_period: string;
}) => {
  return `
    EXECUTIVE OFFER LETTER

    Dear ${data.name},

    ${data.company_name} is excited to extend this offer for the position of ${data.designation}, a critical role in our ${data.department} division.

    Your joining date is scheduled for ${data.joining_date}. An initial probation period of ${data.probation_period} will apply.

    We anticipate your contributions to our leadership team and welcome you aboard.

    Sincerely,
    Executive HR
    ${data.company_name}
  `;
};

export { executiveOfferTemplate };
