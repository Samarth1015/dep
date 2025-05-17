// E:\intern_backend\Service\JWTservice\jwtverify.ts
import jwt from "jsonwebtoken";
import { prisma } from "../../client/db";
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "../../src/config/config";

interface TokenDesign {
  id: number | undefined;
  email: string | undefined;
  accessKey: string | undefined;
  secretAccessKey: string | undefined;
}

class JWTService {
  public static async tokenVerify(googleToken: string): Promise<Object> {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${googleToken}` },
      method: "GET",
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        error: data.error || "invalid_request",
        error_description: data.error_description || "Invalid token",
      };
    }

    return data;
  }

  public static async generateJWT(
    id: number,
    tokenType: "access" | "refresh" = "access"
  ): Promise<string> {
    const secret = tokenType === "access" ? JWT_SECRET : REFRESH_TOKEN_SECRET;
    const expiresIn = tokenType === "access" ? "7d" : "7d";
    const user = await prisma.user.findUnique({ where: { id: id } });

    const payload: TokenDesign = {
      id: user?.id,
      email: user?.email,
      accessKey: user?.accessKeyID,
      secretAccessKey: user?.secretAccesskeyId,
    };

    const token = jwt.sign(payload, secret, {
      expiresIn,
    });

    return token;
  }

  public static verifyJWT(
    token: string,
    tokenType: "access" | "refresh" = "access"
  ): any {
    const secret = tokenType === "access" ? JWT_SECRET : REFRESH_TOKEN_SECRET;
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw error;
    }
  }

  static async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = this.verifyJWT(refreshToken, "refresh");
      return await this.generateJWT(decoded.id, "access");
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
}

export default JWTService;
