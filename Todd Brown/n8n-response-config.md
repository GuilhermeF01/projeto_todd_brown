# Configuração de Resposta JSON no N8N

Este guia mostra como configurar o workflow N8N para retornar um JSON estruturado que o frontend possa processar e disponibilizar para download.

## 🎯 Objetivo

Retornar uma resposta JSON estruturada contendo:
- Dados do usuário
- Resultado da análise do PDF
- Metadados do processamento
- Status da operação

## 🔧 Configuração do Workflow N8N

### 1. Estrutura Básica do Workflow

```
Webhook → Processar PDF → Análise E5 → Responder JSON
```

### 2. Configuração do Node Webhook

**Webhook Settings:**
- **HTTP Method**: POST
- **Path**: `/webhook/RdLmcHPFXlrc5KeQ`
- **Response Mode**: `Respond to Webhook`
- **Response Code**: 200
- **Response Headers**: 
  ```json
  {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }
  ```

### 3. Node de Processamento do PDF

**Function Node - "Processar Dados":**
```javascript
// Extrair dados do webhook
const userData = {
  nome: $input.first().json.nome || '',
  email: $input.first().json.email || '',
  telefone: $input.first().json.telefone || '',
  timestamp: $input.first().json.timestamp || new Date().toISOString()
};

// Informações do arquivo
const fileInfo = {
  nome: $input.first().json.arquivo_nome || 'arquivo.pdf',
  tipo: $input.first().json.arquivo_tipo || 'application/pdf',
  tamanho: $input.first().json.arquivo_tamanho || 0
};

// Preparar dados para análise
return {
  json: {
    userData,
    fileInfo,
    processedAt: new Date().toISOString(),
    status: 'processing'
  }
};
```

### 4. Node de Análise E5 Method

**Function Node - "Análise E5 Method":**
```javascript
const input = $input.first().json;

// Simular análise do PDF com E5 Method
const e5Analysis = {
  envision: {
    score: Math.floor(Math.random() * 100),
    elementos_encontrados: [
      "Visão clara do resultado",
      "Benefícios específicos mencionados",
      "Transformação prometida"
    ],
    recomendacoes: [
      "Fortalecer a visão do resultado final",
      "Adicionar mais detalhes sobre benefícios"
    ]
  },
  empathize: {
    score: Math.floor(Math.random() * 100),
    dores_identificadas: [
      "Frustração com soluções anteriores",
      "Urgência na resolução do problema",
      "Medo de não conseguir resultados"
    ],
    conexao_emocional: "Alta"
  },
  educate: {
    score: Math.floor(Math.random() * 100),
    conteudo_educativo: [
      "Explicação do método",
      "Casos de sucesso",
      "Prova social presente"
    ],
    clareza: "Boa"
  },
  enroll: {
    score: Math.floor(Math.random() * 100),
    call_to_action: "Presente e claro",
    urgencia: "Moderada",
    oferta: "Bem estruturada"
  },
  experience: {
    score: Math.floor(Math.random() * 100),
    jornada_cliente: "Bem definida",
    suporte: "Mencionado",
    garantias: "Presentes"
  }
};

// Calcular score geral
const scoreGeral = Math.round(
  (e5Analysis.envision.score + 
   e5Analysis.empathize.score + 
   e5Analysis.educate.score + 
   e5Analysis.enroll.score + 
   e5Analysis.experience.score) / 5
);

// Determinar classificação
let classificacao = "Baixo";
if (scoreGeral >= 80) classificacao = "Excelente";
else if (scoreGeral >= 60) classificacao = "Bom";
else if (scoreGeral >= 40) classificacao = "Regular";

return {
  json: {
    ...input,
    analise: e5Analysis,
    resumo: {
      score_geral: scoreGeral,
      classificacao: classificacao,
      pontos_fortes: [
        "Boa estrutura narrativa",
        "Elementos persuasivos presentes"
      ],
      areas_melhoria: [
        "Fortalecer call-to-action",
        "Adicionar mais prova social"
      ]
    },
    status: 'completed'
  }
};
```

### 5. Node de Resposta Final

**Function Node - "Preparar Resposta JSON":**
```javascript
const input = $input.first().json;

// Estruturar resposta final
const response = {
  success: true,
  timestamp: new Date().toISOString(),
  usuario: input.userData,
  arquivo: input.fileInfo,
  analise_e5: {
    score_geral: input.resumo.score_geral,
    classificacao: input.resumo.classificacao,
    detalhes: input.analise,
    resumo: input.resumo
  },
  recomendacoes: {
    prioritarias: [
      "Fortalecer elementos de urgência",
      "Melhorar prova social",
      "Otimizar call-to-action"
    ],
    secundarias: [
      "Adicionar mais casos de sucesso",
      "Melhorar estrutura visual",
      "Incluir garantias mais específicas"
    ]
  },
  metadados: {
    versao_analise: "1.0",
    metodologia: "E5 Method - Todd Brown",
    processado_em: input.processedAt,
    finalizado_em: new Date().toISOString(),
    tempo_processamento: "2.3s"
  }
};

return {
  json: response
};
```

### 6. Node Respond to Webhook

**Respond to Webhook Settings:**
- **Response Code**: 200
- **Response Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  }
  ```
- **Response Body**: `{{ $json }}`

## 📋 Exemplo de Resposta JSON

```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "usuario": {
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "+55 11 99999-9999",
    "timestamp": "2024-01-15T10:29:45.000Z"
  },
  "arquivo": {
    "nome": "documento.pdf",
    "tipo": "application/pdf",
    "tamanho": 2048576
  },
  "analise_e5": {
    "score_geral": 75,
    "classificacao": "Bom",
    "detalhes": {
      "envision": {
        "score": 80,
        "elementos_encontrados": [
          "Visão clara do resultado",
          "Benefícios específicos mencionados"
        ],
        "recomendacoes": [
          "Fortalecer a visão do resultado final"
        ]
      },
      "empathize": {
        "score": 70,
        "dores_identificadas": [
          "Frustração com soluções anteriores",
          "Urgência na resolução do problema"
        ],
        "conexao_emocional": "Alta"
      },
      "educate": {
        "score": 75,
        "conteudo_educativo": [
          "Explicação do método",
          "Casos de sucesso"
        ],
        "clareza": "Boa"
      },
      "enroll": {
        "score": 78,
        "call_to_action": "Presente e claro",
        "urgencia": "Moderada",
        "oferta": "Bem estruturada"
      },
      "experience": {
        "score": 72,
        "jornada_cliente": "Bem definida",
        "suporte": "Mencionado",
        "garantias": "Presentes"
      }
    },
    "resumo": {
      "score_geral": 75,
      "classificacao": "Bom",
      "pontos_fortes": [
        "Boa estrutura narrativa",
        "Elementos persuasivos presentes"
      ],
      "areas_melhoria": [
        "Fortalecer call-to-action",
        "Adicionar mais prova social"
      ]
    }
  },
  "recomendacoes": {
    "prioritarias": [
      "Fortalecer elementos de urgência",
      "Melhorar prova social",
      "Otimizar call-to-action"
    ],
    "secundarias": [
      "Adicionar mais casos de sucesso",
      "Melhorar estrutura visual"
    ]
  },
  "metadados": {
    "versao_analise": "1.0",
    "metodologia": "E5 Method - Todd Brown",
    "processado_em": "2024-01-15T10:29:50.000Z",
    "finalizado_em": "2024-01-15T10:30:00.000Z",
    "tempo_processamento": "2.3s"
  }
}
```

## 🚨 Tratamento de Erros

**Function Node - "Tratamento de Erro":**
```javascript
// Em caso de erro no processamento
const errorResponse = {
  success: false,
  error: {
    code: "PROCESSING_ERROR",
    message: "Erro ao processar o documento PDF",
    details: "O arquivo pode estar corrompido ou em formato não suportado",
    timestamp: new Date().toISOString()
  },
  usuario: $input.first().json.userData || {},
  arquivo: $input.first().json.fileInfo || {},
  metadados: {
    versao_analise: "1.0",
    metodologia: "E5 Method - Todd Brown",
    erro_em: new Date().toISOString()
  }
};

return {
  json: errorResponse
};
```

## 🔧 Configurações Avançadas

### Headers CORS Completos
```json
{
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
}
```

### Validação de Dados
```javascript
// Validar dados recebidos
const requiredFields = ['nome', 'email', 'telefone'];
const missingFields = requiredFields.filter(field => !$input.first().json[field]);

if (missingFields.length > 0) {
  return {
    json: {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Campos obrigatórios não preenchidos",
        missing_fields: missingFields
      }
    }
  };
}
```

## 📥 Como o Frontend Processa

O frontend já está configurado para:
1. Receber a resposta JSON
2. Salvar no localStorage
3. Exibir na página de resultados
4. Permitir download do JSON completo

## 🧪 Teste da Configuração

1. Configure o workflow conforme descrito
2. Ative o webhook
3. Teste com o frontend
4. Verifique se o JSON é retornado corretamente
5. Confirme se o download funciona na página de resultados

## 📊 Monitoramento

- Adicione logs nos nodes para debug
- Monitore tempo de processamento
- Verifique taxa de erro
- Analise qualidade das respostas

---

Esta configuração garante que o N8N retorne um JSON estruturado e completo que o frontend pode processar e disponibilizar para download! 🚀