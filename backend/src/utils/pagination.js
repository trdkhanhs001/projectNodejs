/**
 * Pagination Helper
 * Standardized pagination for list endpoints
 */

const getPaginationParams = (queryPage, queryLimit) => {
  const page = Math.max(1, parseInt(queryPage) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryLimit) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildPaginationResponse = (data, total, page, limit) => {
  const pages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNextPage: page < pages,
      hasPrevPage: page > 1
    }
  };
};

module.exports = {
  getPaginationParams,
  buildPaginationResponse
};
