import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

//userul e autentificat?
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const [type, token] = auth.split(" ");

  //verf daca exosta tokenul
  if (type !== "Bearer" || !token) return res.status(401).json({ message: "Missing token" });

  try {
    //decodare token
    const payload = jwt.verify(token, env.jwtSecret);
    //atasam userId si email la request
    req.user = payload;
    next();
  } catch {
    //token invalid
    return res.status(401).json({ message: "Invalid token" });
  }
}
