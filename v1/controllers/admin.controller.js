

const getAdminPage = async (req, res) => {
res.status(StatusCodes.OK).send("Admin Route")
};


module.exports = {getAdminPage}