# Exemplo de Teste para Upload de PDF

Este é um arquivo de exemplo para testar a funcionalidade de upload de PDFs.

## Como testar:

1. Crie um arquivo PDF simples ou use um existente
2. Salve como "teste.pdf"
3. Use o frontend para fazer upload
4. Verifique se o arquivo é enviado corretamente para o N8N

## Estrutura dos dados enviados:

Quando um arquivo é carregado, os dados JSON incluirão:

```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "tipo_analise": "analise_pdf",
  "arquivo_info": {
    "nome": "teste.pdf",
    "tipo": "application/pdf",
    "tamanho": 12345,
    "timestamp": "2025-01-13T10:30:00.000Z"
  }
}
```

## No N8N:

O webhook receberá o arquivo PDF diretamente como binário no campo `$binary.file`.
Você pode usar o nó "Extract from File" para extrair texto do PDF para análise com IA.