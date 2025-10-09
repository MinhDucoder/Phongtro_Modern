// src/services/postExpirationService.js
import Post from "../models/postSchema.js";
import cron from "node-cron";

class PostExpirationService {
  /**
   * Tự động expire các tin đăng đã hết hạn
   * Chạy mỗi giờ
   */
  startExpirationCronJob() {
    // Chạy mỗi giờ vào phút thứ 0
    cron.schedule("0 * * * *", async () => {
      try {
        console.log("🔄 Running post expiration check...");
        
        const result = await this.expireOldPosts();
        
        if (result.expiredCount > 0) {
          console.log(`✅ Expired ${result.expiredCount} posts`);
        } else {
          console.log("✅ No posts to expire");
        }
      } catch (error) {
        console.error("❌ Error in post expiration cron job:", error);
      }
    });

    console.log("✅ Post expiration cron job started (runs every hour)");
  }

  /**
   * Expire các tin đăng đã quá hạn
   */
  async expireOldPosts() {
    const now = new Date();
    
    const result = await Post.updateMany(
      {
        status: "active",
        expiresAt: { $lt: now }
      },
      {
        $set: { 
          status: "expired",
          expiredAt: now
        }
      }
    );

    return {
      expiredCount: result.modifiedCount,
      timestamp: now
    };
  }

  /**
   * Lấy danh sách tin sắp hết hạn (trong vòng X ngày)
   */
  async getPostsExpiringWithinDays(days = 3) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const posts = await Post.find({
      status: "active",
      expiresAt: {
        $gte: now,
        $lte: futureDate
      }
    })
    .populate("roomId")
    .populate("landlord", "full_name email phone")
    .sort({ expiresAt: 1 });

    return posts;
  }

  /**
   * Gia hạn tin đăng
   */
  async extendPost(postId, userId, additionalDays = 30) {
    const post = await Post.findById(postId).populate("landlord");
    
    if (!post) {
      throw new Error("Tin đăng không tồn tại");
    }

    if (String(post.landlord._id) !== String(userId)) {
      throw new Error("Bạn không có quyền gia hạn tin này");
    }

    if (!post.canExtend) {
      throw new Error("Tin đăng này không được phép gia hạn");
    }

    // Kiểm tra subscription để lấy maxExtensions
    const subscription = await Post.findOne({ user: userId, status: "active" })
      .populate("packagePlan");
    
    const maxExtensions = subscription?.packagePlan?.maxExtensions || 3;
    
    if (post.extendedCount >= maxExtensions) {
      throw new Error(`Bạn đã gia hạn tối đa ${maxExtensions} lần. Vui lòng tạo tin mới.`);
    }

    const oldExpiresAt = new Date(post.expiresAt);
    const newExpiresAt = new Date(oldExpiresAt);
    newExpiresAt.setDate(newExpiresAt.getDate() + additionalDays);

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          expiresAt: newExpiresAt
        },
        $inc: {
          extendedCount: 1
        },
        $push: {
          extensionHistory: {
            extendedAt: new Date(),
            extendedBy: userId,
            addedDays: additionalDays,
            newExpiryDate: newExpiresAt
          }
        }
      },
      { new: true }
    );

    return {
      success: true,
      post: updatedPost,
      message: `Đã gia hạn tin đăng thêm ${additionalDays} ngày`,
      oldExpiresAt,
      newExpiresAt,
      extensionsRemaining: maxExtensions - (post.extendedCount + 1)
    };
  }

  /**
   * Thống kê tin đăng theo trạng thái
   */
  async getPostStats() {
    const now = new Date();
    
    const [
      totalActive,
      totalExpired,
      totalPending,
      expiringIn3Days,
      expiringIn7Days
    ] = await Promise.all([
      Post.countDocuments({ status: "active" }),
      Post.countDocuments({ status: "expired" }),
      Post.countDocuments({ status: "pending" }),
      Post.countDocuments({
        status: "active",
        expiresAt: {
          $gte: now,
          $lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        }
      }),
      Post.countDocuments({
        status: "active",
        expiresAt: {
          $gte: now,
          $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    return {
      totalActive,
      totalExpired,
      totalPending,
      expiringIn3Days,
      expiringIn7Days,
      timestamp: now
    };
  }

  /**
   * Xóa vĩnh viễn các tin đã expired quá lâu (90 ngày)
   */
  async cleanupOldExpiredPosts(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Post.deleteMany({
      status: "expired",
      expiresAt: { $lt: cutoffDate }
    });

    return {
      deletedCount: result.deletedCount,
      cutoffDate
    };
  }
}

export default new PostExpirationService();
