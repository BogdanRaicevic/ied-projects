import { Router, Request, Response } from "express";
import { findUserByEmail } from "../services/ied-user.service";
const router = Router();

type UserRequestParams = {
  email: string;
};

router.get("/:email", async (req: Request<UserRequestParams>, res: Response) => {
  const { email } = req.params;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User nije pronadjen" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server errro" });
  }
});

export default router;
