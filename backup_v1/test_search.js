const Database = require('better-sqlite3');
const db = new Database('pacientes.db');

const search = '12345678901';
const query = `
    SELECT * FROM pacientes 
    WHERE REPLACE(REPLACE(cpf, '.', ''), '-', '') LIKE ?
`;

try {
    const results = db.prepare(query).all(`%${search}%`);
    console.log('Results:', results);
} catch (err) {
    console.error('Error:', err.message);
}
