const Database = require('better-sqlite3');
const db = new Database('pacientes.db');
const row = db.prepare('SELECT id, queixa_principal, historico FROM anamneses ORDER BY id DESC LIMIT 1').get();
console.log(JSON.stringify(row, null, 2));
