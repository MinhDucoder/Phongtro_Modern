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
import notificationHandler from "./sockets/notificationHandler.js";
import { initNotificationHelper } from "./utils/notificationHelper.js";
import postExpirationService from "./services/postExpirationService.js";
import { initSearchConfig, syncDataToMeiliSearch } from "./services/meiliSearchService.js";

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
const apiPort = process.env.PORT ? Number(process.env.PORT) : 5000;

// ===== Kết nối DB =====
connectDB();

// ===== Middleware API =====
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || `http://${hostname}:3000`],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", cors());

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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

// ===== Cache headers for private/authenticated APIs =====
app.use((req, res, next) => {
  try {
    const p = req.path || '';
    const isPrivate = [
      '/api/v1/user',
      '/api/v1/dashboard',
      '/api/v1/rental-requests',
      '/api/v1/notifications',
      '/api/v1/saved-properties',
      '/api/v1/payments',
      '/api/v1/subscriptions',
      '/api/v1/stats/users',
      '/api/v1/chat',
      '/api/v1/conversations',
      '/api/v1/messages',
    ].some((prefix) => p.startsWith(prefix));

    if (isPrivate) {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      // Đảm bảo proxy/CDN không dùng chung cache khi cookie khác nhau
      res.setHeader('Vary', 'Cookie');
    }
  } catch {}
  next();
});

// routes
Route(app);

// error handling
app.use(errorHandler);

// ===== Tạo HTTP server chung =====
const httpServer = createServer(app);

// ===== Socket.IO gắn chung vào httpServer =====
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL || `http://${hostname}:3000`],
    methods: ["GET", "POST"],
    credentials: true,
  },
  serveClient: true, // cho phép /socket.io/socket.io.js
});

// Initialize notification helper with io instance
initNotificationHelper(io);

// middleware auth
io.use(socketAuth);

// handler
io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);
  chatHandler(io, socket);
  notificationHandler.setupHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ===== Start server (API + Socket.IO) =====
httpServer.listen(apiPort, '0.0.0.0', async () => {
  console.log(`🚀 Server (API + Socket.IO) running at:`);
  console.log(`   - http://localhost:${apiPort}/`);
  console.log(`   - http://127.0.0.1:${apiPort}/`);
  
  // Khởi động cron job để auto-expire posts
  postExpirationService.startExpirationCronJob();
  
  // Khởi tạo MeiliSearch config
  try {
    console.log("📚 Initializing MeiliSearch...");
    await initSearchConfig();
    console.log("✅ MeiliSearch initialized successfully!");
    
    // Đồng bộ dữ liệu vào MeiliSearch
    console.log("🔄 Syncing data to MeiliSearch...");
    await syncDataToMeiliSearch();
    console.log("✅ Data synced to MeiliSearch!");
  } catch (err) {
    console.error("❌ MeiliSearch initialization failed:", err.message);
    console.log("   Tìm kiếm MeiliSearch sẽ không khả dụng.");
  }
});
