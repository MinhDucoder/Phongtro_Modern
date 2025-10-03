import authRouter from "./auth.js";
import socialAuthRouter from "./socialAuthRoutes.js";
import roomRoute from "./rooms.js";
import bookingRoute from "./booking.js";
import paymentRoute from "./payment.js";
import subscriptionRoute from "./subscription.js";
import reviewRoute from "./review.js";
import notificationRoute from "./notification.js";
import reportRoute from "./report.js";
import adminRoute from "./admin.js";
import roleRoute from "./role.js";
import postRoute from "./post.js";
import userRoute from "./user.js";
import conversationRoute from "./conversationRoutes.js";
import messageRoute from "./messageRoutes.js";
import dashboardRoute from "./dashboard.js";
import rentalRequestRoute from "./rentalRequest.js";
import savedPropertiesRoute from "./savedProperties.js";
import systemRoute from "./system.js";
import moderationRoutes from "./moderation.js";
import statsRoute from "./stats.js";
import debugRoute from "../debug.js";

const Route = (app) => {
  // Root route
  app.get("/", (req, res) => {
    res.json({
      message: "Phongtro Modern API Server",
      version: "1.0.0",
      endpoints: {
        auth: "/api/v1/auth",
        posts: "/api/v1/posts",
        rooms: "/api/v1/rooms",
        users: "/api/v1/user",
        subscriptions: "/api/v1/subscriptions",
      },
    });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/auth", socialAuthRouter);
  app.use("/api/v1/user", userRoute);
  app.use("/api/v1/role-request", roleRoute);
  app.use("/api/v1/rooms", roomRoute);
  app.use("/api/v1/posts", postRoute);
  app.use("/api/v1/booking", bookingRoute);
  app.use("/api/v1/conversations", conversationRoute);
  app.use("/api/v1/messages", messageRoute);
  app.use("/api/v1/payments", paymentRoute);
  app.use("/api/v1/subscriptions", subscriptionRoute);
  app.use("/api/v1/reviews", reviewRoute);
  app.use("/api/v1/notifications", notificationRoute);
  app.use("/api/v1/reports", reportRoute);
  app.use("/api/v1/admin", adminRoute);
  app.use("/api/v1/admin/moderation", moderationRoutes);
  app.use("/api/v1/dashboard", dashboardRoute);
  app.use("/api/v1/rental-requests", rentalRequestRoute);
  app.use("/api/v1/saved-properties", savedPropertiesRoute);
  app.use("/api/v1/system", systemRoute);
  app.use("/api/v1/stats", statsRoute);
  app.use("/api/debug", debugRoute);
};

export default Route;
