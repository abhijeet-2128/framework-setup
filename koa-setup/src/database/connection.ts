import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();

    console.log('MySQL Connected Successfully');

    connection.release();
  } catch (error) {
    console.error('MySQL Connection Failed:', error);
    process.exit(1);
  }
};