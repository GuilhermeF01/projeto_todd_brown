# 📄 Analisador de VSL - Metodologia Todd Brown

Sistema web para análise de Video Sales Letters (VSL) em PDF utilizando a metodologia E5 Method de Todd Brown.

## 🎯 O que faz

Este projeto recebe arquivos PDF de VSLs e faz uma análise completa baseada na metodologia E5 Method do Todd Brown, identificando os 5 pilares fundamentais:

- **Envision** - Visualização do resultado desejado
- **Empathize** - Compreensão das dores do cliente  
- **Educate** - Educação sobre a solução
- **Enroll** - Inscrição/conversão do prospect
- **Experience** - Experiência de transformação

## 🚀 Como usar

1. Abra o `index.html` no navegador
2. Preencha seus dados (nome, email, telefone)
3. Faça upload do PDF da sua VSL
4. Clique em "Iniciar Análise"
5. Veja os resultados na página seguinte

## ⚙️ Configuração

Configure a URL do seu webhook N8N no arquivo `index.html`:

```html
<input type="url" id="webhookUrl" name="webhookUrl"
    value="https://seu-n8n.com/webhook/seu-id"
    placeholder="URL do seu webhook N8N" required>
```

## 📋 Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Servidor web (pode ser local)
- Webhook N8N configurado
- Arquivos PDF (máximo 10MB)

## 🛠️ Tecnologias

- HTML5, CSS3, JavaScript
- N8N Webhook
- Metodologia E5 Method

## 📞 Suporte

Para dúvidas sobre a metodologia E5 Method, visite [toddbrown.com](https://toddbrown.com)

---

**Todd Brown Project** - Análise de VSL com E5 Method 🚀
