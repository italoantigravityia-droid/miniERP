# Sprint 2: Refinamento e Validações do Mini ERP

Este documento orienta a implementação de melhorias críticas na interface, segurança de dados e processos de teste do sistema.

## 1. Interface e Navegação
- **Menu Lateral (Sidebar):** Implementar navegação persistente contendo links para:
  - Dashboard
  - Cadastro de Clientes
  - Cadastro de Produtos
  - Registro de Vendas
  - Relatórios

## 2. Refinamento de CRUDs e Validações
Cada formulário deve implementar **Máscaras de Entrada** e **Validações de Integridade**:

### 2.1 Clientes
- **Máscaras:** CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00) e Telefone ((00) 00000-0000).
- **Validações:** - Impedir duplicidade de documento (CPF/CNPJ único).
  - Validar formato de e-mail.
  - Bloquear cadastro com campos obrigatórios vazios.

### 2.2 Produtos
- **Máscara:** Valor Monetário (R$ 0,00).
- **Validações:**
  - Bloquear preço de venda igual ou inferior a zero.
  - Validar que o estoque não seja negativo no momento do cadastro.

## 3. Protocolo de Qualidade e Testes (Checklist)
O Antigravity deve seguir rigorosamente estes passos para cada funcionalidade:

1.  **Entendimento de Código:** Não avançar para a próxima tarefa sem explicar brevemente a lógica do endpoint criado.
2.  **Teste de Endpoints:** Realizar chamadas de teste (Unitários ou Integração) para cada rota (POST, GET, PUT, DELETE).
3.  **Tratamento de Erros:**
    - Caso um teste falhe, realizar o debug manual ou solicitar correção imediata.
    - O sistema deve retornar mensagens de erro amigáveis para o usuário (ex: "Preço inválido" em vez de um erro 500).

## 4. Análise de Vulnerabilidades
O sistema deve ser auditado para responder:
- **Dados Inválidos:** É possível salvar um cliente com nome vazio via API? (Deve ser bloqueado).
- **Validação Faltante:** Existe validação no lado do servidor (Backend) além do lado do cliente (Frontend)? (Ambas são obrigatórias).
