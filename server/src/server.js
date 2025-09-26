import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import session from "express-session";
import passport from "./config/passportConfig.js";

import { connectDB } from "./config/mongodbConfig.js";
import Route from "./routes/v1/index.js";
import errorHandler from "./middlewares/errorhandle.js";
import { socketAuth } from "./middlewares/checkToken.js";
import chatHandler from "./sockets/chatHandler.js";

const app = express();

// Reduce noisy logs in production while preserving warnings/errors
if (process.env.NODE_ENV === 'production') {
  // Keep error and warn for visibility, silence log/debug/info
  // eslint-disable-next-line no-console
  console.log = () => {};
  // eslint-disable-next-line no-console
  console.debug = () => {};
  // eslint-disable-next-line no-console
  console.info = () => {};
}
const hostname = "localhost";
const apiPort = 5000;

// ===== Kết nối DB =====
connectDB();

// ===== Middleware API =====
app.use(
  cors({
    origin: [`http://${hostname}:3000`], // cho frontend dev
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-fallback-session-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// routes
Route(app);

// error handling
app.use(errorHandler);

// ===== Tạo HTTP server chung =====
const httpServer = createServer(app);

// ===== Socket.IO gắn chung vào httpServer =====
const io = new Server(httpServer, {
  cors: {
    origin: [`http://${hostname}:3000`], // cho frontend dev
    methods: ["GET", "POST"],
    credentials: true,
  },
  serveClient: true, // cho phép /socket.io/socket.io.js
});

// middleware auth
io.use(socketAuth);

// handler
io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);
  chatHandler(io, socket);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ===== Start server (API + Socket.IO) =====
httpServer.listen(apiPort, hostname, () => {
  console.log(`🚀 Server (API + Socket.IO) running at http://${hostname}:${apiPort}/`);
});
