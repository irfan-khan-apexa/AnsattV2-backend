const standardOfferTemplate = (data: {
  name: string;
  designation: string;
  department: string;
  joining_date: string;
  company_name: string;
  probation_period: string;
}) => {
  return `
    OFFER LETTER  standartd

    Dear ${data.name},

    We are pleased to offer you the position of ${data.designation} in the ${data.department} department at ${data.company_name}.

    Your expected date of joining is ${data.joining_date} and you will be on a probation period of ${data.probation_period}.

    We look forward to having you on our team.

    Regards,
    HR Team
    ${data.company_name}
  `;
};

export { standardOfferTemplate };
