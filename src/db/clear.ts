import 'dotenv/config';
import rootConnection from "./rootConnection.js";

async function clear() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to reset production database!');
    process.exit(1);
  }
  if (!process.env.DB_NAME) {
    console.error('Missing DB_NAME');
    process.exit(1);
  }
  await rootConnection.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\`;`);
  console.log(`Database "${process.env.DB_NAME}" deleted successfully.`);

  await rootConnection.end();
}

if (import.meta.url === `file://${process.argv[1]}`)  {
  clear().then(() => console.log(`clear finished`));
}