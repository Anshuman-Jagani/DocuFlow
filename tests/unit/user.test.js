const { sequelize, User } = require('../../src/models');
const bcrypt = require('bcryptjs');

// Setup and teardown
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await User.destroy({ where: {}, force: true });
});

// ============================================================================
// USER MODEL TESTS
// ============================================================================

describe('User Model', () => {
  describe('Password Hashing', () => {
    test('should hash password on user creation', async () => {
      const plainPassword = 'MySecurePassword123!';
      const user = await User.create({
        email: 'test@example.com',
        password_hash: plainPassword,
        full_name: 'Test User',
        role: 'user'
      });

      // Password should be hashed, not stored as plain text
      expect(user.password_hash).not.toBe(plainPassword);
      expect(user.password_hash).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash format
    });

    test('should hash password on user update', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password_hash: await bcrypt.hash('OldPassword123!', 10),
        full_name: 'Test User',
        role: 'user'
      });

      const oldHash = user.password_hash;
      const newPassword = 'NewPassword456!';

      // Update password
      await user.update({ password_hash: newPassword });

      // New hash should be different from old hash
      expect(user.password_hash).not.toBe(oldHash);
      expect(user.password_hash).not.toBe(newPassword);
      expect(user.password_hash).toMatch(/^\$2[ayb]\$.{56}$/);
    });

    test('should not rehash password if not changed', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        full_name: 'Test User',
        role: 'user'
      });

      const originalHash = user.password_hash;

      // Update other fields, not password
      await user.update({ full_name: 'Updated Name' });

      // Hash should remain the same
      expect(user.password_hash).toBe(originalHash);
    });
  });

  describe('comparePassword Method', () => {
    test('should return true for correct password', async () => {
      const plainPassword = 'CorrectPassword123!';
      const user = await User.create({
        email: 'test@example.com',
        password_hash: plainPassword, // Let the beforeCreate hook hash it
        full_name: 'Test User',
        role: 'user'
      });

      const isMatch = await user.comparePassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password_hash: await bcrypt.hash('CorrectPassword123!', 10),
        full_name: 'Test User',
        role: 'user'
      });

      const isMatch = await user.comparePassword('WrongPassword456!');
      expect(isMatch).toBe(false);
    });

    test('should handle empty password', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        full_name: 'Test User',
        role: 'user'
      });

      const isMatch = await user.comparePassword('');
      expect(isMatch).toBe(false);
    });
  });

  describe('toSafeObject Method', () => {
    test('should return user object without password_hash', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        full_name: 'Test User',
        role: 'user'
      });

      const safeUser = user.toSafeObject();

      expect(safeUser).toHaveProperty('id');
      expect(safeUser).toHaveProperty('email');
      expect(safeUser).toHaveProperty('full_name');
      expect(safeUser).toHaveProperty('role');
      expect(safeUser).not.toHaveProperty('password_hash');
    });

    test('should include all fields except password_hash', async () => {
      const user = await User.create({
        email: 'admin@example.com',
        password_hash: await bcrypt.hash('AdminPass123!', 10),
        full_name: 'Admin User',
        role: 'admin'
      });

      const safeUser = user.toSafeObject();

      expect(safeUser.email).toBe('admin@example.com');
      expect(safeUser.full_name).toBe('Admin User');
      expect(safeUser.role).toBe('admin');
      expect(safeUser.id).toBeDefined();
      expect(safeUser.createdAt).toBeDefined();
      expect(safeUser.updatedAt).toBeDefined();
    });
  });

  describe('User Validation', () => {
    test('should require email', async () => {
      await expect(
        User.create({
          password_hash: await bcrypt.hash('Password123!', 10),
          full_name: 'Test User',
          role: 'user'
        })
      ).rejects.toThrow();
    });

    test('should require valid email format', async () => {
      await expect(
        User.create({
          email: 'invalid-email',
          password_hash: await bcrypt.hash('Password123!', 10),
          full_name: 'Test User',
          role: 'user'
        })
      ).rejects.toThrow();
    });

    test('should require unique email', async () => {
      const email = 'duplicate@example.com';
      
      await User.create({
        email,
        password_hash: await bcrypt.hash('Password123!', 10),
        full_name: 'User One',
        role: 'user'
      });

      await expect(
        User.create({
          email,
          password_hash: await bcrypt.hash('Password456!', 10),
          full_name: 'User Two',
          role: 'user'
        })
      ).rejects.toThrow();
    });

    test('should require password_hash', async () => {
      await expect(
        User.create({
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'user'
        })
      ).rejects.toThrow();
    });

    test('should require full_name', async () => {
      await expect(
        User.create({
          email: 'test@example.com',
          password_hash: await bcrypt.hash('Password123!', 10),
          role: 'user'
        })
      ).rejects.toThrow();
    });

    test('should default role to user', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        full_name: 'Test User'
      });

      expect(user.role).toBe('user');
    });

    test('should accept admin role', async () => {
      const user = await User.create({
        email: 'admin@example.com',
        password_hash: await bcrypt.hash('AdminPass123!', 10),
        full_name: 'Admin User',
        role: 'admin'
      });

      expect(user.role).toBe('admin');
    });
  });

  describe('User CRUD Operations', () => {
    test('should create user successfully', async () => {
      const user = await User.create({
        email: 'newuser@example.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        full_name: 'New User',
        role: 'user'
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('newuser@example.com');
      expect(user.full_name).toBe('New User');
    });

    test('should find user by email', async () => {
      await User.create({
        email: 'findme@example.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        full_name: 'Find Me',
        role: 'user'
      });

      const user = await User.findOne({ where: { email: 'findme@example.com' } });
      expect(user).toBeDefined();
      expect(user.email).toBe('findme@example.com');
    });

    test('should update user details', async () => {
      const user = await User.create({
        email: 'update@example.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        full_name: 'Original Name',
        role: 'user'
      });

      await user.update({ full_name: 'Updated Name' });

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.full_name).toBe('Updated Name');
    });

    test('should delete user', async () => {
      const user = await User.create({
        email: 'delete@example.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        full_name: 'Delete Me',
        role: 'user'
      });

      const userId = user.id;
      await user.destroy();

      const deletedUser = await User.findByPk(userId);
      expect(deletedUser).toBeNull();
    });
  });
});
