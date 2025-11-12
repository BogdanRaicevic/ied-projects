import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { addSuppressedEmail } from "../services/email_surrpression.service";

const router = Router();

router.put("/add", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emails, reason } = req.body;
    await addSuppressedEmail(emails, reason);
    res.status(201).send("Suppressed emails added successfully");
  } catch (error) {
    next(error);
  }
});

export default router;
