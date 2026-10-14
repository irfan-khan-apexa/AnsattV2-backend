import { z } from "zod";

export const updateSalarySchema = z
  .object({
    month: z
      .string()
      .trim()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "month must be in YYYY-MM format")
      .optional(),

    basic: z.number().finite().nonnegative().optional(),

    hra: z.number().finite().nonnegative().optional(),

    allowances: z.number().finite().nonnegative().optional(),

    deductions: z.number().finite().nonnegative().optional(),

    bonus: z.number().finite().nonnegative().optional(),

    pf_esic_pt: z.number().finite().nonnegative().optional(),

    employer_pf: z.number().finite().nonnegative().optional(),
  })
  .strict();

export type UpdateSalaryDTO = z.infer<typeof updateSalarySchema>;
