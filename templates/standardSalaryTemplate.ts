// export const standardSalaryTemplate = ({ employee, salary }: any): string => {
//   return `
// ${employee.company_code} - Salary Slip  /////*
// Employee: ${employee.name}
// Designation: ${employee.designation}
// Month: ${salary.month}

// Basic: ${salary.basic}
// HRA: ${salary.hra}
// Allowances: ${salary.allowances}
// Bonus: ${salary.bonus}
// Deductions: ${salary.deductions}

// Net Salary: ${salary.net_salary}

// This is a system generated salary slip.
//   `;
// };



// templates/standardSalaryPlain.ts
export const standardSalaryTemplate = ({ employee, salary }: any): string => {
  const WIDTH = 79;
  const LEFT = 38;
  const GAP = 3;
  const RIGHT = WIDTH - LEFT - GAP;

  const NL = "\n";

  const padR = (str: string, len: number) => String(str ?? "").padEnd(len, " ");
  const padL = (str: string, len: number) => String(str ?? "").padStart(len, " ");
  const center = (txt: string, len: number) => {
    txt = String(txt ?? "");
    if (txt.length >= len) return txt.slice(0, len);
    const left = Math.floor((len - txt.length) / 2);
    return " ".repeat(left) + txt + " ".repeat(len - left - txt.length);
  };

  const money = (v: any) =>
    Number(v || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Actual company name priority
  const company =
    employee.company_name ||
    employee.company ||
    employee.companyCode ||
    employee.company_code ||
    "Company";

  const name = employee.name || "-";
  const empId = employee.employee_code ?? employee.id ?? "-";
  const desig = employee.designation || "-";
  const dept = employee.department || "-";
  const month = salary.month || "-";
  const payDate = salary.pay_date || "-";

  // Earnings
  const basic = money(salary.basic);
  const hra = money(salary.hra);
  const allow = money(salary.allowances);
  const bonus = money(salary.bonus);
  const gross =
    money(
      salary.gross ??
        Number(salary.basic || 0) +
          Number(salary.hra || 0) +
          Number(salary.allowances || 0) +
          Number(salary.bonus || 0)
    );

  // Deductions
  const deductions = money(salary.deductions);
  const pf = money(salary.pf_esic_pt);
  const totalDed = money(
    Number(salary.deductions || 0) + Number(salary.pf_esic_pt || 0)
  );

  // Net
  const net = money(salary.net_salary);
  const ctc = money(salary.ctc);

  const line = "-".repeat(WIDTH);

  let out = "";

  // Header (Centered)
  out += center(`${company.toUpperCase()} - SALARY SLIP`, WIDTH) + NL;
  out += line + NL;

  // Meta
  const leftMeta = [
    `Employee      : ${name} (${empId})`,
    `Designation   : ${desig}`,
    `Pay Date      : ${payDate}`,
  ];

  const rightMeta = [
    `Month        : ${month}`,
    `Department   : ${dept}`,
    `CTC          : ₹ ${ctc}`,
  ];

  for (let i = 0; i < 3; i++) {
    out +=
      padR(leftMeta[i], LEFT) +
      " ".repeat(GAP) +
      padR(rightMeta[i], RIGHT) +
      NL;
  }

  out += line + NL;

  // Headers Earnings / Deductions
  out +=
    center("E A R N I N G S", LEFT) +
    " ".repeat(GAP) +
    center("D E D U C T I O N S", RIGHT) +
    NL;

  out += line + NL;

  const rows = [
    { L: `Basic         : ₹ ${basic}`, R: `Deductions   : ₹ ${deductions}` },
    { L: `HRA           : ₹ ${hra}`, R: `PF/ESIC/PT   : ₹ ${pf}` },
    { L: `Allowances    : ₹ ${allow}`, R: "" },
    { L: `Bonus         : ₹ ${bonus}`, R: "" },
  ];

  for (const r of rows) {
    out +=
      padR(r.L, LEFT) + " ".repeat(GAP) + padR(r.R ?? "", RIGHT) + NL;
  }

  out += line + NL;

  // Totals
  out +=
    padR(`Total Earnings: ₹ ${gross}`, LEFT) +
    " ".repeat(GAP) +
    padR(`Total Deductions: ₹ ${totalDed}`, RIGHT) +
    NL;

  out += line + NL;

  // Net Salary center-right
  const netLine = center(`Net Salary (Payable) : ₹ ${net}`, WIDTH);
  out += netLine + NL;
  out += line + NL;

  out +=
    "Note: This is a system generated salary slip. Employer contributions are shown under CTC." +
    NL +
    NL;

  out +=
    padR("Prepared By: ________________________", LEFT + 5) +
    "Authorized Signatory: ________________________" +
    NL;

  return out;
};





