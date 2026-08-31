const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('../src/middleware/auth');

describe('Auth Middleware', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', () => {
      const token = jwt.sign(
        { userId: '123', role: 'CONTRIBUTOR', username: 'testuser' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers['authorization'] = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({
        userId: '123',
        role: 'CONTRIBUTOR',
        username: 'testuser'
      });
    });

    it('should reject request without token', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token tidak ditemukan'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      req.headers['authorization'] = 'Bearer invalid_token';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token tidak valid'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired token', (done) => {
      const token = jwt.sign(
        { userId: '123', role: 'CONTRIBUTOR', username: 'testuser' },
        JWT_SECRET,
        { expiresIn: '0s' }
      );

      req.headers['authorization'] = `Bearer ${token}`;

      setTimeout(() => {
        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Session telah berakhir, silakan login kembali'
        });
        expect(next).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('authorizeRole', () => {
    it('should authorize user with allowed role', () => {
      req.user = {
        userId: '123',
        role: 'VALIDATOR',
        username: 'validator1'
      };

      const middleware = authorizeRole(['VALIDATOR', 'CONTRIBUTOR']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject user without allowed role', () => {
      req.user = {
        userId: '123',
        role: 'CONTRIBUTOR',
        username: 'contributor1'
      };

      const middleware = authorizeRole(['VALIDATOR']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Anda tidak memiliki akses ke resource ini'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request without user', () => {
      const middleware = authorizeRole(['VALIDATOR']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Autentikasi diperlukan'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
