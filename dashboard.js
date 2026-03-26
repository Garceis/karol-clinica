const API_URL = '/api';

// ================= SISTEMA DE NOTIFICAÇÕES (TOAST) =================
function showToast(mensagem, tipo = 'sucesso') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Estilos base
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.color = 'white';
    toast.style.fontWeight = '600';
    toast.style.fontSize = '0.9rem';
    toast.style.minWidth = '250px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.justifyContent = 'space-between';
    toast.style.animation = 'slideIn 0.3s ease-out';
    
    if (tipo === 'sucesso') {
        toast.style.background = 'var(--success-color)';
        mensagem = '✓ ' + mensagem;
    } else {
        toast.style.background = 'var(--danger-color)';
        mensagem = '✕ ' + mensagem;
    }

    toast.innerHTML = `<span>${mensagem}</span>`;
    
    container.appendChild(toast);

    // Remover após 4 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

function showConfirm(mensagem, onConfirm) {
    const overlay = document.getElementById('confirm-overlay');
    const text = document.getElementById('confirm-text');
    const btnConfirm = document.getElementById('modal-confirm');
    const btnCancel = document.getElementById('modal-cancel');
    
    text.innerText = mensagem;
    overlay.style.display = 'flex';

    btnConfirm.onclick = () => {
        onConfirm();
        overlay.style.display = 'none';
    };

    btnCancel.onclick = () => {
        overlay.style.display = 'none';
    };
}

// Injetar animações CSS
const styleToast = document.createElement('style');
styleToast.innerHTML = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    @keyframes modalIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
`;
document.head.appendChild(styleToast);

// ================= INICIALIZAÇÃO E MÁSCARAS =================
let searchTimeout;

document.addEventListener('DOMContentLoaded', () => {
    // Máscara para o campo de cadastro
    const cpfInput = document.getElementById('pac-cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            e.target.value = aplicarMascaraCPF(e.target.value);
        });
    }

    // Máscara e Busca para o campo de prontuário
    const buscaInput = document.getElementById('busca-pacientes-tab');
    if (buscaInput) {
        buscaInput.addEventListener('input', (e) => {
            let val = e.target.value;
            
            // Se for número, aplica máscara visual
            if (/^\d/.test(val)) {
                e.target.value = aplicarMascaraCPF(val);
            }

            // Debounce para não sobrecarregar o servidor
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                carregarPacientes();
            }, 300);
        });
    }

    // Filtro de status
    const filtroStatus = document.getElementById('filtro-status-tab');
    if (filtroStatus) {
        filtroStatus.addEventListener('change', carregarPacientes);
    }

    // Busca de Pacientes na aba SRS-2
    const buscaInputSrs2 = document.getElementById('busca-paciente-srs2');
    if (buscaInputSrs2) {
        buscaInputSrs2.addEventListener('input', async (e) => {
            const termo = e.target.value;
            const resultadosDiv = document.getElementById('resultados-busca-srs2');
            
            if (termo.length < 2) {
                resultadosDiv.style.display = 'none';
                return;
            }

            try {
                const res = await fetch(`${API_URL}/pacientes?search=${encodeURIComponent(termo)}&status=ativo`);
                const pacientes = await res.json();
                
                resultadosDiv.innerHTML = '';
                if (pacientes.length > 0) {
                    pacientes.forEach(p => {
                        const item = document.createElement('div');
                        item.style.padding = '10px';
                        item.style.cursor = 'pointer';
                        item.style.borderBottom = '1px solid #eee';
                        item.innerHTML = `<strong>${p.nome}</strong> <br><small>CPF: ${p.cpf || '-'}</small>`;
                        item.onclick = () => {
                            buscaInputSrs2.value = p.nome;
                            document.getElementById('srs2-paciente-id').value = p.id;
                            resultadosDiv.style.display = 'none';
                        };
                        item.onmouseover = () => item.style.background = '#f0f7ff';
                        item.onmouseout = () => item.style.background = 'white';
                        resultadosDiv.appendChild(item);
                    });
                    resultadosDiv.style.display = 'block';
                } else {
                    resultadosDiv.innerHTML = '<div style="padding:10px; color:#888;">Nenhum paciente encontrado.</div>';
                    resultadosDiv.style.display = 'block';
                }
            } catch (err) {
                console.error(err);
            }
        });

        // Fechar resultados ao clicar fora
        document.addEventListener('click', (e) => {
            if (!buscaInputSrs2.contains(e.target)) {
                document.getElementById('resultados-busca-srs2').style.display = 'none';
            }
        });
    }
});

function aplicarMascaraCPF(valor) {
    let v = valor.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return v;
}

// ================= NAVEGAÇÃO PRINCIPAL =================
function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    const section = document.getElementById(`view-${tabId}`);
    if (section) section.classList.add('active');
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (tabId === 'pacientes') {
        switchSubTab('cadastro'); 
    }
    if (tabId === 'financeiro') carregarFinanceiro();
    if (tabId === 'agenda') {
        carregarSelectPacientes('agenda-paciente');
        carregarAgenda();
    }
    if (tabId === 'testes') {
        carregarSelectPacientes('srs2-paciente');
        switchSubTabTestes('srs2');
        montarFormularioSRS2();
    }
}

// ================= NAVEGAÇÃO SUB-ABAS (TESTES) =================
function switchSubTabTestes(subTabId) {
    document.querySelectorAll('.sub-view-testes').forEach(view => view.style.display = 'none');
    document.querySelectorAll('.sub-nav-testes').forEach(btn => btn.classList.remove('active'));

    const view = document.getElementById(`sub-view-testes-${subTabId}`);
    if (view) view.style.display = 'block';
    
    const buttons = document.querySelectorAll('.sub-nav-testes');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${subTabId}'`)) {
            btn.classList.add('active');
        }
    });
}

// ================= NAVEGAÇÃO SUB-ABAS (PACIENTES) =================
function switchSubTab(subTabId) {
    document.querySelectorAll('.sub-view').forEach(view => view.style.display = 'none');
    document.querySelectorAll('.sub-nav-item').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`sub-view-${subTabId}`).style.display = 'block';
    
    const buttons = document.querySelectorAll('.sub-nav-item');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(`'${subTabId}'`)) btn.classList.add('active');
    });

    if (subTabId === 'prontuario') {
        voltarParaLista(); 
    }
}

// ================= PACIENTES =================
async function carregarPacientes() {
    const buscaInput = document.getElementById('busca-pacientes-tab');
    const filtroStatus = document.getElementById('filtro-status-tab');
    
    const termo = buscaInput ? buscaInput.value : '';
    const status = filtroStatus ? filtroStatus.value : 'ativo';

    const url = `${API_URL}/pacientes?search=${encodeURIComponent(termo)}&status=${status}`;
    
    try {
        const res = await fetch(url);
        const pacientes = await res.json();
        const tbody = document.getElementById('tb-pacientes');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        if (pacientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px; color: #666;">Nenhum paciente encontrado.</td></tr>';
            return;
        }

        pacientes.forEach(p => {
            const isAtivo = p.status === 'ativo';
            const color = isAtivo ? 'var(--success-color)' : 'var(--danger-color)';
            
            tbody.innerHTML += `
                <tr style="background: ${isAtivo ? 'transparent' : '#f9f9f9'};">
                    <td onclick="selecionarPacienteProntuario(${p.id}, '${p.nome.replace(/'/g, "\\'")}', '${(p.cpf || '-').replace(/'/g, "\\'")}', '${(p.nome_mae || '-').replace(/'/g, "\\'")}')" 
                        style="cursor: pointer; border-left: 8px solid ${color}; padding-left: 15px;">
                        <strong>${p.nome}</strong> 
                        <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; margin-left: 10px; background: ${isAtivo ? '#e8f5e9' : '#ffebee'}; color: ${color}; font-weight: bold;">
                            ${(p.status || 'ativo').toUpperCase()}
                        </span>
                        <br>
                        <small style="color: #666;">CPF: ${p.cpf || '-'} | Mãe: ${p.nome_mae || '-'}</small>
                    </td>
                    <td>${p.telefone || '-'}</td>
                    <td>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.7rem;" onclick="selecionarPacienteProntuario(${p.id}, '${p.nome.replace(/'/g, "\\'")}', '${(p.cpf || '-').replace(/'/g, "\\'")}', '${(p.nome_mae || '-').replace(/'/g, "\\'")}')">📋 Ver Prontuário</button>
                            <button class="btn" style="padding: 5px 10px; font-size: 0.7rem; background: ${isAtivo ? '#ff9800' : '#4caf50'}; color: white;" onclick="alternarStatusPaciente(${p.id}, '${p.status || 'ativo'}')">
                                ${isAtivo ? '🚫 Desativar' : '✅ Ativar'}
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Erro ao carregar pacientes:", err);
    }
}

function mostrarFeedbackSucesso() {
    const feedback = document.getElementById('feedback-sucesso');
    feedback.style.display = 'flex';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 2000);
}

document.getElementById('form-paciente').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Dados Básicos
    const data = {
        nome: document.getElementById('pac-nome').value,
        cpf: document.getElementById('pac-cpf').value,
        nome_mae: document.getElementById('pac-mae').value,
        idade: parseInt(document.getElementById('pac-idade').value) || null,
        telefone: document.getElementById('pac-telefone').value,
        observacao: document.getElementById('pac-obs').value,
        // Adicionando anamnese_completa como um objeto JSON
        anamnese_completa: {
            identificacao: {
                nascimento: document.getElementById('pac-nascimento').value,
                sexo: document.getElementById('pac-sexo').value,
                escolaridade: document.getElementById('pac-escolaridade').value,
                tipo_escola: document.getElementById('pac-tipo-escola').value
            },
            familia: {
                pai_nome: document.getElementById('fam-pai-nome').value,
                pai_idade: document.getElementById('fam-pai-idade').value,
                pai_escolaridade: document.getElementById('fam-pai-escolaridade').value,
                mae_nome: document.getElementById('fam-mae-nome').value,
                mae_idade: document.getElementById('fam-mae-idade').value,
                mae_escolaridade: document.getElementById('fam-mae-escolaridade').value,
                mora_com: document.getElementById('fam-mora-com').value,
                irmaos: document.getElementById('fam-irmaos').value,
                hierarquia: document.getElementById('fam-hierarquia').value,
                endereco: document.getElementById('fam-endereco').value
            },
            desenvolvimento: {
                desejada: document.getElementById('des-desejada').value,
                parentesco_pais: document.getElementById('des-parentesco-pais').value,
                gestacoes_ant: document.getElementById('des-gestacoes-ant').value,
                prenatal: document.getElementById('des-prenatal').value,
                tipo_parto: document.getElementById('des-tipo-parto').value,
                peso: document.getElementById('des-peso').value,
                complicacoes: document.getElementById('des-complicacoes').value
            },
            marcos: {
                cabeca: document.getElementById('mar-cabeca').value,
                sentou: document.getElementById('mar-sentou').value,
                engatinhou: document.getElementById('mar-engatinhou').value,
                andou: document.getElementById('mar-andou').value,
                palavras: document.getElementById('mar-palavras').value,
                frases: document.getElementById('mar-frases').value,
                observacoes: document.getElementById('mar-obs').value
            },
            saude: {
                dorme: document.getElementById('sau-dorme').value,
                xixi: document.getElementById('sau-xixi').value,
                cabeca: document.getElementById('sau-cabeca').value,
                doencas: document.getElementById('sau-doencas').value,
                familiar: document.getElementById('sau-familiar').value
            },
            social: {
                familia: document.getElementById('soc-familia').value,
                escola: document.getElementById('soc-escola').value,
                personalidade: document.getElementById('soc-personalidade').value
            }
        }
    };

    try {
        const res = await fetch(`${API_URL}/pacientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            e.target.reset();
            showToast("Paciente cadastrado com sucesso!");
            carregarPacientes();
            // Fechar os detalhes após salvar
            document.querySelectorAll('details').forEach(d => d.open = false);
        } else {
            showToast("Erro ao salvar paciente.", "erro");
        }
    } catch (err) {
        console.error("Erro na requisição:", err);
    }
});

async function alternarStatusPaciente(id, statusAtual) {
    const novoStatus = statusAtual === 'ativo' ? 'inativo' : 'ativo';
    
    try {
        const res = await fetch(`${API_URL}/pacientes/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        
        if (res.ok) {
            showToast(`Paciente ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
            carregarPacientes(); // Recarregar a lista
        } else {
            showToast("Erro ao alterar status.", "erro");
        }
    } catch (err) {
        showToast("Falha na conexão.", "erro");
    }
}

async function carregarSelectPacientes(selectId) {
    const res = await fetch(`${API_URL}/pacientes`);
    const pacientes = await res.json();
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">-- Selecione o Paciente --</option>';
    pacientes.filter(p => p.status === 'ativo' || !p.status).forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nome} (CPF: ${p.cpf || '-'})</option>`;
    });
}

// ================= PRONTUÁRIO / ANAMNESE =================

function selecionarPacienteProntuario(id, nome, cpf, mae) {
    // Ocultar a tabela, a barra de pesquisa, os filtros e a sub-navegação
    document.getElementById('container-tabela-pacientes').style.display = 'none';
    const subNav = document.getElementById('pacientes-sub-nav');
    if (subNav) subNav.style.display = 'none';
    const filtrosBox = document.getElementById('filtros-pacientes-box');
    if (filtrosBox) filtrosBox.style.display = 'none';
    
    // Preencher as infos
    document.getElementById('select-paciente-prontuario').value = id;
    document.getElementById('paciente-selecionado-info').innerHTML = `
        <div style="font-size: 1.2rem; margin-bottom: 5px;">${nome}</div>
        <div style="font-weight: normal; font-size: 0.9rem; color: #555;">CPF: ${cpf} | Mãe: ${mae}</div>
    `;
    
    // Mostrar a área do prontuário
    document.getElementById('prontuario-area').style.display = 'block';
    
    carregarProntuario();
    carregarDocumentos(); // Carregar anexos
    window.scrollTo(0, 0);
}

// Upload de Documentos
document.addEventListener('DOMContentLoaded', () => {
    const formUpload = document.getElementById('form-upload-documento');
    const dropZone = document.getElementById('drop-area-documentos'); // ID atualizado
    const fileInput = document.getElementById('input-arquivo');

    if (formUpload) {
        formUpload.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!fileInput.files[0]) return;
            uploadArquivo(fileInput.files[0]);
        });
    }

    // Lógica Drag & Drop
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        dropZone.addEventListener('dragover', () => {
            dropZone.style.background = '#e3f2fd';
            dropZone.style.borderColor = 'var(--primary-color)';
            dropZone.style.transform = 'scale(1.01)';
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.style.background = '#f8f9fa';
                dropZone.style.borderColor = '#ddd';
                dropZone.style.transform = 'scale(1)';
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                uploadArquivo(files[0]);
            }
        });
    }
});

async function uploadArquivo(file) {
    const pacienteId = document.getElementById('select-paciente-prontuario').value;
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('paciente_id', pacienteId);

    try {
        const res = await fetch('/api/documentos/upload', {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            document.getElementById('input-arquivo').value = '';
            showToast("Documento enviado com sucesso!");
            carregarDocumentos();
        } else {
            showToast("Erro ao enviar documento.", "erro");
        }
    } catch (err) {
        console.error("Erro no upload:", err);
        showToast("Falha na conexão com o servidor.", "erro");
    }
}

async function carregarDocumentos() {
    const pacienteId = document.getElementById('select-paciente-prontuario').value;
    const container = document.getElementById('lista-documentos');
    if (!pacienteId || !container) return;

    try {
        const res = await fetch(`/api/documentos/${pacienteId}`);
        const docs = await res.json();
        
        container.innerHTML = '';
        if (docs.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; color: #888; font-size: 0.9rem;">Nenhum documento anexado.</p>';
            return;
        }

        docs.forEach(doc => {
            const data = new Date(doc.criado_em).toLocaleDateString('pt-BR');
            const isVisualizavel = doc.tipo.includes('image') || doc.tipo.includes('pdf');
            
            container.innerHTML += `
                <div style="background: white; border: 1px solid #ddd; padding: 10px; border-radius: 6px; position: relative; cursor: ${isVisualizavel ? 'pointer' : 'default'};" 
                     onclick="${isVisualizavel ? `abrirVisualizador('${doc.caminho}', '${doc.nome_arquivo}', '${doc.tipo}')` : ''}">
                    <div style="font-size: 0.8rem; font-weight: bold; margin-bottom: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${doc.nome_arquivo}">
                        ${doc.tipo.includes('image') ? '🖼️' : (doc.tipo.includes('pdf') ? '📕' : '📄')} ${doc.nome_arquivo}
                    </div>
                    <div style="font-size: 0.7rem; color: #666;">Postado em: ${data}</div>
                    <div style="margin-top: 10px; display: flex; gap: 5px;" onclick="event.stopPropagation()">
                        <button onclick="abrirVisualizador('${doc.caminho}', '${doc.nome_arquivo}', '${doc.tipo}')" class="btn" style="padding: 4px 8px; font-size: 0.7rem; background: var(--primary-color); color: white; flex: 1;">Abrir</button>
                        <button onclick="deletarDocumento(${doc.id})" class="btn btn-danger" style="padding: 4px 8px; font-size: 0.7rem;">Excluir</button>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error("Erro ao carregar documentos:", err);
    }
}

function abrirVisualizador(caminho, nome, tipo) {
    const overlay = document.getElementById('file-viewer-overlay');
    const content = document.getElementById('viewer-content');
    const title = document.getElementById('viewer-filename');

    title.innerText = nome;
    content.innerHTML = ''; // Limpar anterior

    if (tipo.includes('image')) {
        content.innerHTML = `<img src="${caminho}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
    } else if (tipo.includes('pdf')) {
        content.innerHTML = `<iframe src="${caminho}" style="width: 100%; height: 100%; border: none;"></iframe>`;
    } else {
        // Para arquivos não visualizáveis diretamente (doc, xls), oferece download
        content.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">📄</div>
                <p style="color: #333; font-weight: bold;">Este formato de arquivo não pode ser visualizado diretamente.</p>
                <a href="${caminho}" download class="btn btn-primary" style="text-decoration: none; display: inline-block; margin-top: 10px;">Fazer Download do Arquivo</a>
            </div>
        `;
    }

    overlay.style.display = 'flex';
}

function fecharVisualizador() {
    document.getElementById('file-viewer-overlay').style.display = 'none';
    document.getElementById('viewer-content').innerHTML = ''; // Parar execução de iframes/vídeos
}

async function deletarDocumento(id) {
    showConfirm("Tem certeza que deseja excluir este arquivo?", async () => {
        try {
            const res = await fetch(`/api/documentos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("Arquivo removido com sucesso!");
                carregarDocumentos();
            } else {
                showToast("Erro ao remover arquivo.", "erro");
            }
        } catch (err) {
            showToast("Falha na conexão.", "erro");
        }
    });
}

function voltarParaLista() {
    // Restaurar a tabela, a barra de pesquisa, os filtros e a sub-navegação
    document.getElementById('container-tabela-pacientes').style.display = 'block';
    const subNav = document.getElementById('pacientes-sub-nav');
    if (subNav) subNav.style.display = 'flex';
    const filtrosBox = document.getElementById('filtros-pacientes-box');
    if (filtrosBox) filtrosBox.style.display = 'block';
    
    // Ocultar a área de prontuário
    document.getElementById('prontuario-area').style.display = 'none';
    
    // Recarregar os dados da lista mantendo o termo de busca atual
    const buscaInput = document.getElementById('busca-pacientes-tab');
    carregarPacientes(buscaInput ? buscaInput.value : '');
}

async function carregarProntuario() {
    const pacienteId = document.getElementById('select-paciente-prontuario').value;
    const lista = document.getElementById('historico-lista');
    
    if (!pacienteId) return;

    try {
        const res = await fetch(`${API_URL}/anamneses/${pacienteId}`);
        const historico = await res.json();
        
        lista.innerHTML = '';
        if(historico.length === 0) {
            lista.innerHTML = '<p style="color: #666; padding: 20px; background: #f9f9f9; border-radius: 5px;">Nenhum registro encontrado para este paciente.</p>';
            return;
        }

        // Criar estrutura de tabela simples para o histórico
        let html = `
            <table style="margin-top: 10px; font-size: 0.9rem;">
                <thead>
                    <tr style="background: #eee;">
                        <th style="width: 120px;">Data</th>
                        <th>Queixa Principal / Motivo</th>
                        <th style="width: 100px; text-align: center;">Ação</th>
                    </tr>
                </thead>
                <tbody>
        `;

        historico.forEach(h => {
            const dataFormatada = new Date(h.data + 'T00:00:00').toLocaleDateString('pt-BR');
            html += `
                <tr style="cursor: pointer;" onclick="verDetalhesSessao(${JSON.stringify(h).replace(/"/g, '&quot;')})">
                    <td><strong>${dataFormatada}</strong></td>
                    <td style="color: #555;">${h.queixa_principal}</td>
                    <td style="text-align: center;">
                        <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.7rem;">👁️ Ver tudo</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        lista.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

function verDetalhesSessao(sessao) {
    const overlay = document.getElementById('sessao-detalhes-overlay');
    const content = document.getElementById('sessao-detalhes-content');
    const dataFormatada = new Date(sessao.data + 'T00:00:00').toLocaleDateString('pt-BR');

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; background: var(--bg-light); padding: 15px; border-radius: 8px;">
            <div>
                <label style="font-weight: bold; color: #888; font-size: 0.75rem; text-transform: uppercase;">Data da Sessão</label>
                <div style="font-weight: 600; color: #333;">${dataFormatada}</div>
            </div>
            <div>
                <label style="font-weight: bold; color: #888; font-size: 0.75rem; text-transform: uppercase;">Queixa / Motivo</label>
                <div style="font-weight: 600; color: #333;">${sessao.queixa_principal}</div>
            </div>
        </div>
        <div>
            <label style="font-weight: bold; color: #888; font-size: 0.75rem; text-transform: uppercase; display: block; margin-bottom: 10px;">Relato Completo / Histórico</label>
            <div style="background: white; border: 1px solid #eee; padding: 25px; border-radius: 8px; line-height: 1.8; color: #444; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; text-align: justify; font-size: 0.95rem; max-width: 100%; box-sizing: border-box;">
                ${sessao.historico}
            </div>
        </div>
    `;

    overlay.style.display = 'flex';
}

function fecharModalSessao() {
    document.getElementById('sessao-detalhes-overlay').style.display = 'none';
}

document.getElementById('form-anamnese').addEventListener('submit', async (e) => {
    e.preventDefault();
    const paciente_id = document.getElementById('select-paciente-prontuario').value;
    const data = {
        paciente_id: paciente_id,
        data: document.getElementById('anamnese-data').value,
        queixa_principal: document.getElementById('anamnese-queixa').value,
        historico: document.getElementById('anamnese-historico').value
    };

    try {
        const res = await fetch(`${API_URL}/anamneses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            e.target.reset();
            showToast("Registro de sessão salvo com sucesso!");
            carregarProntuario();
        } else {
            showToast("Erro ao salvar registro.", "erro");
        }
    } catch (err) {
        showToast("Falha na conexão.", "erro");
    }
});

// ================= TESTES E AVALIAÇÕES (SRS-2) =================

function mostrarTeste(id) {
    // Por enquanto, só temos o srs2, então esta função pode ser expandida no futuro
    document.getElementById(`teste-${id}`).style.display = 'block';
}

function montarFormularioSRS2() {
    const container = document.getElementById('srs2-perguntas');
    if (container.innerHTML.trim() !== '') return; // Já montado

    const perguntasSRS2 = [
        "1. Parece muito mais inquieta em situações sociais do que quando está sozinha.",
        "2. As expressões em seu rosto não combinam com o que está dizendo.",
        "3. Parece confiante (ou segura) quando está interagindo com outras pessoas.",
        "4. Quando há sobrecarga de estímulos, apresenta padrões rígidos ou inflexíveis de comportamento que parecem estranhos.",
        "5. Não percebe quando os outros estão tentando tirar vantagem dela.",
        "6. Prefere estar sozinha do que com os outros.",
        "7. Demonstra perceber o que os outros estão pensando ou sentindo.",
        "8. Se comporta de maneira estranha ou bizarra.",
        "9. Fica próxima a adultos, parece ser muito dependente deles.",
        "10. Leva as coisas muito 'ao pé da letra' e não compreende o real significado de uma conversa.",
        "11. É autoconfiante.",
        "12. É capaz de comunicar seus sentimentos para as outras pessoas.",
        "13. É estranha na 'tomada de vez' das interações com seus colegas (por exemplo, não parece entender a reciprocidade de uma conversa).",
        "14. Não tem boa coordenação.",
        "15. É capaz de entender o tom de voz e as expressões faciais das outras pessoas.",
        "16. Evita o contato visual ou tem contato visual diferente.",
        "17. Reconhece quando algo é injusto.",
        "18. Tem dificuldade em fazer amigos, mesmo tentando dar o melhor de si.",
        "19. Fica frustrada quando não consegue expressar suas ideias em uma conversa.",
        "20. Mostra interesses sensoriais incomuns (por exemplo, coloca na boca ou gira objetos) ou formas estranhas de brincar com brinquedos.",
        "21. É capaz de imitar as ações de outras pessoas.",
        "22. Brinca adequadamente com crianças da sua idade.",
        "23. Não participa de atividades em grupo a menos que seja convidada a fazê-lo.",
        "24. Tem mais dificuldade do que outras crianças com mudanças na sua rotina.",
        "25. Não parece se importar em estar fora de sintonia ou em um 'mundo' diferente dos outros.",
        "26. Oferece conforto para os outros quando estão tristes.",
        "27. Evita iniciar interações sociais com seus colegas ou adultos.",
        "28. Pensa ou fala sobre a mesma coisa repetidamente."
    ];

    // O SRS-2 tem 65 perguntas no total. Preenchendo as restantes dinamicamente para completar o layout.
    for (let i = 29; i <= 65; i++) {
        perguntasSRS2.push(`${i}. [Questão ${i} do formulário SRS-2 original]`);
    }

    let html = '';
    perguntasSRS2.forEach((pergunta, index) => {
        html += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; background: ${index % 2 === 0 ? '#fff' : '#fdfdfd'};">
                <div style="flex: 1; padding-right: 20px; font-size: 0.9rem;">${pergunta}</div>
                <div style="display: flex; gap: 10px;">
                    <label style="cursor:pointer; text-align:center;"><input type="radio" name="srs2_q${index+1}" value="1" required><br><small>1</small></label>
                    <label style="cursor:pointer; text-align:center;"><input type="radio" name="srs2_q${index+1}" value="2" required><br><small>2</small></label>
                    <label style="cursor:pointer; text-align:center;"><input type="radio" name="srs2_q${index+1}" value="3" required><br><small>3</small></label>
                    <label style="cursor:pointer; text-align:center;"><input type="radio" name="srs2_q${index+1}" value="4" required><br><small>4</small></label>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

document.getElementById('form-srs2').addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Funcionalidade de salvar avaliações em desenvolvimento. As respostas foram processadas.');
    e.target.reset();
    window.scrollTo(0, 0);
});

// ================= FINANCEIRO =================
const formatMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

async function carregarFinanceiro() {
    const res = await fetch(`${API_URL}/financeiro`);
    const financas = await res.json();
    const tbody = document.getElementById('tb-financeiro');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let totalReceitas = 0;
    let totalDespesas = 0;

    financas.forEach(f => {
        const isReceita = f.tipo === 'receita';
        if (isReceita) totalReceitas += f.valor;
        else totalDespesas += f.valor;

        const dataFormatada = new Date(f.data + 'T00:00:00').toLocaleDateString('pt-BR');
        
        tbody.innerHTML += `
            <tr>
                <td>${dataFormatada}</td>
                <td>${f.descricao}</td>
                <td style="color: ${isReceita ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight:bold;">
                    ${isReceita ? 'Entrada' : 'Saída'}
                </td>
                <td>${formatMoeda(f.valor)}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.7rem;" onclick="deletarFinanceiro(${f.id})">X</button>
                </td>
            </tr>
        `;
    });

    const tr = document.getElementById('total-receitas');
    const td = document.getElementById('total-despesas');
    const ts = document.getElementById('total-saldo');
    if (tr) tr.innerText = formatMoeda(totalReceitas);
    if (td) td.innerText = formatMoeda(totalDespesas);
    if (ts) ts.innerText = formatMoeda(totalReceitas - totalDespesas);
}

document.getElementById('form-financeiro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        descricao: document.getElementById('fin-desc').value,
        valor: parseFloat(document.getElementById('fin-valor').value),
        tipo: document.getElementById('fin-tipo').value,
        data: document.getElementById('fin-data').value
    };

    await fetch(`${API_URL}/financeiro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    e.target.reset();
    carregarFinanceiro();
});

async function deletarFinanceiro(id) {
    await fetch(`${API_URL}/financeiro/${id}`, { method: 'DELETE' });
    carregarFinanceiro();
}

// ================= AGENDA =================
async function carregarAgenda() {
    const res = await fetch(`${API_URL}/consultas`);
    const consultas = await res.json();
    const tbody = document.getElementById('tb-agenda');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    consultas.forEach(c => {
        const dataHora = new Date(c.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        let statusColor = c.status === 'agendada' ? '#f39c12' : (c.status === 'realizada' ? 'var(--success-color)' : 'var(--danger-color)');
        
        tbody.innerHTML += `
            <tr>
                <td><strong>${dataHora}</strong></td>
                <td>${c.paciente_nome}</td>
                <td style="color: ${statusColor}; font-weight: bold; text-transform: uppercase; font-size: 0.8rem;">
                    ${c.status}
                </td>
                <td>
                    ${c.status === 'agendada' ? `<button class="btn btn-success" style="padding: 5px; font-size: 0.7rem;" onclick="mudarStatusConsulta(${c.id}, 'realizada')">✓ Feita</button>` : ''}
                    ${c.status === 'agendada' ? `<button class="btn btn-danger" style="padding: 5px; font-size: 0.7rem;" onclick="mudarStatusConsulta(${c.id}, 'cancelada')">X Canc.</button>` : ''}
                    <button class="btn" style="padding: 5px; font-size: 0.7rem; background:#ccc;" onclick="deletarConsulta(${c.id})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

document.getElementById('form-agenda').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        paciente_id: document.getElementById('agenda-paciente').value,
        data_hora: document.getElementById('agenda-datahora').value
    };

    await fetch(`${API_URL}/consultas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    e.target.reset();
    carregarAgenda();
});

async function mudarStatusConsulta(id, status) {
    await fetch(`${API_URL}/consultas/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    carregarAgenda();
}

async function deletarConsulta(id) {
    await fetch(`${API_URL}/consultas/${id}`, { method: 'DELETE' });
    carregarAgenda();
}

async function gerarLinkAvaliacao(tipo) {
    const pacienteId = document.getElementById('srs2-paciente-id').value;
    if (!pacienteId) {
        showToast("Pesquise e selecione um paciente primeiro.", "erro");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/testes/gerar-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paciente_id: pacienteId, teste_tipo: tipo })
        });
        const data = await res.json();
        
        if (data.success) {
            const linkCompleto = `${window.location.origin}/avaliacao.html?token=${data.token}`;
            document.getElementById('input-link-gerado').value = linkCompleto;
            document.getElementById('container-link-gerado').style.display = 'block';
            window.scrollTo(0, 0);
            showToast("Link gerado com sucesso!");
        } else {
            showToast(data.message || "Erro ao gerar link.", "erro");
        }
    } catch (err) {
        showToast("Erro na requisição ao servidor.", "erro");
    }
}

function copiarLink() {
    const input = document.getElementById('input-link-gerado');
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value);
    showToast("Link copiado para o WhatsApp!");
}

// Estilos dinâmicos
const style = document.createElement('style');
style.innerHTML = `
    .sub-nav-item { 
        background: transparent; color: #666; border: none; text-transform: none; 
        font-weight: 600; padding: 10px 15px; border-radius: 0;
    }
    .sub-nav-item.active { 
        color: var(--primary-color); border-bottom: 2px solid var(--primary-color); 
    }
    .sub-nav-item:hover { transform: none; background: #eee; }
    .resultado-item:hover { background-color: #f0f7ff; }
    
    #feedback-sucesso {
        display: none;
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(255,255,255,0.9);
        z-index: 9999;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        animation: fadeIn 0.3s;
    }

    tr:hover td { background-color: #fcfcfc; }
`;
document.head.appendChild(style);

window.onload = () => {
    carregarPacientes();
};
