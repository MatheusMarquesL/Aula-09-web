# Sistema Distribuído de Pedidos

## Visão geral

Sistema desenvolvido com três microsserviços independentes para gerenciamento de produtos, pedidos e notificações.

- **Catálogo/Estoque:** consulta produtos, cadastra produtos e controla reservas de estoque.
- **Pedidos:** cria pedidos, consulta registros e solicita reservas ao catálogo.
- **Notificações:** registra notificações relacionadas aos pedidos.

## Tecnologias

- Node.js
- Express
- TypeScript
- PostgreSQL 16
- Prisma ORM 6
- Docker e Docker Compose
- HTTP e Fetch API
- Thunder Client

## Arquitetura

| Serviço | Porta | Banco de dados |
|---|---:|---|
| Pedidos | 3000 | pedidos_db |
| Catálogo/Estoque | 3001 | catalogo_db |
| Notificações | 3002 | Memória |

Os serviços de Pedidos e Catálogo utilizam bancos PostgreSQL independentes. O serviço de Notificações mantém seus registros em memória.

## Configuração

### 1. Iniciar o PostgreSQL

Na pasta raiz do projeto:

```bash
docker compose up -d
```

O PostgreSQL utiliza a porta `5432` e um volume persistente chamado `postgres_data`.

Os bancos `catalogo_db` e `pedidos_db` são criados pelo arquivo `postgres/init/init.sql`.

### 2. Configurar as variáveis de ambiente

Em cada serviço, copie `.env.example` para `.env`.

Configure as conexões com os respectivos bancos:

- `catalogo-service`: banco `catalogo_db`.
- `pedidos-service`: banco `pedidos_db`.
- `notificacoes-service`: porta `3002`.

### 3. Instalar dependências e preparar o Prisma

Execute em `catalogo-service` e `pedidos-service`:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

### 4. Executar os serviços

Em terminais separados, entre em cada pasta e execute:

```bash
npm run dev
```

Para compilar cada serviço:

```bash
npm run build
```

## Endpoints HTTP

### Catálogo/Estoque — porta 3001

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/produtos` | Lista produtos |
| GET | `/produtos/:id` | Consulta produto |
| POST | `/produtos` | Cadastra produto |
| POST | `/produtos/:id/reservas` | Reserva estoque |

### Pedidos — porta 3000

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/pedidos` | Lista pedidos |
| GET | `/pedidos/:id` | Consulta pedido |
| POST | `/pedidos` | Cria pedido |

### Notificações — porta 3002

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/notificacoes` | Lista notificações |
| POST | `/notificacoes` | Registra notificação |

## Comunicação entre serviços

Ao receber um pedido, o serviço de Pedidos:

1. Valida os dados recebidos.
2. Solicita ao Catálogo a reserva do estoque.
3. Calcula o valor total utilizando o preço retornado pelo Catálogo.
4. Registra o pedido no PostgreSQL.
5. Solicita o registro de uma notificação.
6. Atualiza o status da notificação quando o registro é realizado com sucesso.

As requisições utilizam o cabeçalho `x-correlation-id` para acompanhar a comunicação entre os serviços.

## Tratamento de falhas

O sistema trata situações como:

- Dados inválidos: HTTP 400.
- Produto ou pedido inexistente: HTTP 404.
- Estoque insuficiente: HTTP 409.
- Timeout de comunicação: HTTP 504.
- Falha de comunicação com o Catálogo: HTTP 502.
- Falha no registro de notificação: pedido permanece registrado com notificação pendente.

## Testes realizados

Os testes foram realizados utilizando o Thunder Client, verificando:

- Consulta e cadastro de produtos.
- Reserva de estoque e estoque insuficiente.
- Criação e consulta de pedidos.
- Validação de dados inválidos.
- Produto inexistente.
- Comunicação entre os microsserviços.
- Falhas de comunicação e notificações pendentes.
- Identificação de requisições por `correlation-id`.
- Persistência de produtos e pedidos no PostgreSQL.
- Persistência dos dados após reinicialização dos serviços.

## Persistência

Os dados de produtos e pedidos são armazenados no PostgreSQL utilizando Prisma ORM.

O Docker utiliza volume persistente para manter os dados do banco mesmo após a reinicialização do contêiner.

As notificações são armazenadas em memória e não permanecem disponíveis após reiniciar o serviço.