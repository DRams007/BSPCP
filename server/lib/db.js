import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'BSPCP',
  password: 'botshub',
  port: 5432,
});

export default pool;
