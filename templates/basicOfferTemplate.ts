const basicOfferTemplate = (data: {
  name: string;
  designation: string;
  department: string;
  joining_date: string;
  company_name: string;
  probation_period: string;
}) => {
  return `
================================================================================
                                OFFER LETTER
================================================================================

                          ${data.company_name.toUpperCase()}
                         Human Resources Department

Date: ${data.joining_date}

--------------------------------------------------------------------------------

To,
${data.name}

Subject: OFFER OF EMPLOYMENT FOR THE POSITION OF ${data.designation.toUpperCase()}

--------------------------------------------------------------------------------

Dear ${data.name},

We are pleased to offer you the position of "${data.designation}" in the 
"${data.department}" department at ${data.company_name}.

Your qualifications, experience, and professional capabilities impressed us 
during the selection process, and we are confident that you will be a valuable 
addition to our organization.

================================================================================
                             EMPLOYMENT DETAILS
================================================================================

• Designation        : ${data.designation}

• Department         : ${data.department}

• Joining Date       : ${data.joining_date}

• Employment Type    : Full-Time

• Probation Period   : ${data.probation_period}

• Work Location      : Company Office / Assigned Location

• Reporting To       : Reporting Manager / Team Lead

================================================================================
                              TERMS & CONDITIONS
================================================================================

1. You are expected to maintain professionalism, integrity, and ethical conduct
   throughout your employment tenure.

2. All company information, records, and intellectual property must remain
   confidential during and after employment.

3. Your employment is subject to successful document verification,
   background checks, and compliance with company policies.

4. During the probation period, your performance and conduct will be evaluated
   according to company standards.

5. Compensation, benefits, leave structure, and company policies shall apply
   as per organizational guidelines.

================================================================================
                              ACCEPTANCE OF OFFER
================================================================================

Please sign and return a copy of this letter as confirmation of your acceptance
of the terms and conditions mentioned above.

We look forward to welcoming you to the ${data.company_name} family and wish you
a successful and rewarding career with us.

--------------------------------------------------------------------------------

Warm Regards,

HR Manager
${data.company_name}

Authorized Signatory

================================================================================
                             EMPLOYEE ACCEPTANCE
================================================================================

I, ${data.name}, hereby accept the offer of employment and agree to abide by
the terms and conditions stated above.

Employee Signature : ________________________________

Date               : ________________________________

`;
};

export { basicOfferTemplate };