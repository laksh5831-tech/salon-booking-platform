const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');
const AppError = require('../utils/AppError');

const MAX_SESSIONS = 10;
const REUSE_GRACE_SECONDS = 900;

class AuthService {
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const user = await User.create(userData);
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await this.addSession(user._id, user.role);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await this.addSession(user._id, user.role);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  async logout(userId, token) {
    if (token) {
      await User.updateOne({ _id: userId }, { $pull: { refreshTokens: token } });
      return;
    }
    await User.findByIdAndUpdate(userId, { refreshTokens: [] });
  }

  async refreshToken(token) {
    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    const pullResult = await User.updateOne(
      { _id: user._id, refreshTokens: token },
      { $pull: { refreshTokens: token } }
    );

    if (pullResult.modifiedCount === 0) {
      const issuedSecondsAgo = Math.floor(Date.now() / 1000) - decoded.iat;
      if (issuedSecondsAgo > REUSE_GRACE_SECONDS) {
        throw new AppError('Refresh token is invalid or has been reused', 401);
      }

      const current = await User.findById(user._id).select('+refreshTokens');
      const latest = current && current.refreshTokens[current.refreshTokens.length - 1];
      if (!latest) {
        throw new AppError('Refresh token is invalid or has been reused', 401);
      }

      return { accessToken, refreshToken: latest };
    }

    await User.updateOne(
      { _id: user._id },
      { $push: { refreshTokens: { $each: [newRefreshToken], $slice: -MAX_SESSIONS } } }
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async addSession(userId) {
    const refreshToken = generateRefreshToken(userId);
    await User.updateOne(
      { _id: userId },
      { $push: { refreshTokens: { $each: [refreshToken], $slice: -MAX_SESSIONS } } }
    );
    return refreshToken;
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.sanitizeUser(user);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    const accessToken = generateAccessToken(user._id, user.role);

    return { accessToken };
  }

  sanitizeUser(user) {
    const obj = user.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.refreshTokens;
    delete obj.__v;
    return obj;
  }
}

module.exports = new AuthService();