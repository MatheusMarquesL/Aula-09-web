
# Sistema Distribuído de Pedidos

## Visão geral

Sistema composto por três microsserviços independentes:
Catálogo/Estoque, Pedidos e Notificações.

## Tecnologias

- Node.js
- Express
- TypeScript
- HTTP e fetch
- Thunder Client para testes

## Portas

- Pedidos: 3000
- Catálogo/Estoque: 3001
- Notificações: 3002

## Configuração

Instale as dependências em cada pasta com:

npm install

Copie os arquivos .env.example para .env
e confira as variáveis de ambiente.

## Execução

Inicie cada serviço em um terminal separado,
usando npm run dev dentro da respectiva pasta.

## Contratos HTTP

Documente os endpoints, os corpos das
requisições, as respostas e os status HTTP.

## Tratamento de falhas

Documente os cenários de timeout, serviços
indisponíveis, estoque insuficiente e falha
de notificação.

## Testes

Registre os testes realizados e seus resultados.
