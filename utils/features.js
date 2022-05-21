class ApiFeatures {
    constructor(query, queryString) {
        this.query = query; //////Tour.find()
        this.queryString = queryString; ///req.query
    }
    filter() {
        const queryObj = JSON.parse(JSON.stringify(this.queryString)); /////creating hard copy

        const excluded = ['limit', 'sort', 'fields', 'page'];
        excluded.forEach((item) => {
            delete queryObj[item];
        });

        let queryStr = JSON.stringify(queryObj);
        queryStr = JSON.parse(
            queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`)
        );
        this.query = this.query.find(queryStr);
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sorting = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sorting);
        } else {
            this.query = this.query.sort('createdAt');
            // const e = new Error("This sorting don't exists");
            // e.type = 'Operational Error';
            // e.status = 432;
            // throw e;
        }
        return this;
    }

    fields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    pagination() {
        const page = +this.queryString.page || 1;
        const limit = +this.queryString.limit || 10;
        const skipDocs = (page - 1) * limit;
        console.log('pagination');
        this.query = this.query.skip(skipDocs).limit(limit);
        return this;
    }
}

module.exports = ApiFeatures;
