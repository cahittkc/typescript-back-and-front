import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'postgres', // Lütfen kendi PostgreSQL şifrenizi kullanın
    port: 5432,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool; 