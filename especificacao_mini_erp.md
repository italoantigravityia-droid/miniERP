# Especificação Técnica: Mini ERP Antigravity

Este documento detalha os requisitos para o desenvolvimento de um Mini ERP funcional, focado na gestão de clientes, produtos e vendas, com integridade de dados e lógica de negócio automatizada.

## 1. Modelagem de Dados e Relacionamentos

A estrutura do banco de dados deve seguir o modelo relacional abaixo para garantir a consistência das informações.

### 1.1 Entidade: Cliente (Customer)
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| id | Integer (PK) | Sim | Identificador único |
| nome | String | Sim | Nome completo ou Razão Social |
| documento | String | Sim | CPF ou CNPJ |
| email | String | Não | E-mail para contato |
| telefone | String | Não | Telefone de contato |

### 1.2 Entidade: Produto (Product)
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| id | Integer (PK) | Sim | Identificador único |
| nome | String | Sim | Nome do produto |
| preco_unitario | Decimal | Sim | Preço de venda (Mínimo: 0.00) |
| estoque | Integer | Sim | Quantidade em mãos |

### 1.3 Entidade: Venda (Sale)
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| id | Integer (PK) | Sim | Identificador único |
| cliente_id | Integer (FK) | Sim | Referência ao Cliente |
| data_venda | DateTime | Sim | Data e hora da transação |
| valor_total | Decimal | Sim | Calculado automaticamente |

### 1.4 Entidade: Item da Venda (SaleItem)
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| id | Integer (PK) | Sim | Identificador único |
| venda_id | Integer (FK) | Sim | Referência à Venda |
| produto_id | Integer (FK) | Sim | Referência ao Produto |
| quantidade | Integer | Sim | Quantidade vendida (Mínimo: 1) |
| preco_aplicado | Decimal | Sim | Preço do produto no momento da venda |

---

## 2. Regras de Negócio (Lógica do Sistema)

O sistema deve implementar as seguintes validações e automações:

1.  **Integridade da Venda:** É estritamente proibido registrar uma venda sem associar um cliente existente.
2.  **Validação de Preços:** O cadastro de produtos não deve aceitar valores negativos no campo `preco_unitario`.
3.  **Composição Mínima:** Uma venda só pode ser finalizada se contiver pelo menos um item (Produto + Quantidade).
4.  **Cálculo Automático:** O campo `valor_total` da Venda deve ser a soma de `(quantidade * preco_aplicado)` de todos os itens relacionados. O usuário não deve inserir este valor manualmente.
5.  **Histórico de Preços:** O `preco_aplicado` no Item da Venda deve ser registrado para que alterações futuras no cadastro de produtos não alterem o valor de vendas passadas.

---

## 3. Funcionalidades da Interface (UI/UX)

O ERP deve fornecer as seguintes visões:

* **Dashboards:** Exibição do Total de Vendas (R$), Quantidade de Pedidos e Top 5 Produtos mais vendidos.
* **Gestão (CRUD):** Interfaces completas para Criar, Ler, Atualizar e Deletar Clientes e Produtos.
* **Módulo de PDV:** Tela de registro de venda com seleção de cliente via busca e adição dinâmica de múltiplos produtos.
* **Relatório:** Listagem detalhada de vendas realizadas com filtros por data ou cliente.

---

## 4. Instruções para o Antigravity

- Utilize **Português (Brasil)** para todas as labels, mensagens de erro e títulos de interface.
- Gere o código seguindo as melhores práticas de Clean Code e separação de camadas.
- Garanta que a navegação entre os cadastros e o dashboard seja intuitiva.
