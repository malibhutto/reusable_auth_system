import { verifyAccessToken } from "../services/tokenService.js";
import { sendError } from "../utils/response.js";

/**
 * Protect routes by requiring a valid JWT access token.
 * Populates req.user with user ID and email.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(
        res,
        "Authentication required. Please provide a Bearer token.",
        401,
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    // Attach user payload to request context
    req.user = decoded;
    next();
  } catch (error) {
    let errorMessage = "Invalid or expired authentication token";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Access token expired";
    }
    return sendError(res, errorMessage, 401);
  }
};
export default { protect };
