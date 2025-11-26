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

### 2. **categories** - Categorias de Receitas e Despesas

```
categories/
  {categoryId}/
    - id: string
    - title: string
    - color: string (hexadecimal)
    - type: 'income' | 'expense'
    - userId: string (ID do usuário que criou)
    - createdAt: timestamp
    - updatedAt: timestamp
```

**Exemplo:**
```json
{
  "id": "user-1705320000-abc123",
  "title": "Aluguel",
  "color": "#FFE4E1",
  "type": "expense",
  "userId": "abc123",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Observações:**
- As categorias mockadas continuam sendo usadas
- Novas categorias são adicionadas aos mockados E salvos no Firestore
- O `type` diferencia entre categorias de receita ('income') e despesa ('expense')

---

### 3. **groups** - Grupos de Usuários

```
groups/
  {groupId}/
    - id: string
    - title: string
    - description: string (opcional)
    - members: Array<GroupMember>
    - isTemporary: boolean
    - userId: string (ID do usuário que criou o grupo)
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
  "userId": "abc123",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Observações:**
- Os grupos mockados continuam sendo usados
- Novos grupos são adicionados aos mockados E salvos no Firestore
- O usuário que cria o grupo é automaticamente adicionado como membro admin
- Todos os membros têm o `groupId` atualizado ao criar o grupo

---

## 🔄 Como Funciona a Integração com Mockados

### Comportamento Atual:

1. **Dados Mockados**: Continuam existindo e sendo usados
   - Categorias mockadas aparecem para todos
   - Grupos mockados aparecem para todos

2. **Novos Dados**: São salvos em dois lugares
   - **Firestore**: Para persistência permanente
   - **Arrays Mockados**: Para aparecerem imediatamente na sessão atual

3. **Carregamento**: 
   - Os dados mockados sempre são carregados
   - Futuramente, dados do Firestore também serão carregados e combinados

---

## 💡 Melhorias Implementadas na Estrutura

### ✅ Categorias:
- Adicionado campo `userId` para identificar o dono da categoria
- Adicionados timestamps `createdAt` e `updatedAt`
- Estrutura compatível com a interface `Category` existente

### ✅ Grupos:
- Adicionado campo `userId` para identificar o criador do grupo
- Usuário atual é automaticamente adicionado como admin ao criar
- Todos os membros têm `groupId` atualizado corretamente
- Adicionados timestamps `createdAt` e `updatedAt`

---

## 🎯 Próximos Passos (Futuro)

1. **Carregar dados do Firestore ao fazer login**
   - Combinar categorias mockadas + do Firestore
   - Combinar grupos mockados + do Firestore

2. **Implementar transações no Firestore**
   - Salvar transações por usuário
   - Filtrar por grupo

3. **Sincronização automática**
   - Atualizar dados quando houver mudanças
   - Sincronizar entre dispositivos

---

**Nota**: Por enquanto, os dados mockados continuam funcionando normalmente. Os novos dados criados serão salvos no Firestore E adicionados aos mockados para aparecerem imediatamente.

