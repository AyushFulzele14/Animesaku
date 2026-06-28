class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search() {
    const keyword = this.queryString.keyword
      ? {
          $or: [
            { title: { $regex: this.queryString.keyword, $options: "i" } },
            { animeName: { $regex: this.queryString.keyword, $options: "i" } },
            { tags: { $regex: this.queryString.keyword, $options: "i" } },
          ],
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    ["keyword", "page", "limit", "sort"].forEach((f) => delete queryObj[f]);

    if (queryObj.priceMin || queryObj.priceMax) {
      queryObj.price = {};
      if (queryObj.priceMin) queryObj.price.$gte = Number(queryObj.priceMin);
      if (queryObj.priceMax) queryObj.price.$lte = Number(queryObj.priceMax);
      delete queryObj.priceMin;
      delete queryObj.priceMax;
    }

    this.query = this.query.find(queryObj);
    return this;
  }

  sort() {
    const sortBy = this.queryString.sort?.split(",").join(" ") || "-createdAt";
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = limit * (page - 1);
    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}

module.exports = ApiFeatures;
