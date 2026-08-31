const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { login, validateToken } = require('../src/services/authService');
const pool = require('../src/database/pool');

// Mock the database pool
jest.mock('../src/database/pool');

describe('AuthService', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return success with token for valid credentials', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        password_hash: await bcrypt.hash('password123', 10),
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'CONTRIBUTOR',
        is_active: true
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await login('testuser', 'password123');

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.userId).toBe('123');
      expect(result.role).toBe('CONTRIBUTOR');
      expect(result.username).toBe('testuser');
    });

    it('should return error for invalid username', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await login('invaliduser', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username atau password salah');
    });

    it('should return error for invalid password', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        password_hash: await bcrypt.hash('password123', 10),
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'CONTRIBUTOR',
        is_active: true
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await login('testuser', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username atau password salah');
    });

    it('should return error for inactive user', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        password_hash: await bcrypt.hash('password123', 10),
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'CONTRIBUTOR',
        is_active: false
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await login('testuser', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Akun tidak aktif');
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', () => {
      const token = jwt.sign(
        { userId: '123', role: 'CONTRIBUTOR', username: 'testuser' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      const result = validateToken(token);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe('123');
      expect(result.role).toBe('CONTRIBUTOR');
      expect(result.username).toBe('testuser');
    });

    it('should reject an invalid token', () => {
      const result = validateToken('invalid_token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token tidak valid');
    });

    it('should reject an expired token', () => {
      const token = jwt.sign(
        { userId: '123', role: 'CONTRIBUTOR', username: 'testuser' },
        JWT_SECRET,
        { expiresIn: '0s' }
      );

      // Wait a bit to ensure token expires
      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        const result = validateToken(token);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Session telah berakhir, silakan login kembali');
      });
    });
  });
});
