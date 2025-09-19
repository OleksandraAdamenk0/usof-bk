import mysql from "mysql2/promise";

const rootConnection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: 'root',
  password: process.env.DB_ROOT_PASSWORD
}).catch(err => {
  console.error(err);
  process.exit(1);
});

export default rootConnection;