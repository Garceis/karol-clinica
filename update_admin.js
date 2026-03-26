const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('pacientes.db');

const novoHash = bcrypt.hashSync('Admin', 10);
db.prepare('UPDATE admin_users SET email = ?, nome = ?, senha_hash = ? WHERE id = 1').run('Admin', 'Admin', novoHash);
console.log('Credenciais atualizadas: usuario=Admin senha=Admin');
db.close();
