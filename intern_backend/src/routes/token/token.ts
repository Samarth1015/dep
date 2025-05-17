// E:\intern_backend\src\routes\token\token.ts
import { Router, Request, Response, RequestHandler } from "express";
import JWTService from "../../../Service/JWTservice/jwtverify";
import { prisma } from "../../../client/db";

const router = Router();

interface ReqBody {
  googleToken: string;
  accesskey: string;
  secretaccesskey: string;
}

interface DecodePayload {
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
}

interface ErrorPayload {
  error: string;
  error_description: string;
}

const handleToken: RequestHandler = async (req, res, next) => {
  try {
    console.log("req in verify");
    const { googleToken, accesskey, secretaccesskey } = req.body as ReqBody;

    if (!googleToken || !accesskey || !secretaccesskey) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const result = await JWTService.tokenVerify(googleToken);

    if ("error" in result) {
      const error = result as ErrorPayload;
      res.status(401).json({
        message: "Google token verification failed",
        details: error.error_description,
      });
      return;
    }

    const decodedPayload = result as DecodePayload;
    console.log("Decoded Google User:", decodedPayload);

    const existingUser = await prisma.user.findUnique({
      where: { email: decodedPayload.email },
    });

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email: decodedPayload.email,
          name: decodedPayload.given_name,
          accessKeyID: accesskey,
          secretAccesskeyId: secretaccesskey,
        },
      });
      res.status(200).json({ token: await JWTService.generateJWT(newUser.id) });
      return;
    }

    res
      .status(200)
      .json({ token: await JWTService.generateJWT(existingUser.id) });
  } catch (err) {
    console.error("Error in /token route:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleVerifyGoogleToken: RequestHandler = async (req, res, next) => {
  try {
    const { googleToken, secretaccesskey, accesskey } = req.body as ReqBody;

    if (!googleToken || !secretaccesskey || !accesskey) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const result = await JWTService.tokenVerify(googleToken);

    if ("error" in result) {
      res.status(401).json({ error: "Invalid Google token" });
      return;
    }

    const decodedPayload = result as DecodePayload;

    const user =
      (await prisma.user.findUnique({
        where: { email: decodedPayload.email },
      })) ||
      (await prisma.user.create({
        data: {
          email: decodedPayload.email,
          name: decodedPayload.given_name,
          accessKeyID: accesskey,
          secretAccesskeyId: secretaccesskey,
        },
      }));

    const accessToken = await JWTService.generateJWT(user.id, "access");
    const refreshToken = await JWTService.generateJWT(user.id, "refresh");
    console.log("tmkc");
    res.json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ error: "Invalid credentials" });
  }
};

const handleRefresh: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    const newAccessToken = await JWTService.refreshAccessToken(refreshToken);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

const handleVerifyToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid token" });
      return;
    }

    const token = authHeader.split(" ")[1];
    await JWTService.verifyJWT(token, "access");
    res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

router.post("/", handleToken);
router.post("/verifyGoogleToken", handleVerifyGoogleToken);
router.post("/refresh", handleRefresh);
router.get("/verifyToken", handleVerifyToken);

export default router;
