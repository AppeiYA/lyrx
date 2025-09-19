const dotenv = require('dotenv');
dotenv.config()
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations',
      extension: "cjs"
    },
    seeds: {
      directory: './seeds',
      extension: "cjs"
    }
  },

  staging: {
    client: 'pg',
    connection: process.env.STAGING_DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: { tableName: 'knex_migrations' }
  },

  production: {
    client: 'pg',
    connection: process.env.PRODUCTION_DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: { tableName: 'knex_migrations' }
  }
};
