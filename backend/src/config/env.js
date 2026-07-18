require('dotenv').config();

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || 'development',
};

if (!env.mongoUri) {
  console.warn('[env] MONGO_URI is not set. Add it to your local .env file.');
}

module.exports = env;
