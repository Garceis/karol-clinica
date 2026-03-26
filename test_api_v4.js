async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/testes/submeter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: 'dummy',
                paciente_id: 1,
                dados_json: { respondente_nome: 'Teste Final V4', 'q1': 1, 'q2': 2 }
            })
        });
        const data = await res.json();
        console.log('Resposta:', data);
    } catch (e) { console.error(e); }
}
test();
