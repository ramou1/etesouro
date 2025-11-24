# eTE$OURO - Controle Financeiro

Um aplicativo web para controle de finanças pessoais focado em evitar endividamento. Desenvolvido com React + Next.js e otimizado para dispositivos móveis.

## 🚀 Funcionalidades

- **Autenticação**: Sistema de login e cadastro
- **Dashboard Principal**: Visão geral com valores clicáveis para navegação
- **Controle de Receitas**: Adicione entradas de dinheiro com categorias
- **Controle de Despesas**: Registre saídas de dinheiro com categorias
- **Categorização**: Sistema completo de categorias para receitas e despesas
- **Grupos**: Gerenciamento de grupos familiares e de viagem
- **Configurações**: Página completa com todas as configurações
- **Relatórios**: Análise financeira com estatísticas detalhadas e gráficos interativos
- **Saldo Automático**: Cálculo automático do saldo (receitas - despesas)
- **Interface Mobile**: Design responsivo otimizado para celulares
- **Dados Centralizados**: Sistema de dados mockados para desenvolvimento
- **Navegação Intuitiva**: Bottom tabs com navegação fluida
- **Modal de Transações**: Adição de transações com seleção de categorias
- **Histórico Detalhado**: Visualização completa com categorias por transação

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Recharts** - Biblioteca de gráficos e visualizações
- **Context API** - Gerenciamento de estado

## 📱 Layout Mobile

O aplicativo foi projetado com foco mobile, incluindo:

- Dashboard com valores clicáveis para navegação rápida
- Páginas específicas para receitas e despesas
- Sistema de categorias com cores diferenciadas
- Configurações organizadas em abas
- Relatórios com análise visual
- Navegação inferior com ícones intuitivos
- Design responsivo e moderno

## 🎨 Design

- **Cor principal**: Dourado (#FCD34D)
- **Tipografia**: Fonte Inter para melhor legibilidade e elegância
- **Layout**: Mobile-first com responsividade
- **Ícones**: Lucide React para consistência visual

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
2. **Dashboard**: Visualize resumo financeiro e navegue pelos valores
3. **Adicionar transação**: Use os botões + e - ou navegue pelas páginas específicas
4. **Categorizar**: Selecione categorias ao adicionar transações
5. **Configurar**: Acesse configurações para gerenciar grupos e categorias
6. **Relatórios**: Visualize análises detalhadas na página de relatórios

## 🔧 Estrutura do Projeto

```
src/
├── app/                    # Páginas Next.js
│   ├── (auth)/            # Páginas de autenticação
│   │   ├── login/         # Página de login
│   │   └── register/      # Página de cadastro
│   ├── analytics/         # Página de relatórios
│   ├── dashboard/         # Dashboard principal
│   ├── expense/           # Página de despesas
│   ├── income/            # Página de receitas
│   ├── settings/          # Página de configurações
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── BottomTabs.tsx     # Navegação inferior
│   ├── Header.tsx         # Cabeçalho
│   ├── NewGroupModal.tsx  # Modal de novo grupo
│   ├── Participants.tsx  # Componente de participantes
│   ├── TransactionDetailsModal.tsx # Modal de detalhes
│   ├── TransactionList.tsx # Lista de transações
│   └── TransactionModal.tsx # Modal para transações
├── context/               # Context API
│   └── AppContext.tsx     # Estado global
├── data/                  # Dados mockados
│   └── mockData.ts        # Dados centralizados
├── lib/                   # Utilitários
│   └── utils.ts           # Funções auxiliares
└── types/                 # Definições TypeScript
    └── index.ts           # Interfaces e tipos
```

## 🔮 Próximas Funcionalidades

- [x] Gráficos de pizza para comparação de receitas e despesas
- [ ] Relatórios e gráficos avançados
- [ ] Filtros por período
- [ ] Exportação de dados
- [ ] Notificações de gastos
- [ ] Metas financeiras
- [ ] Relatórios por categoria