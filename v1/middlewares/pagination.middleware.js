const paginateResults = (model) => {
  return async (req, res, next) => {
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
  };
};

module.exports = paginateResults;

