const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config()
console.log(process.env.DATABASE_URL);


const client = new Client({
  connectionString: process.env.DATABASE_URL
});

client.connect()
  .then(() => console.log("Connected!"))
  .catch(err => console.error("Connection failed:", err));
