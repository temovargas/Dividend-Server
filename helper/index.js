const jsonwebToken = require("jsonwebtoken");

const createToken = function (data) {
  const token = jsonwebToken.sign(data, process.env.JWT_SECRET);
  return token;
};

module.exports = {
  createToken,
};
