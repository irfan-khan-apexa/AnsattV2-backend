import { Router } from "express";
import { addToken, checktoken, getBlacklistedToken } from "../../controllers";

const blackListedTokenRouter = Router();

blackListedTokenRouter.post("/blacklistedtoken", addToken);
blackListedTokenRouter.get("/get-all-tokens", getBlacklistedToken);
blackListedTokenRouter.get("/checktoken", checktoken);

export { blackListedTokenRouter };
