const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', verifyToken, getCurrentUser);

module.exports = router;
