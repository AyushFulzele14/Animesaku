const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");

const env = require("./config/env");
const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = new Set([
        env.clientUrl,
        "http://localhost:5173",
        "http://localhost:5174",
      ]);

      // Allow server-to-server/no-origin requests (e.g. curl/postman)
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.cookieSecret));

app.get("/health", (_req, res) => res.json({ success: true, message: "Server is healthy" }));
app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
