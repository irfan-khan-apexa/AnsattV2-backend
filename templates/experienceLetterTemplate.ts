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
${company_address ? company_address + "\n" : ""}Date: ${new Date().toLocaleDateString()}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that Mr./Ms. ${name} was employed with ${company_name} as a ${designation}${
department ? ` in the ${department} department` : ""
} from ${joining_date} to ${exit_date}.

During their tenure with us, ${name.split(" ")[0]} exhibited professionalism, dedication, and a strong commitment to their responsibilities. They consistently demonstrated competence in performing their duties and maintained harmonious relationships with colleagues and management.

We sincerely appreciate the valuable contributions of ${name.split(" ")[0]} and wish them continued success in their future endeavors.

Sincerely,

---

HR Department
${company_name}
`;
};
