// E:\intern_backend\src\routes\isCredGiven\isCregGive.ts
import { Router, Request, Response } from "express";
import JWTService from "../../../Service/JWTservice/jwtverify";
import { prisma } from "../../../client/db";

const router = Router();

router.post("/", async (req: any, res: any) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user) {
      // Generate both access and refresh tokens
      const accessToken = await JWTService.generateJWT(user.id, "access");
      const refreshToken = await JWTService.generateJWT(user.id, "refresh");

      return res.status(200).json({
        present: true,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }

    return res.status(200).json({ present: false });
  } catch (error) {
    console.error("Error in isCredGiven:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
