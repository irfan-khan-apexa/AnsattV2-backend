// src/templates/index.ts

import { standardOfferTemplate } from "./standardTemplate";
import { executiveOfferTemplate } from "./executiveTemplate";
import { basicOfferTemplate } from "./basicOfferTemplate";
import { exitLetterTemplate } from "./exitTemplate";
import { experienceLetterTemplate } from "./experienceLetterTemplate";

import { standardSalaryTemplate } from "./standardSalaryTemplate";
import { executiveSalaryTemplate } from "./executiveSalaryTemplate";

const templates: Record<string, (data: any) => string> = {
  standardOfferTemplate: standardOfferTemplate,
  executiveOfferTemplate: executiveOfferTemplate,
  basicOfferTemplate: basicOfferTemplate,

  exitletter: exitLetterTemplate,
  experienceletter: experienceLetterTemplate,

  standardSalaryTemplate: standardSalaryTemplate,
  executiveSalaryTemplate: executiveSalaryTemplate,
};

export default templates;
