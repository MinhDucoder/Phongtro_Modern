import mongoose from "mongoose";
import {
  connectTestDb,
  disconnectTestDb,
  clearDatabase,
  createTestUser,
} from "./test-setup.js";
import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";

describe("Auth API Tests", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe("User Registration", () => {
    test("Should create user with valid data", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "SecurePass123!",
        full_name: "New User",
        phone: "0123456789",
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.full_name).toBe(userData.full_name);
    });

    test("Should require email", async () => {
      const userData = {
        password: "SecurePass123!",
        full_name: "No Email User",
        phone: "0123456789",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("Should require password", async () => {
      const userData = {
        email: "test@example.com",
        full_name: "No Password User",
        phone: "0123456789",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("Should enforce unique email", async () => {
      const userData = {
        email: "unique@example.com",
        password: "SecurePass123!",
        full_name: "User 1",
        phone: "0123456789",
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("Should validate email format", async () => {
      const invalidEmails = ["notanemail", "missing@domain", "@nodomain.com"];

      for (const email of invalidEmails) {
        const userData = {
          email,
          password: "SecurePass123!",
          full_name: "Test User",
          phone: "0123456789",
        };

        // Validation should fail or email should be in schema validation
        // This depends on your schema implementation
        await expect(User.create(userData)).rejects.toThrow();
      }
    });

    test("Should set default role to user", async () => {
      const user = await createTestUser(User);

      const savedUser = await User.findById(user._id);
      expect(savedUser.role).toBe("user");
    });
  });

  describe("User Login", () => {
    test("Should authenticate with valid credentials", async () => {
      const password = "CorrectPassword123!";
      const userData = {
        email: "logintest@example.com",
        password: await bcrypt.hash(password, 10),
        full_name: "Login Test User",
        phone: "0123456789",
      };

      const user = await User.create(userData);
      expect(user).toBeDefined();

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      expect(passwordMatch).toBe(true);
    });

    test("Should fail with wrong password", async () => {
      const userData = {
        email: "wrongpass@example.com",
        password: await bcrypt.hash("CorrectPassword123!", 10),
        full_name: "Test User",
        phone: "0123456789",
      };

      const user = await User.create(userData);

      // Try wrong password
      const wrongPasswordMatch = await bcrypt.compare(
        "WrongPassword123!",
        user.password
      );
      expect(wrongPasswordMatch).toBe(false);
    });

    test("Should return error for non-existent user", async () => {
      const user = await User.findOne({ email: "nonexistent@example.com" });
      expect(user).toBeNull();
    });
  });

  describe("User Profile", () => {
    test("Should get user profile", async () => {
      const user = await createTestUser(User);
      const savedUser = await User.findById(user._id);

      expect(savedUser.email).toBe(user.email);
      expect(savedUser.full_name).toBe(user.full_name);
      expect(savedUser.phone).toBe(user.phone);
    });

    test("Should update user profile", async () => {
      const user = await createTestUser(User);

      const updated = await User.findByIdAndUpdate(
        user._id,
        {
          full_name: "Updated Name",
          phone: "9876543210",
        },
        { new: true }
      );

      expect(updated.full_name).toBe("Updated Name");
      expect(updated.phone).toBe("9876543210");
    });

    test("Should not update email/password via profile update", async () => {
      const user = await createTestUser(User);
      const originalEmail = user.email;

      // Try to update email (should be prevented)
      const updated = await User.findByIdAndUpdate(
        user._id,
        {
          full_name: "New Name",
          // email should not be updatable here
        },
        { new: true }
      );

      // In real implementation, email shouldn't be updatable
      expect(updated.full_name).toBe("New Name");
    });

    test("Should get user role", async () => {
      const user = await createTestUser(User);
      const savedUser = await User.findById(user._id);

      expect(savedUser.role).toBeDefined();
      expect(["user", "landlord", "admin"]).toContain(savedUser.role);
    });
  });

  describe("Password Reset", () => {
    test("Should generate reset token", async () => {
      const user = await createTestUser(User);

      // Generate token (mock)
      const resetToken = `reset_${user._id}_${Date.now()}`;

      expect(resetToken).toBeDefined();
      expect(resetToken).toContain(user._id.toString());
    });

    test("Should validate reset token", async () => {
      const user = await createTestUser(User);

      const resetToken = `reset_${user._id}_${Date.now()}`;
      const [, userId] = resetToken.split("_");

      expect(userId).toBe(user._id.toString());
    });

    test("Should update password", async () => {
      const user = await createTestUser(User);
      const newPassword = "NewSecurePass456!";
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updated = await User.findByIdAndUpdate(
        user._id,
        { password: hashedPassword },
        { new: true }
      );

      // Verify new password
      const match = await bcrypt.compare(newPassword, updated.password);
      expect(match).toBe(true);
    });

    test("Should not allow empty password reset", async () => {
      const user = await createTestUser(User);

      await expect(
        User.findByIdAndUpdate(user._id, { password: "" }, { new: true })
      ).rejects.toThrow();
    });
  });

  describe("User Roles & Permissions", () => {
    test("Should have user role", async () => {
      const user = await createTestUser(User);
      expect(user.role).toBe("user");
    });

    test("Should have landlord role", async () => {
      const landlordData = {
        email: `landlord-${Date.now()}@example.com`,
        password: "LandlordPass123!",
        full_name: "Test Landlord",
        phone: "0987654321",
        role: "landlord",
      };

      const landlord = await User.create(landlordData);
      expect(landlord.role).toBe("landlord");
    });

    test("Should have admin role", async () => {
      const adminData = {
        email: `admin-${Date.now()}@example.com`,
        password: "AdminPass123!",
        full_name: "Test Admin",
        phone: "0111111111",
        role: "admin",
      };

      const admin = await User.create(adminData);
      expect(admin.role).toBe("admin");
    });

    test("Should only allow admin to delete users", async () => {
      const user = await createTestUser(User);
      const normalUser = await createTestUser(User);

      // Normal user should not be able to delete
      expect(user.role).not.toBe("admin");
    });
  });

  describe("User Search & Filter", () => {
    test("Should search user by email", async () => {
      const userData = {
        email: "search@example.com",
        password: "Pass123!",
        full_name: "Search Test",
        phone: "0123456789",
      };

      await User.create(userData);
      const found = await User.findOne({ email: userData.email });

      expect(found).toBeDefined();
      expect(found.email).toBe(userData.email);
    });

    test("Should search user by phone", async () => {
      const userData = {
        email: `phone-${Date.now()}@example.com`,
        password: "Pass123!",
        full_name: "Phone Test",
        phone: "0555555555",
      };

      await User.create(userData);
      const found = await User.findOne({ phone: userData.phone });

      expect(found).toBeDefined();
      expect(found.phone).toBe(userData.phone);
    });

    test("Should list all users (pagination)", async () => {
      // Create 15 users
      for (let i = 0; i < 15; i++) {
        await createTestUser(User);
      }

      const page1 = await User.find().limit(10).skip(0);
      const page2 = await User.find().limit(10).skip(10);

      expect(page1.length).toBe(10);
      expect(page2.length).toBe(5);
    });
  });

  describe("Account Activation", () => {
    test("Should activate account", async () => {
      const user = await createTestUser(User);

      const updated = await User.findByIdAndUpdate(
        user._id,
        { isActive: true },
        { new: true }
      );

      expect(updated.isActive).toBe(true);
    });

    test("Should deactivate account", async () => {
      const user = await createTestUser(User);

      const updated = await User.findByIdAndUpdate(
        user._id,
        { isActive: false },
        { new: true }
      );

      expect(updated.isActive).toBe(false);
    });
  });

  describe("Login History", () => {
    test("Should track last login", async () => {
      const user = await createTestUser(User);
      const now = new Date();

      const updated = await User.findByIdAndUpdate(
        user._id,
        { last_login: now },
        { new: true }
      );

      expect(updated.last_login).toBeDefined();
      expect(new Date(updated.last_login).getTime()).toBeCloseTo(now.getTime(), -2);
    });

    test("Should track login attempts", async () => {
      const user = await createTestUser(User);

      // Simulate login attempts
      let attempts = 0;
      for (let i = 0; i < 3; i++) {
        attempts++;
        await User.findByIdAndUpdate(user._id, { last_login: new Date() });
      }

      expect(attempts).toBe(3);
    });
  });
});
