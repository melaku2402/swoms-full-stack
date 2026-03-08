import dotenv from "dotenv";
dotenv.config();

export default {
  NODE_ENV: process.env.NODE_ENV ,
  PORT: process.env.PORT || 5000,

  // Database
  DB_HOST: process.env.DB_HOST ,
  DB_PORT: process.env.DB_PORT ,
  DB_USER: process.env.DB_USER ,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME ,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET ,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ,

  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // University
  UNIVERSITY_NAME: "Injibara University",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
