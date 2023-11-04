const { StatusCodes } = require("http-status-codes");

const getUserPage = async (req, res) => {
  res.status(StatusCodes.OK).send("User Route");
};

module.exports = { getUserPage };
