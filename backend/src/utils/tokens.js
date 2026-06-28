const jwt = require("jsonwebtoken");
const env = require("../config/env");

const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenExpiresIn });

const signRefreshToken = (payload) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.refreshTokenExpiresIn });

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

module.exports = { signAccessToken, signRefreshToken, getCookieOptions };
