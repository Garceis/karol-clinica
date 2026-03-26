const API_URL = '/api/pacientes';
const form = document.getElementById('form-paciente');
const listaPacientes = document.getElementById('lista-pacientes');
const buscaInput = document.getElementById('busca-paciente');
const filtroStatus = document.getElementById('filtro-status');

// Elementos do formulário
const idInput = document.getElementById('paciente-id');
const statusInput = document.getElementById('paciente-status');
const nomeInput = document.getElementById('paciente-nome');
const cpfInput = document.getElementById('paciente-cpf');
const maeInput = document.getElementById('paciente-mae');
const idadeInput = document.getElementById('paciente-idade');
const telefoneInput = document.getElementById('paciente-telefone');
const obsInput = document.getElementById('paciente-obs');

let buscaTimeout;

// Máscara de CPF
if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        
        e.target.value = value;
    });
}

// Carregar pacientes ao iniciar ou ao buscar
async function carregarPacientes() {
    try {
        const busca = buscaInput ? buscaInput.value : '';
        const status = filtroStatus ? filtroStatus.value : 'todos';
        
        let url = `${API_URL}?search=${encodeURIComponent(busca)}&status=${status}`;
        console.log("Buscando pacientes em:", url);
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        
        const pacientes = await res.json();
        console.log("Pacientes recebidos:", pacientes.length);
        
        if (!listaPacientes) return;
        listaPacientes.innerHTML = '';

        if (pacientes.length === 0) {
            listaPacientes.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: #666;">Nenhum paciente encontrado.</td></tr>';
            return;
        }

        pacientes.forEach(p => {
            const row = document.createElement('tr');
            if (p.status === 'inativo') {
                row.classList.add('row-inactive');
            }

            const statusBadge = `<span class="status-badge status-${p.status || 'ativo'}">${p.status || 'ativo'}</span>`;

            // Escapar aspas simples para o onclick
            const pJson = JSON.stringify(p).replace(/'/g, "&#39;");

            row.innerHTML = `
                <td>
                    <strong>${p.nome}</strong>${statusBadge}<br>
                    <small style="color: #666;">CPF: ${p.cpf || '-'} | Mãe: ${p.nome_mae || '-'}</small>
                </td>
                <td>${p.idade || '-'}</td>
                <td>${p.telefone || '-'}</td>
                <td>
                    <div class="actions">
                        <button class="btn-action btn-edit" onclick='editarPaciente(${pJson})'>
                            <span>✏️</span> Editar
                        </button>
                        ${(p.status || 'ativo') === 'ativo' ? `
                            <button class="btn-action btn-delete" onclick="alterarStatus(${p.id}, 'inativo')">
                                <span>🚫</span> Desativar
                            </button>
                        ` : `
                            <button class="btn-action btn-edit" style="background-color: #e8f5e9; color: #2e7d32;" onclick="alterarStatus(${p.id}, 'ativo')">
                                <span>✅</span> Ativar
                            </button>
                        `}
                    </div>
                </td>
            `;
            listaPacientes.appendChild(row);
        });
    } catch (err) {
        console.error("Erro ao carregar pacientes:", err);
        if (listaPacientes) {
            listaPacientes.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: red;">Erro ao carregar dados: ${err.message}</td></tr>`;
        }
    }
}

// Evento de busca com debounce
if (buscaInput) {
    buscaInput.addEventListener('input', () => {
        clearTimeout(buscaTimeout);
        buscaTimeout = setTimeout(carregarPacientes, 300);
    });
}

if (filtroStatus) {
    filtroStatus.addEventListener('change', carregarPacientes);
}

// Salvar (Criar ou Editar)
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const id = idInput.value;
            // Garantir que os nomes das propriedades batem com o que o server.js espera
            const data = {
                nome: nomeInput.value,
                cpf: cpfInput.value,
                nome_mae: maeInput.value, // Nome do campo na tabela pacientes.db
                idade: parseInt(idadeInput.value) || null,
                telefone: telefoneInput.value,
                observacao: obsInput.value,
                status: id ? statusInput.value : 'ativo'
            };

            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_URL}/${id}` : API_URL;

            console.log(`Salvando paciente via ${method} em ${url}`, data);

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Erro ao salvar paciente");
            }

            console.log("Paciente salvo com sucesso!");
            form.reset();
            idInput.value = '';
            statusInput.value = '';
            carregarPacientes();
            alert(id ? "Cadastro atualizado!" : "Novo paciente cadastrado!");
        } catch (err) {
            console.error("Erro no submit:", err);
            alert("Erro ao salvar: " + err.message);
        }
    });
}

// Editar paciente (preenche o formulário)
window.editarPaciente = (paciente) => {
    if (!idInput) return;
    idInput.value = paciente.id;
    statusInput.value = paciente.status || 'ativo';
    nomeInput.value = paciente.nome;
    cpfInput.value = paciente.cpf || '';
    maeInput.value = paciente.nome_mae || '';
    idadeInput.value = paciente.idade || '';
    telefoneInput.value = paciente.telefone || '';
    obsInput.value = paciente.observacao || '';
    window.scrollTo(0, 0);
};

// Alterar status do paciente
window.alterarStatus = async (id, novoStatus) => {
    const acao = novoStatus === 'ativo' ? 'ativar' : 'desativar';
    if (confirm(`Deseja realmente ${acao} este paciente?`)) {
        try {
            const res = await fetch(`${API_URL}/${id}/status`, { 
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });
            if (!res.ok) throw new Error("Erro ao alterar status");
            carregarPacientes();
        } catch (err) {
            alert("Erro: " + err.message);
        }
    }
};

// Iniciar
carregarPacientes();
