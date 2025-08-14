const { Pool } = require("pg");
require("dotenv").config({ quiet: true });

const pool = new Pool({
  connectionString: `postgresql://${process.env.USER}:${process.env.PASSWORD}@localhost:5432/${process.env.DATABASE}`,
});

module.exports = pool;
