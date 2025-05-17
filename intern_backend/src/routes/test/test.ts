import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  console.log("hello");

  res.json({ res: "ok" });
});

export default router;
