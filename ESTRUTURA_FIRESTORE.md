# 📊 Estrutura de Dados no Firestore

Este documento descreve a estrutura dos dados salvos no Firestore para o projeto e-Tesouro.

## 🗂️ Coleções do Firestore

### 1. **users** - Dados dos Usuários

```
users/
  {userId}/
    - id: string
    - name: string
    - email: string
    - avatar: string (opcional)
    - createdAt: timestamp
    - updatedAt: timestamp
```

**Exemplo:**
```json
{
  "id": "abc123",
  "name": "João Silva",
  "email": "joao@email.com",
  "avatar": "https://...",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### 2. **categories** - Categorias de Receitas e Despesas (Subcoleção do usuário)

```
users/
  {userId}/
    categories/
      {categoryId}/
        - id: string
        - title: string
        - color: string (hexadecimal)
        - type: 'income' | 'expense'
        - createdAt: timestamp
        - updatedAt: timestamp
```

**Exemplo:**
```
users/abc123/categories/cat-1705320000-xyz789
```
```json
{
  "id": "cat-1705320000-xyz789",
  "title": "Aluguel",
  "color": "#FFE4E1",
  "type": "expense",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Observações:**
- As categorias são subcoleções dentro do documento do usuário
- Não precisa mais do campo `userId` pois já está implícito no caminho
- As categorias mockadas continuam sendo usadas
- Novas categorias são adicionadas aos mockados E salvos no Firestore
- O `type` diferencia entre categorias de receita ('income') e despesa ('expense')
- **Benefício**: Consultas mais rápidas, pois busca diretamente na subcoleção do usuário

---

### 3. **groups** - Grupos de Usuários (Subcoleção do usuário)

```
users/
  {userId}/
    groups/
      {groupId}/
        - id: string
        - title: string
        - description: string (opcional)
        - members: Array<GroupMember>
        - isTemporary: boolean
        - createdAt: timestamp
        - updatedAt: timestamp
```

**Estrutura de GroupMember:**
```typescript
{
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  contributesIncome: boolean;
  groupId: string;
}
```

**Exemplo:**
```
users/abc123/groups/group-1705320000-xyz789
```
```json
{
  "id": "group-1705320000-xyz789",
  "title": "Família",
  "description": "Grupo familiar principal",
  "isTemporary": false,
  "members": [
    {
      "id": "abc123",
      "name": "João Silva",
      "email": "joao@email.com",
      "avatar": "https://...",
      "isAdmin": true,
      "contributesIncome": true,
      "groupId": "group-1705320000-xyz789"
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Observações:**
- Os grupos são subcoleções dentro do documento do usuário
- Não precisa mais do campo `userId` pois já está implícito no caminho
- Os grupos mockados continuam sendo usados
- Novos grupos são adicionados aos mockados E salvos no Firestore
- O usuário que cria o grupo é automaticamente adicionado como membro admin
- Todos os membros têm o `groupId` atualizado ao criar o grupo
- **Benefício**: Consultas mais rápidas, pois busca diretamente na subcoleção do usuário

---

### 4. **transactions** - Transações de Receitas e Despesas (Subcoleção do usuário)

```
users/
  {userId}/
    transactions/
      {transactionId}/
        - id: string
        - type: 'income' | 'expense'
        - amount: number
        - description: string
        - category: string
        - date: timestamp
        - groupId: string
        - userId: string
        - receipt: string (opcional)
        - responsible: GroupMember
        - createdAt: timestamp
        - updatedAt: timestamp
```

**Exemplo:**
```
users/abc123/transactions/trans-1705320000-xyz789
```
```json
{
  "id": "trans-1705320000-xyz789",
  "type": "expense",
  "amount": 800,
  "description": "Supermercado",
  "category": "Alimentação",
  "date": "2024-01-15T10:30:00Z",
  "groupId": "1",
  "userId": "abc123",
  "receipt": "https://...",
  "responsible": {
    "id": "abc123",
    "name": "João Silva",
    "email": "joao@email.com",
    "avatar": "https://...",
    "isAdmin": true,
    "contributesIncome": true,
    "groupId": "1"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Observações:**
- As transações são subcoleções dentro do documento do usuário
- Cada transação está associada a um grupo (`groupId`)
- O campo `responsible` contém informações do membro responsável pela transação
- As transações mockadas continuam sendo usadas
- Novas transações são adicionadas aos mockados E salvos no Firestore
- **Benefício**: Consultas mais rápidas e filtros por grupo facilitados

---

## 🔄 Como Funciona a Integração com Mockados

### Comportamento Atual:

1. **Dados Mockados**: Continuam existindo e sendo usados
   - Categorias mockadas aparecem para todos
   - Grupos mockados aparecem para todos
   - Transações mockadas aparecem para todos

2. **Novos Dados**: São salvos em dois lugares
   - **Firestore**: Para persistência permanente
   - **Dados locais**: Para aparecerem imediatamente na sessão atual

3. **Carregamento**: 
   - Os dados mockados sempre são carregados
   - Dados do Firestore são carregados e combinados com os mockados
   - Transações são filtradas por grupo ativo

---

## 💡 Melhorias Implementadas na Estrutura

### ✅ Estrutura com Subcoleções (Otimizada para MVP):
- **Categorias** e **Grupos** agora são subcoleções dentro de cada usuário
- **Benefícios**:
  - ✅ Consultas mais rápidas (busca direta na subcoleção do usuário)
  - ✅ Melhor organização dos dados
  - ✅ Escalabilidade melhorada
  - ✅ Regras de segurança mais simples
  - ✅ Não precisa mais do campo `userId` (implícito no caminho)

### ✅ Categorias:
- Subcoleção: `users/{userId}/categories/{categoryId}`
- Adicionados timestamps `createdAt` e `updatedAt`
- Estrutura compatível com a interface `Category` existente

### ✅ Grupos:
- Subcoleção: `users/{userId}/groups/{groupId}`
- Usuário atual é automaticamente adicionado como admin ao criar
- Todos os membros têm `groupId` atualizado corretamente
- Adicionados timestamps `createdAt` e `updatedAt`

### ✅ Transações:
- Subcoleção: `users/{userId}/transactions/{transactionId}`
- Cada transação está associada a um grupo específico
- Carregamento automático quando o grupo ativo muda
- As transações mockadas continuam funcionando e são combinadas com as do Firestore
- Adicionados timestamps `createdAt` e `updatedAt`

---

**Nota**: Os dados mockados continuam funcionando normalmente. Os novos dados criados são salvos no Firestore E aparecem imediatamente na interface.

