class AuthController {
  async login(req, res, next) {
    const { username, password } = req.body;
    if (username === "admin" && password === "password") {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
      next();
    }
  }
}

export default new AuthController();
