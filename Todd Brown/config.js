// Configurações do Frontend N8N - Guilherme Fraga
const CONFIG = {
    // Configurações do Workflow
    workflow: {
        name: "Workflow Guilherme Fraga",
        url: "https://n8neditor.guilhermefraga.tech/webhook-test/884d7756-923f-4d06-839d-2c0b02d3513c",
        webhookUrl: "https://n8neditor.guilhermefraga.tech/webhook-test/884d7756-923f-4d06-839d-2c0b02d3513c",
        defaultMethod: "POST"
    },
    
    // Configurações da Interface
    ui: {
        autoLoadTemplate: true,
        defaultTemplate: "contact",
        showStatusIndicator: true,
        autoHideSuccess: 10000, // 10 segundos
        enableKeyboardShortcuts: true
    },
    
    // Templates personalizados
    templates: {
        contact: {
            label: "Contato",
            icon: "📞",
            data: {
                nome: "João Silva",
                email: "joao.silva@email.com",
                telefone: "+55 11 99999-9999",
                empresa: "Tech Solutions",
                mensagem: "Gostaria de saber mais sobre os serviços oferecidos.",
                origem: "website"
            }
        },
        lead: {
            label: "Lead",
            icon: "🎯",
            data: {
                nome: "Maria Santos",
                email: "maria.santos@empresa.com",
                telefone: "+55 21 88888-8888",
                empresa: "Inovação Digital",
                interesse: "Consultoria em automação",
                orcamento: "R$ 10.000 - R$ 50.000",
                prazo: "30 dias",
                origem: "indicação"
            }
        },
        support: {
            label: "Suporte",
            icon: "🛠️",
            data: {
                nome: "Pedro Costa",
                email: "pedro@minhaempresa.com",
                telefone: "+55 11 77777-7777",
                tipo_solicitacao: "suporte_tecnico",
                prioridade: "alta",
                descricao: "Problema com integração do sistema",
                sistema_afetado: "N8N Workflow",
                origem: "portal_cliente"
            }
        },
        newsletter: {
            label: "Newsletter",
            icon: "📧",
            data: {
                email: "usuario@email.com",
                nome: "Usuário Teste",
                interesses: ["tecnologia", "automação", "n8n"],
                origem: "landing_page",
                aceita_marketing: true
            }
        },
        document: {
            label: "PDF",
            icon: "📄",
            data: {
                nome: "Ana Oliveira",
                email: "ana@email.com",
                telefone: "+55 11 66666-6666",
                tipo_analise: "analise_pdf",
                prioridade: "media",
                observacoes: "PDF para análise com E5 Method",
                origem: "upload_frontend"
            }
        }
    },
    
    // Configurações de validação
    validation: {
        requiredFields: ["nome", "email"],
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneRegex: /^\+?[\d\s\-\(\)]+$/
    },
    
    // Mensagens do sistema
    messages: {
        success: "✅ Dados enviados com sucesso!",
        error: "❌ Erro ao enviar dados",
        loading: "Enviando dados...",
        invalidJson: "JSON inválido. Verifique a sintaxe.",
        invalidEmail: "Email inválido",
        requiredField: "Campo obrigatório",
        connectionError: "Erro de conexão. Verifique a URL e configurações CORS."
    }
};

// Exportar configuração para uso global
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}