# Sprint 3: Expansão de Banco de Dados - Entidade Cidade

Este documento estabelece as especificações para a inclusão da gestão estruturada de localizações no Mini ERP, vinculando os clientes às suas respectivas Cidades e Estados com base no padrão oficial do IBGE.

## 1. Atualização do Modelo de Dados (DER)

Para evitar redundância e inconsistência de dados (como nomes de cidades digitados incorretamente), isolamos as localizações em uma tabela dedicada.

### 1.1 Nova Entidade: Cidade (City)
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| id | Integer (PK) | Sim | ID único / Código IBGE da Cidade |
| nome | String(100) | Sim | Nome oficial do município |
| uf | String(2) | Sim | Sigla do Estado (Ex: SP, RJ, MG) |

### 1.2 Alteração na Entidade: Cliente (Customer)
O campo de texto livre de endereço deve ser substituído por uma chave estrangeira:
- Remover campos de texto solto para Cidade/Estado.
- Adicionar o campo `cidade_id` (Integer, FK apontando para `Cidade.id`, Obrigatório: Sim).

---

## 2. Regras de Negócio e Validação da Interface

1. **Vínculo Obrigatório:** Nenhum cliente pode ser cadastrado ou atualizado sem que uma Cidade válida seja selecionada.
2. **Componente de Busca (Select/Autocompletar):** No formulário de cadastro do Cliente, o campo de Cidade deve ser um menu de seleção inteligente ou campo de busca dinâmica (autocompletar), impedindo que o usuário digite um nome que não exista no banco de dados.

---

## 3. Estrutura de Carga de Dados (Seeding)

Como o Brasil possui **5.570 municípios**, o Antigravity deve ler e estruturar o banco para aceitar a carga de dados inicial baseada na API pública do IBGE ou arquivo estruturado.

### Exemplo de Estrutura de Inserção para o Sistema:
```json
[
  {"id": 3550308, "nome": "São Paulo", "uf": "SP"},
  {"id": 3304557, "nome": "Rio de Janeiro", "uf": "RJ"},
  {"id": 5300108, "nome": "Brasília", "df": "DF"},
  {"id": 3543402, "nome": "Ribeirão Preto", "uf": "SP"},
  {"id": 3106200, "nome": "Belo Horizonte", "uf": "MG"}
]
```

---

## 4. Instruções de Implementação para o Antigravity

- Crie uma rota de migração ou script de semente (`seed`) que consuma a API de Localidades do IBGE (`https://servicodados.ibge.gov.br/api/v1/localidades/municipios`) para popular automaticamente a tabela de Cidades na inicialização do sistema.
- Atualize a tela de CRUD de Clientes para renderizar a listagem de Cidades de forma otimizada usando paginação ou lazy loading no frontend.
