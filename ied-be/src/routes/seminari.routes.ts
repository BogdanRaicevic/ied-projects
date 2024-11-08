import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.post("/save", async (req: Request, res: Response) => {
  const { name, lecturer, location } = req.body;
  console.log("Received seminar:", { name, lecturer, location });

  try {
    res.send({ name, lecturer, location });
    console.log("Received seminar:", { name, lecturer, location });
  } catch (error) {
    console.error("Error creating seminar:", error);
    res.status(500).send("Error creating seminar");
  }
});

export default router;
