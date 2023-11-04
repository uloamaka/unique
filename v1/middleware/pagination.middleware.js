// pagination.middleware.js

const { StatusCodes } = require("http-status-codes");

const paginateResults = (model) => {
  return async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const options = {
        page,
        limit,
      };

      const { docs, totalDocs, hasNextPage, hasPrevPage, nextPage, prevPage } =
        await model.paginate({}, options);

      const results = {
        totalDocs,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
        results: docs,
      };

      res.paginatedResults = results;
      next();
    } catch (err) {
      const message = err.message || "Error paginating results";
      req.flash("error", message);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(message);
    }
  };
};

module.exports = paginateResults;

// module.exports = {paginatedResults};
