const Database = require('better-sqlite3');
const fs = require('fs');

['pacientes.db', 'clinica.db'].forEach(dbFile => {
    if (!fs.existsSync(dbFile)) { console.log(`${dbFile}: NÃO EXISTE`); return; }
    const db = new Database(dbFile);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
    const count = tables.includes('pacientes') ? db.prepare('SELECT COUNT(*) as n FROM pacientes').get().n : 'sem tabela pacientes';
    console.log(`${dbFile}: tabelas=[${tables.join(', ')}] | pacientes=${count}`);
    db.close();
});
