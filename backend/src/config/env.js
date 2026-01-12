import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "test123",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  timeApiUrl: process.env.TIME_API_URL || "https://worldtimeapi.org/api/timezone/Europe/Bucharest",
};
