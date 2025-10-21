# eTE$OURO - Controle Financeiro

Um aplicativo web para controle de finanças pessoais focado em evitar endividamento. Desenvolvido com React + Next.js e otimizado para dispositivos móveis.

## 🚀 Funcionalidades

- **Autenticação**: Sistema de login e cadastro
- **Controle de Receitas**: Adicione entradas de dinheiro com descrição
- **Controle de Despesas**: Registre saídas de dinheiro
- **Saldo Automático**: Cálculo automático do saldo (receitas - despesas)
- **Interface Mobile**: Design responsivo otimizado para celulares
- **Persistência Local**: Dados salvos no navegador
- **Dados Mock**: 18 transações de exemplo para teste (R$ 8.500 receitas, R$ 7.200 despesas)
- **Logo Personalizada**: Identidade visual própria
- **Avatares Reais**: Imagens de pessoas reais do Unsplash
- **Fonte Elegante**: Tipografia Inter para melhor legibilidade
- **Lista de Transações**: Visualização das transações recentes com clique para detalhes
- **Modal de Detalhes**: Informações completas de cada transação
- **Total Fixo**: Saldo sempre visível na parte inferior com efeito blur moderno

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Context API** - Gerenciamento de estado

## 📱 Layout Mobile

O aplicativo foi projetado com foco mobile, incluindo:

- Tela de login/cadastro com design moderno e logo personalizada
- Interface principal ocupando toda a altura da tela
- Duas colunas centralizadas (receitas/despesas) com valores em tamanho adequado
- Linha divisória alta para melhor separação visual
- Lista de transações recentes com design glassmorphism
- Saldo fixo na parte inferior com efeito blur moderno
- Seção de avatares com pessoas reais do Unsplash
- Botões + e - integrados nas colunas com tamanho otimizado
- Navegação inferior apenas com ícones (design minimalista)
- Modal de detalhes com informações completas das transações
- Cores douradas seguindo o tema "tesouro"

## 🎨 Design

- **Cores principais**: Dourado (#FCD34D) e Verde (#10B981)
- **Tipografia**: Fonte Inter para melhor legibilidade e elegância
- **Layout**: Mobile-first com responsividade
- **Ícones**: Lucide React para consistência visual
- **Imagens**: Avatares reais do Unsplash para autenticidade

## 🚀 Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar em modo desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Abrir no navegador**:
   ```
   http://localhost:3000
   ```

## 📋 Como Usar

1. **Primeiro acesso**: Crie uma conta ou faça login
2. **Adicionar receita**: Clique no botão "+" e preencha o valor
3. **Adicionar despesa**: Clique no botão "-" e preencha o valor
4. **Visualizar saldo**: O saldo aparece automaticamente no centro
5. **Filtros**: Os avatares na parte inferior são para futuras funcionalidades

## 🔧 Estrutura do Projeto

```
src/
├── app/                 # Páginas Next.js
├── components/          # Componentes React
│   ├── AuthPage.tsx     # Página de autenticação
│   ├── LoginForm.tsx    # Formulário de login
│   ├── RegisterForm.tsx # Formulário de cadastro
│   ├── MainApp.tsx      # Aplicação principal
│   └── TransactionModal.tsx # Modal para transações
├── context/             # Context API
│   └── AppContext.tsx   # Estado global
├── lib/                 # Utilitários
│   └── utils.ts         # Funções auxiliares
└── types/               # Definições TypeScript
    └── index.ts         # Interfaces e tipos
```

## 💾 Armazenamento

Os dados são salvos localmente no navegador usando `localStorage`:
- Informações do usuário
- Transações financeiras
- Cálculos de saldo

## 🔮 Próximas Funcionalidades

- [ ] Relatórios e gráficos
- [ ] Categorias de transações
- [ ] Filtros por período
- [ ] Exportação de dados
- [ ] Notificações de gastos
- [ ] Metas financeiras

## 📄 Licença

Este projeto é de uso educacional e pessoal.

---

**Desenvolvido com ❤️ para controle financeiro pessoal**