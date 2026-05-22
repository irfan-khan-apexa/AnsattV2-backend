const executiveOfferTemplate = (data: {
  name: string;
  designation: string;
  department: string;
  joining_date: string;
  company_name: string;
  probation_period: string;
}) => {
  return `
================================================================================
                           EXECUTIVE OFFER LETTER
================================================================================

                           ${data.company_name.toUpperCase()}
                         Executive Human Resources

Date: ${data.joining_date}

--------------------------------------------------------------------------------

To,
${data.name}

Subject: EXECUTIVE APPOINTMENT FOR THE POSITION OF
         ${data.designation.toUpperCase()}

--------------------------------------------------------------------------------

Dear ${data.name},

We are delighted to formally extend this offer of employment for the position
of "${data.designation}" at ${data.company_name}.

After careful evaluation of your professional experience, leadership qualities,
and strategic capabilities, we are confident that you will play a valuable role
in strengthening our ${data.department} division and contributing to the
continued growth and success of the organization.

================================================================================
                             EXECUTIVE DETAILS
================================================================================

• Designation        : ${data.designation}

• Department         : ${data.department}

• Joining Date       : ${data.joining_date}

• Employment Type    : Full-Time Executive Position

• Probation Period   : ${data.probation_period}

• Work Location      : Corporate Office / Assigned Branch

• Reporting Authority: Senior Management / Board Representative

================================================================================
                             KEY RESPONSIBILITIES
================================================================================

1. Provide strategic direction and leadership within the assigned department.

2. Ensure operational excellence, compliance, and professional conduct.

3. Collaborate with management teams to achieve organizational objectives.

4. Maintain confidentiality of company information and executive decisions.

5. Represent the organization with professionalism and integrity at all times.

================================================================================
                              TERMS & CONDITIONS
================================================================================

1. Your employment is subject to company policies, document verification,
   and management approval.

2. During the probation period, your performance and leadership effectiveness
   will be reviewed by senior management.

3. All confidential company records, business strategies, and internal matters
   must remain strictly confidential during and after employment.

4. Compensation structure, executive benefits, and allowances shall be governed
   by company policies and executive agreements.

================================================================================
                              ACCEPTANCE OF OFFER
================================================================================

Please sign and return a copy of this letter as confirmation of your acceptance
of the terms and conditions stated herein.

We are excited to welcome you to ${data.company_name} and look forward to your
valuable contributions to our leadership team.

--------------------------------------------------------------------------------

Warm Regards,

Executive HR
${data.company_name}

Authorized Signatory

================================================================================
                             EMPLOYEE ACCEPTANCE
================================================================================

I, ${data.name}, hereby accept the position of "${data.designation}" at
${data.company_name} and agree to abide by the terms and conditions
mentioned in this offer letter.

Employee Signature : ________________________________

Date               : ________________________________

`;
};

export { executiveOfferTemplate };