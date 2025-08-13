// src/templates/index.ts

import { standardOfferTemplate } from "./standardTemplate";
import { executiveOfferTemplate } from "./executiveTemplate";
import { generateOfferContent } from "./offerTemplate";
import { exitLetterTemplate } from "./exitTemplate";
import { experienceLetterTemplate } from "./experienceLetterTemplate";

const templates: Record<string, (data: any) => string> = {
  standard: standardOfferTemplate,
  executive: executiveOfferTemplate,
  offerletter: generateOfferContent,
  exitletter: exitLetterTemplate,
  experienceletter: experienceLetterTemplate,
};

export default templates;
