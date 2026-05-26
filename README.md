Autenticação Firebase

- Login e Cadastro: Tela dedicada em auth.html
- Autenticação segura: Integrada com Firebase Authentication
- Persistência de sessão: Mantém usuário logado entre sessões
- Logout: Botão de sair na navegação

Sistema de Reservas

- Formulário simples: Nome, telefone, data e hora
- Salvamento automático: Dados salvos no Firestore
- Validação: Campos obrigatórios

Segurança

- Autenticação obrigatória: Pedidos só podem ser finalizados por usuários logados
- Dados do usuário: Email e UID salvos com cada pedido
- Criptografia: Firebase cuida da segurança dos dados

Configuração Firebase

- pedidos: Armazena todos os pedidos de delivery
- usuarioId: ID do usuário
- usuarioEmail: Email do usuário
- itens: Array de produtos
- total: Valor total
- pagamento: Forma de pagamento
- status: Status do pedido
- criadoEm: Data/hora da criação
