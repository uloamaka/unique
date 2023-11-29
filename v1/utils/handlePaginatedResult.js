

const handlePaginatedResults = (res, fallbackDataKey, fallbackQuery) => {
  if (res.paginatedResults) {
    const { totalDocs, hasNextPage, hasPrevPage, nextPage, prevPage, results } =
      res.paginatedResults;
    const response = {
      totalDocs,
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage,
      [fallbackDataKey]: results,
    };
    return res.ok(response);
  } else {
    fallbackQuery();
  }
};

module.exports = handlePaginatedResults;
