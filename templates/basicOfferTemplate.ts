const basicOfferTemplate = (data: {
  name: string;
  designation: string;
  department: string;
  joining_date: string;
  company_name: string;
  probation_period: string;
}) => {
  return `
${data.company_name}
HR Department
Date: ${data.joining_date}

To,
${data.name}

Subject: Offer of Employment

Dear ${data.name},

We are delighted to offer you the position of ${data.designation} in the ${data.department} department at ${data.company_name}. Based on our discussions and your qualifications, we believe you will be a valuable addition to our team.

Your employment will be governed by the following terms and conditions:

1. Designation: ${data.designation}  
2. Department: ${data.department}  
3. Date of Joining: ${data.joining_date}  
4. Place of Posting: [Insert Location]  
5. Probation Period: ${data.probation_period}  
6. Compensation: [As discussed / Mention salary details or attach annexure]  
7. Working Hours: [Standard company timings or specific shift, if applicable]  
8. Confidentiality: You shall not disclose any confidential information or documents to any third party, both during and after the tenure of your employment.

Please note that this offer is contingent upon the successful completion of reference and background checks, and submission of required documents.

Kindly sign and return a copy of this letter as a token of your acceptance. We look forward to welcoming you to ${data.company_name}.

Warm regards,

HR Manager  
${data.company_name}

[Signature Placeholder]
  `;
};
export { basicOfferTemplate };
