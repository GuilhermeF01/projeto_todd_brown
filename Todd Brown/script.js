// Configuração e manipulação do formulário N8N
class N8NFrontend {
    constructor() {
        this.form = document.getElementById('n8nForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.loading = document.getElementById('loading');
        this.response = document.getElementById('response');
        this.uploadedFile = null;
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.loadSavedData();
        this.setupAutoSave();
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const webhookUrl = formData.get('webhookUrl');
        const method = formData.get('method');
        
        // Capturar dados dos campos específicos
        const userName = formData.get('userName');
        const userEmail = formData.get('userEmail');
        const userPhone = formData.get('userPhone');
        
        // Validação básica
        if (!webhookUrl) {
            this.showResponse('Por favor, insira a URL do webhook', 'error');
            return;
        }
        
        // Validar campos obrigatórios
        if (!userName || !userEmail || !userPhone) {
            this.showResponse('Por favor, preencha nome, e-mail e telefone', 'error');
            return;
        }
        
        // Validar e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            this.showResponse('Por favor, insira um e-mail válido', 'error');
            return;
        }
        
        // Validar se há arquivo PDF carregado
        const fileInput = document.getElementById('pdfFile');
        if (!fileInput.files || !fileInput.files[0]) {
            this.showResponse('Por favor, selecione um arquivo PDF para análise', 'error');
            return;
        }
        
        // Construir objeto de dados
        let data = {
            nome: userName,
            email: userEmail,
            telefone: userPhone,
            tipo_analise: "analise_pdf",
            origem: "todd_brown_project",
            timestamp: new Date().toISOString()
        };
        

        
        // Adicionar metadados do arquivo se foi carregado
        if (this.uploadedFile) {
            data.arquivo_info = {
                nome: this.uploadedFile.name,
                tipo: this.uploadedFile.type,
                tamanho: this.uploadedFile.size,
                timestamp: new Date().toISOString()
            };
        }
        
        // Salvar dados no localStorage
        this.saveData({ webhookUrl, method, userName, userEmail, userPhone });
        
        // Enviar requisição
        await this.sendToN8N(webhookUrl, method, data);
    }
    
    async sendToN8N(url, method, data) {
        this.showLoading(true);
        this.hideResponse();
        
        try {
            let options = {
                method: method
            };
            
            // Verificar se há arquivo carregado
            const fileInput = document.getElementById('pdfFile');
            const hasFile = fileInput && fileInput.files && fileInput.files[0];
            
            console.log('Enviando dados:', {
                hasFile: !!hasFile,
                fileName: hasFile ? fileInput.files[0].name : 'nenhum',
                fileSize: hasFile ? fileInput.files[0].size : 0,
                data: data
            });
            
            if (hasFile) {
                // Usar FormData para envio com arquivo
                const formData = new FormData();
                
                // Adicionar o arquivo PDF
                formData.append('file', fileInput.files[0]);
                console.log('Arquivo adicionado ao FormData:', fileInput.files[0].name, fileInput.files[0].size, 'bytes');
                
                // Adicionar dados como JSON
                formData.append('data', JSON.stringify(data));
                
                // Adicionar campos individuais para facilitar acesso no N8N
                formData.append('nome', data.nome);
                formData.append('email', data.email);
                formData.append('telefone', data.telefone);
                formData.append('tipo_analise', data.tipo_analise);
                formData.append('origem', data.origem);
                formData.append('timestamp', data.timestamp);
                
                // Log dos campos adicionados
                console.log('Campos adicionados ao FormData:', {
                    nome: data.nome,
                    email: data.email,
                    telefone: data.telefone,
                    tipo_analise: data.tipo_analise
                });
                
                // Se há metadados do arquivo, adicionar também
                if (data.arquivo_info) {
                    formData.append('arquivo_nome', data.arquivo_info.nome);
                    formData.append('arquivo_tipo', data.arquivo_info.tipo);
                    formData.append('arquivo_tamanho', data.arquivo_info.tamanho);
                }
                
                options.body = formData;
                // Não definir Content-Type - deixar o browser definir com boundary
                
                console.log('Enviando FormData com arquivo:', fileInput.files[0].name);
                
            } else {
                // Sem arquivo, usar JSON tradicional
                options.headers = {
                    'Content-Type': 'application/json',
                };
                
                if (method !== 'GET' && Object.keys(data).length > 0) {
                    options.body = JSON.stringify(data);
                }
                
                console.log('Enviando JSON sem arquivo');
            }
            
            console.log('📡 Enviando requisição para:', url);
            console.log('📋 Opções da requisição:', {
                method: options.method,
                hasBody: !!options.body,
                bodyType: options.body instanceof FormData ? 'FormData' : typeof options.body,
                headers: options.headers || 'Nenhum header customizado'
            });
            
            const response = await fetch(url, options);
            
            console.log('📨 Resposta recebida:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });
            
            if (!response.ok) {
                const errorBody = await response.text();
                console.error('❌ Corpo da resposta de erro:', errorBody);
                
                if (response.status === 404) {
                    throw new Error(`Webhook não encontrado (404). Verifique se o workflow está ativo no N8N. Detalhes: ${errorBody}`);
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}. Detalhes: ${errorBody}`);
                }
            }
            
            let result;
            try {
                result = await response.json();
            } catch {
                result = await response.text();
            }
            
            console.log('Resposta do webhook:', result);
            
            // Salvar dados para a página de resultado
            const userData = {
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                arquivo: this.uploadedFile ? this.uploadedFile.name : 'N/A'
            };
            
            // Salvar com múltiplas chaves para compatibilidade
            localStorage.setItem('analysis-result', JSON.stringify(result));
            localStorage.setItem('analysis-user', JSON.stringify(userData));
            
            // Salvar também no formato antigo para compatibilidade
            const completeData = {
                resultado: result,
                usuario: userData,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('analiseData', JSON.stringify(completeData));
            
            console.log('Dados salvos no localStorage:', {
                result: result,
                userData: userData,
                completeData: completeData
            });
            
            // Mostrar mensagem de sucesso brevemente antes de redirecionar
            this.showResponse(
                `✅ Análise concluída! Redirecionando para os resultados...`, 
                'success'
            );
            updateStatus('ready', 'Análise concluída');
            
            // Redirecionar para página de resultado após 2 segundos
            setTimeout(() => {
                window.location.href = 'resultado.html';
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao enviar para N8N:', error);
            
            // Preparar dados do erro para a página de resultado
            const userData = {
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                arquivo: this.uploadedFile ? this.uploadedFile.name : 'N/A'
            };
            
            const errorResult = {
                error: true,
                message: error.message,
                type: error.name === 'TypeError' && error.message.includes('fetch') 
                    ? 'Erro de conexão. Verifique se a URL está correta e se o N8N está acessível.' 
                    : error.message,
                timestamp: new Date().toISOString()
            };
            
            // Salvar com múltiplas chaves para compatibilidade
            localStorage.setItem('analysis-result', JSON.stringify(errorResult));
            localStorage.setItem('analysis-user', JSON.stringify(userData));
            
            // Salvar também no formato antigo para compatibilidade
            const completeErrorData = {
                resultado: errorResult,
                usuario: userData,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('analiseData', JSON.stringify(completeErrorData));
            
            console.log('Dados de erro salvos no localStorage:', {
                errorResult: errorResult,
                userData: userData,
                completeErrorData: completeErrorData
            });
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                this.showResponse(
                    '❌ Erro de conexão. Redirecionando para detalhes...',
                    'error'
                );
            } else {
                this.showResponse(
                    `❌ Erro na análise. Redirecionando para detalhes...`,
                    'error'
                );
            }
            updateStatus('error', 'Erro no envio');
            
            // Redirecionar para página de resultado após 3 segundos mesmo com erro
            setTimeout(() => {
                window.location.href = 'resultado.html';
            }, 3000);
        } finally {
            this.showLoading(false);
        }
    }
    
    showLoading(show) {
        this.loading.style.display = show ? 'block' : 'none';
        this.submitBtn.disabled = show;
        this.submitBtn.textContent = show ? 'Analisando documento...' : 'Iniciar Análise';
        
        // Atualizar status visual
        if (show) {
            updateStatus('sending', 'Processando documento...');
        }
    }
    
    showResponse(message, type) {
        this.response.textContent = message;
        this.response.className = `response ${type}`;
        this.response.style.display = 'block';
        
        // Auto-hide após 10 segundos se for sucesso
        if (type === 'success') {
            setTimeout(() => {
                this.hideResponse();
            }, 10000);
        }
    }
    
    hideResponse() {
        this.response.style.display = 'none';
    }
    
    saveData(data) {
        localStorage.setItem('n8n-frontend-data', JSON.stringify(data));
    }
    
    loadSavedData() {
        const saved = localStorage.getItem('n8n-frontend-data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                
                if (data.webhookUrl) {
                    document.getElementById('webhookUrl').value = data.webhookUrl;
                }
                if (data.method) {
                    document.getElementById('method').value = data.method;
                }

            } catch (error) {
                console.warn('Erro ao carregar dados salvos:', error);
            }
        }
    }
    
    setupAutoSave() {
        // Auto-salvar a URL do webhook quando o usuário digitar
        const webhookInput = document.getElementById('webhookUrl');
        webhookInput.addEventListener('blur', () => {
            const currentData = this.getCurrentFormData();
            this.saveData(currentData);
        });
    }
    
    getCurrentFormData() {
        return {
            webhookUrl: document.getElementById('webhookUrl').value,
            method: document.getElementById('method').value
        };
    }
}

// Utilitários adicionais
const N8NUtils = {
    // Templates específicos para o workflow do Guilherme
    getExampleData: (type) => {
        const examples = {
            contact: {
                nome: "João Silva",
                email: "joao.silva@email.com",
                telefone: "+55 11 99999-9999",
                empresa: "Tech Solutions",
                mensagem: "Gostaria de saber mais sobre os serviços oferecidos.",
                origem: "website"
            },
            lead: {
                nome: "Maria Santos",
                email: "maria.santos@empresa.com",
                telefone: "+55 21 88888-8888",
                empresa: "Inovação Digital",
                interesse: "Consultoria em automação",
                orcamento: "R$ 10.000 - R$ 50.000",
                prazo: "30 dias",
                origem: "indicação"
            },
            support: {
                nome: "Pedro Costa",
                email: "pedro@minhaempresa.com",
                telefone: "+55 11 77777-7777",
                tipo_solicitacao: "suporte_tecnico",
                prioridade: "alta",
                descricao: "Problema com integração do sistema",
                sistema_afetado: "N8N Workflow",
                origem: "portal_cliente"
            },
            document: {
                nome: "Ana Oliveira",
                email: "ana@email.com",
                telefone: "+55 11 66666-6666",
                tipo_analise: "analise_pdf",
                prioridade: "media",
                observacoes: "PDF para análise com E5 Method",
                origem: "upload_frontend"
            },
            user: {
                nome: "Ana Oliveira",
                email: "ana@email.com",
                telefone: "+55 11 66666-6666",
                mensagem: "Teste do workflow"
            }
        };
        
        return examples[type] || examples.user;
    },
    
    // Validar URL do webhook N8N
    isValidN8NWebhook: (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.includes('webhook');
        } catch {
            return false;
        }
    }
};

// Funções globais para templates
function loadTemplate(type) {
    // Templates agora apenas atualizam os campos do formulário
    const data = N8NUtils.getExampleData(type);
    
    // Preencher campos do formulário
    if (data.nome) document.getElementById('userName').value = data.nome;
    if (data.email) document.getElementById('userEmail').value = data.email;
    if (data.telefone) document.getElementById('userPhone').value = data.telefone;
    
    // Atualizar status
    updateStatus('ready', `Template ${type} carregado`);
}

// Funções para upload de arquivo
function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Validar tipo de arquivo
    const allowedTypes = [
        'application/pdf' // .pdf
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Por favor, selecione apenas arquivos PDF');
        input.value = '';
        return;
    }
    
    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        alert('Arquivo muito grande. Máximo permitido: 10MB');
        input.value = '';
        return;
    }
    
    // Mostrar informações do arquivo
    showFileInfo(file);
    
    // Converter para base64
    convertFileToBase64(file);
}

function showFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = fileInfo.querySelector('.file-name');
    const fileSize = fileInfo.querySelector('.file-size');
    
    fileName.textContent = `📄 ${file.name}`;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'flex';
    
    updateStatus('ready', 'Documento carregado e pronto para análise');
}

function convertFileToBase64(file) {
    // Armazenar referência do arquivo para envio direto
    const frontend = window.n8nFrontend;
    if (frontend) {
        frontend.uploadedFile = {
            name: file.name,
            type: file.type,
            size: file.size,
            file: file // Manter referência do arquivo original
        };
        
        console.log('Arquivo carregado:', {
            nome: file.name,
            tipo: file.type,
            tamanho: file.size
        });
    }
    
    updateStatus('ready', 'Documento processado e pronto para análise');
}

function removeFile() {
    const fileInput = document.getElementById('pdfFile');
    const fileInfo = document.getElementById('fileInfo');
    
    fileInput.value = '';
    fileInfo.style.display = 'none';
    
    // Remover arquivo da instância
    const frontend = window.n8nFrontend;
    if (frontend) {
        frontend.uploadedFile = null;
    }
    
    updateStatus('ready', 'Arquivo removido');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function clearData() {
    // Limpar campos do formulário
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPhone').value = '';
    
    // Limpar arquivo se houver
    removeFile();
    
    updateStatus('ready', 'Dados limpos');
}

function updateStatus(status, message) {
    const submitBtn = document.getElementById('submitBtn');
    const indicator = document.querySelector('.status-indicator') || createStatusIndicator();
    
    indicator.className = `status-indicator status-${status}`;
    
    if (message) {
        console.log(`Status: ${message}`);
    }
}

function createStatusIndicator() {
    const indicator = document.createElement('span');
    indicator.className = 'status-indicator status-ready';
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.insertBefore(indicator, submitBtn.firstChild);
    return indicator;
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const frontend = new N8NFrontend();
    window.n8nFrontend = frontend; // Tornar acessível globalmente para as funções de upload
    

    
    // Criar indicador de status
    updateStatus('ready', 'Todd Brown Project - Sistema de análise pronto');
});

// Função para testar webhook
async function testWebhook() {
    const webhookUrl = document.getElementById('webhookUrl').value;
    
    if (!webhookUrl) {
        alert('❌ Por favor, insira a URL do webhook primeiro');
        return;
    }
    
    const testBtn = event.target;
    const originalText = testBtn.textContent;
    testBtn.textContent = '🔄 Testando...';
    testBtn.disabled = true;
    
    try {
        console.log('🧪 Testando webhook:', webhookUrl);
        
        const testData = {
            test: true,
            message: "Teste de conectividade",
            timestamp: new Date().toISOString(),
            origem: "todd_brown_project_test"
        };
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📡 Resposta do webhook:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        if (response.ok) {
            const result = await response.text();
            console.log('✅ Resposta do servidor:', result);
            alert('✅ Webhook funcionando! Status: ' + response.status);
            updateStatus('ready', 'Webhook testado com sucesso');
        } else {
            const errorText = await response.text();
            console.error('❌ Erro do webhook:', errorText);
            
            if (response.status === 404) {
                alert('❌ Webhook não encontrado (404)\n\nDica: No N8N, clique em "Execute Workflow" no canvas e tente novamente.\n\nEm modo de teste, o webhook só funciona após ativar o workflow.');
            } else {
                alert(`❌ Erro no webhook: ${response.status} - ${response.statusText}\n\nDetalhes: ${errorText}`);
            }
            updateStatus('error', 'Erro no teste do webhook');
        }
        
    } catch (error) {
        console.error('🚨 Erro de conexão:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            alert('❌ Erro de conexão\n\nPossíveis causas:\n• URL incorreta\n• Servidor N8N offline\n• Problemas de CORS\n• Firewall/proxy bloqueando');
        } else {
            alert('❌ Erro inesperado: ' + error.message);
        }
        updateStatus('error', 'Erro de conexão');
    } finally {
        testBtn.textContent = originalText;
        testBtn.disabled = false;
    }
}

// Adicionar atalhos de teclado
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter para enviar
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('submitBtn').click();
    }
    
    // Ctrl/Cmd + L para limpar
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        clearData();
    }
    
    // Ctrl/Cmd + T para testar webhook
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        testWebhook();
    }
});