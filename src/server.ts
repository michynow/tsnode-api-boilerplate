import express from "express";
import http from "http";
import mongoose from "mongoose";
import { config } from "./config/config";
import Logging from "./library/Logging";
import chalk from "chalk";

const router = express();

mongoose
  .connect(config.mongo.url, { w: "majority", retryWrites: true })
  .then(() => {
    Logging.info("Connected to mongoDB");
    startServer();
  })
  .catch((err) => {
    Logging.error("Unable to connect:");
    Logging.error(err);
  });

const startServer = () => {
  router.use((req, res, next) => {
    Logging.info(
      `${chalk.yellow("Incoming")} -> Method: [${req.method}] - URL : [${
        req.url
      }] - IP: [${req.socket.remoteAddress}]`
    );
    res.on("finish", () => {
      const statusCodeColor = (code: number | string) => {
        if (res.statusCode >= 400) {
          return chalk.redBright(code);
        } else if (res.statusCode >= 300) {
          return chalk.yellowBright(code);
        } else {
          return chalk.greenBright(code);
        }
      };
      Logging.info(
        `${statusCodeColor("Outgoing")} <- Method: [${req.method}] - URL : [${
          req.url
        }] - IP: [${req.socket.remoteAddress}] - Status: [${statusCodeColor(
          res.statusCode
        )}]`
      );
    });
    next();
  });
  router.use(express.urlencoded({ extended: true }));
  router.use(express.json());

  router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if (req.method === "OPTIONS") {
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE"
      );
      return res.status(200).json({});
    }
    next();
  });

  // Health check
  router.get("/ping", (req, res, next) =>
    res.status(200).json({ message: "pong" })
  );

  //Error handling
  router.use((req, res, next) => {
    const error = new Error("not found");
    Logging.error(error);

    return res.status(404).json({ message: error.message });
  });

  http.createServer(router).listen(config.server.port, () => {
    Logging.info(`Server is running on port ${config.server.port}`);
  });
};
