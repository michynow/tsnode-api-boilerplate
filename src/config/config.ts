import dotenv from "dotenv";
dotenv.config();

const MONGO_USERNAME = process.env.DB_USERNAME || "";
const MONGO_PASSWORD = process.env.DB_PASSWORD || "";
const MONGO_URL = ``;
const PORT = process.env.SERVER_PORT
  ? Number(process.env.SERVER_PORT)
  : 1337;

export const config = {
  mongo: {
    url: MONGO_URL,
  },
  server: {
    port: PORT,
  },
};
