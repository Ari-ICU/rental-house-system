/**
 * ─────────────────────────────────────────────
 *  asyncHandler.js
 *  Wrapper for express routes to catch async
 *  errors without repeating try-catch everywhere.
 * ─────────────────────────────────────────────
 */

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
