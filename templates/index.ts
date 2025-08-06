// src/templates/index.ts

import { standardOfferTemplate } from "./standardTemplate";
import { executiveOfferTemplate } from "./executiveTemplate";
import { generateOfferContent } from "./offerTemplate";

const templates: Record<string, (data: any) => string> = {
  standard: standardOfferTemplate,
  executive: executiveOfferTemplate,
  offerletter: generateOfferContent,
};

export default templates;
