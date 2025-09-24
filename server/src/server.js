import express from "express";
import { mapOrder } from "~/utils/sorts.js";
import bodyparser from "body-parser";
import Route from "./routes/v1/index.js";
import errorHandler from "./middlewares/errorhandle.js";
import { connectDB } from "./config/mongodbConfig.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "./config/passportConfig.js";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";
import { socketAuth } from "./middlewares/checkToken.js";
import chatHandler from "./sockets/chatHandler.js";

const app = express();
const hostname = "localhost";
const port = 5000;

// ✅ Tạo HTTP server thay vì dùng app.listen
const server = http.createServer(app);

// ✅ Khởi tạo socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3456"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware CORS
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Access-Control-Allow-Origin",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);
app.options("*", cors());

// Kết nối DB
connectDB();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));

//session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//routes
Route(app);

//error handling middleware
app.use(errorHandler);

// ✅ Socket.IO middleware auth
io.use(socketAuth);

// ✅ Socket.IO handler
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);
  chatHandler(io, socket); // xử lý event chat

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Lắng nghe server HTTP (có cả Express + Socket.IO)
server.listen(port, hostname, () => {
  console.log(`Hello , I am running at http://${hostname}:${port}/`);
});
