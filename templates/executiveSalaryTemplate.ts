export const executiveSalaryTemplate = ({
  employee,
  salary,
}: any): string => {
  return `
================================================================================
                               EXECUTIVE SALARY SLIP
================================================================================

                            COMPANY EXECUTIVE
                         ${employee.company_code}

================================================================================
                             EMPLOYEE DETAILS
================================================================================

Employee Name      : ${employee.name}

Employee ID        : ${employee.employee_id || "N/A"}

Designation        : ${employee.designation}

Department         : ${employee.department || "N/A"}

Salary Month       : ${salary.month}

Payment Status     : Paid

================================================================================
                              EARNINGS DETAILS
================================================================================

Basic Salary       : ₹ ${salary.basic}

House Rent Allow.  : ₹ ${salary.hra}

Allowances         : ₹ ${salary.allowances}

Bonus              : ₹ ${salary.bonus}

--------------------------------------------------------------------------------

Total Earnings     : ₹ ${
    Number(salary.basic || 0) +
    Number(salary.hra || 0) +
    Number(salary.allowances || 0) +
    Number(salary.bonus || 0)
  }

================================================================================
                             DEDUCTION DETAILS
================================================================================

Total Deductions   : ₹ ${salary.deductions}

================================================================================
                               NET SALARY
================================================================================

Net Salary Payable : ₹ ${salary.net_salary}

================================================================================
                                  NOTE
================================================================================

This is a system-generated salary slip and does not require a physical signature.

Generated On       : ${new Date().toLocaleDateString()}

================================================================================
                           AUTHORIZED SIGNATORY
================================================================================


HR Department
${employee.company_code}

`;
};