InvestCase - Sistema de Gestão para Escritórios de Investimento
É uma plataforma completa para a gestão de clientes e suas carteiras de investimentos. Desenvolvida com tecnologias modernas, a aplicação permite o cadastro de clientes, o registro de ativos financeiros (com busca em tempo real), o controle de alocações e o acompanhamento de movimentações financeiras como depósitos e retiradas.

✨ Funcionalidades
Dashboard Geral: Visão rápida com os principais indicadores do escritório.
Gestão de Clientes (CRM): Cadastro, ativação/inativação e exclusão de clientes.

Gestão de Ativos:

Busca de ativos em tempo real utilizando a API do Yahoo Finance (ações, FIIs, criptomoedas, etc.).
Cadastro automático dos ativos pesquisados no banco de dados.
Controle de Alocações: Associe ativos aos seus clientes, registrando quantidade, preço e data da compra.
Controle de Movimentações: Registre depósitos (entradas) e retiradas (saídas) para cada cliente.

Autenticação: Sistema de login seguro para acesso à plataforma.

🛠️ Tecnologias Utilizadas
O projeto é dividido em três componentes principais que operam de forma integrada através do Docker.

Frontend:

Framework: Next.js com React
Linguagem: TypeScript
Estilização: Tailwind CSS e shadcn/ui
Features: Roteamento, proxy de API para o backend.

Backend:

Framework: FastAPI
Linguagem: Python
Banco de Dados: PostgreSQL com SQLAlchemy (assíncrono)
Features: API RESTful, autenticação OAuth2, integração com Yahoo Finance.

Infraestrutura:

Containerização: Docker e Docker Compose

🚀 Como Executar o Projeto
Certifique-se de ter o Docker e o Docker Compose instalados em sua máquina.

Clone o repositório;
Suba os containers:
Execute o comando: docker-compose up --build

Acesse a aplicação:

Frontend: Abra seu navegador e acesse http://localhost:3000

Backend API (Swagger): Acesse http://localhost:8000/docs

Acesse o sistema:

Usuário: admin
Senha: admin123

Para parar a aplicação:
No terminal onde os containers estão rodando, pressione Ctrl + C.

📚 Documentação da API (Swagger)
URL do Swagger UI: http://localhost:8000/docs
