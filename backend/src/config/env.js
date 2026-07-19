const path = require('path');

<<<<<<< HEAD
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
=======
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
>>>>>>> origin/main

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

if (!env.mongoUri) {
  console.warn('[env] MONGO_URI is not set. Add it to backend/.env');
}

if (!env.jwtSecret) {
  console.warn('[env] JWT_SECRET is not set. Add it to backend/.env');
}

module.exports = env;