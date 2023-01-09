class FilterFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    console.log(queryObj);
    // [sort limit page fields]
    const execludedFields = ['sort', 'limit', 'fields', 'page'];
    execludedFields.forEach(field => delete queryObj[field]);

    // handle mongo gilters
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|eq|nq)\b/g,
      match => `$${match}`
    );

    console.log(queryStr);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortFields = this.queryString.sort.split(',').join(' ');
      console.log(this.query);

      this.query = this.query.sort(sortFields);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  fieldSelection() {
    if (this.queryString.fields) {
      const selectedFields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(selectedFields);
    }
    return this;
  }

  paginate() {
    const pages = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 5;
    const skippedDocs = limit * (pages - 1);

    this.query = this.query.skip(skippedDocs).limit(limit);
    return this;
  }
}

module.exports = FilterFeatures;
