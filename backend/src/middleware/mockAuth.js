/**
 * TEMPORARY MOCK AUTH MIDDLEWARE
 * -------------------------------
 * Sumit's real verifyToken middleware (JWT-based) isn't merged yet.
 * This fakes a logged-in user so task routes can be built and tested
 * end-to-end without blocking on the auth module.
 *
 * TODO: Delete this file and swap the import in task.routes.js to
 * '../middleware/verifyToken' once Sumit's auth PR is merged.
 * Ask Sumit for the exact shape of req.user his middleware attaches
 * (e.g. { id, email }) so the swap is a one-line change.
 */
function mockAuth(req, res, next) {
  req.user = { id: 'temp-user-id' };
  next();
}

module.exports = mockAuth;
