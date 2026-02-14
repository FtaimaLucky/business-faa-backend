require("dotenv").config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGODB_URI: getEnvVariable("MONGODB_URI"),
  API_VERSION: getEnvVariable("API_VERSION"),
  REDIS_URL: getEnvVariable("REDIS_URL"),
};

function getEnvVariable(key) {
  return process.env[key] || "";
}

module.exports = { env };
