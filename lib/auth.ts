import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Admin credentials (in production, store these in a database)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@university.edu";
// For development: hash for password "admin123"
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync("admin123", 10);

export interface JWTPayload {
  email: string;
  role: string;
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  if (email !== ADMIN_EMAIL) {
    return false;
  }
  return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
}

export function generateToken(email: string): string {
  const payload: JWTPayload = {
    email,
    role: "admin",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
