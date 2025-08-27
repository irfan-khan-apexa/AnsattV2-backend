export const standardSalaryTemplate = ({ employee, salary }: any): string => {
  return `
${employee.company_code} - Salary Slip  /////*
Employee: ${employee.name}
Designation: ${employee.designation}
Month: ${salary.month}

Basic: ${salary.basic}
HRA: ${salary.hra}
Allowances: ${salary.allowances}
Bonus: ${salary.bonus}
Deductions: ${salary.deductions}

Net Salary: ${salary.net_salary}

This is a system generated salary slip.
  `;
};
