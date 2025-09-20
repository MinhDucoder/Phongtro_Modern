import authRouter from "./auth.js";
import roomRoute from "./rooms.js";
import bookingRoute from "./booking.js";
import paymentRoute from "./payment.js";
import reviewRoute from "./review.js";
import notificationRoute from "./notification.js";
import reportRoute from "./report.js";
import adminRoute from "./admin.js";
import roleRoute from "./role.js";
import postRoute from "./post.js";
import userRoute from "./user.js";

const Route = (app) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRoute);
  app.use("/api/v1/role-request", roleRoute);
  app.use("/api/v1/rooms", roomRoute);
  app.use("/api/v1/posts", postRoute);
  app.use("/api/v1/booking", bookingRoute);
  app.use("/api/v1/payments", paymentRoute);
  app.use("/api/v1/reviews", reviewRoute);
  app.use("/api/v1/notifications", notificationRoute);
  app.use("/api/v1/reports", reportRoute);
  app.use("/api/v1/admin", adminRoute);
};

export default Route;
