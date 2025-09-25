// Middleware để kiểm tra quyền của người dùng
const checkRole = (roles = []) => {
  // roles là một mảng các quyền được phép truy cập route
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Bạn cần đăng nhập để truy cập'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Bạn không có quyền truy cập tài nguyên này'
      });
    }

    // Nếu người dùng có quyền phù hợp, cho phép tiếp tục
    next();
  };
};
    
export default checkRole;