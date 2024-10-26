const { expressjwt: expJwt } = require("express-jwt");
const { Token } = require("../models/token");
/**
 * Express middleware that verifies the JWT token sent in the Authorization header.
 * If the token is not sent or invalid, it sends a 401 Unauthorized response.
 * If the token is valid, it adds the user data to the request object.
 * We also add a middleware to check if the token is revoked or not.
 * If the token is revoked, it sends a 401 Unauthorized response.
 * The middleware is not applied to the specified paths.
 */
function authjwt() {
  const API = process.env.API_URL;
  return expJwt({
    secret: process.env.ACCESS_TOKEN_SECRET,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      `${API}/login`,
      `${API}/login/`,

      `${API}/register`,
      `${API}/register/`,

      `${API}/forgot-password`,
      `${API}/forgot-password/`,

      `${API}/verify-otp`,
      `${API}/verify-otp/`,

      `${API}/reset-password`,
      `${API}/reset-password/`,
    ],
  });
}
async function isRevoked(req, jwt) {
  const authHeader = req.header("Authorization");
  if (!authHeader.starsWith("Bearer")) return true;

  const accessToken = authHeader.replace("Bearer", "").trim();
  const token = await Token.findOne({ accessToken });

  //adminRouteRegex
  const adminRouteRegex = /^\/api\/v1\/admin\//i;
  const adminFault =
    !jwt.payload.isAdmin && adminRouteRegex.test(req.originalUrl);

  return adminFault || !token;
}
module.exports = authjwt;
