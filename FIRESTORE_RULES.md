# Regras de Segurança do Firestore

Para que a busca de usuários funcione corretamente, você precisa configurar as regras de segurança do Firestore no Firebase Console.

## Regras Necessárias

Acesse o Firebase Console → Firestore Database → Rules e adicione as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========== FUNÇÕES AUXILIARES ==========
    
    // Verifica se o usuário é membro de um grupo
    // Verifica se existe referência em groupMemberships (mais eficiente e confiável)
    function isGroupMember(groupId) {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)/groupMemberships/$(groupId));
    }
    
    // ========== COLEÇÃO DE GRUPOS (RAIZ) ==========
    
    // Grupos são salvos na raiz para sincronização entre membros
    match /groups/{groupId} {
      // Qualquer usuário autenticado pode criar grupos
      allow create: if request.auth != null;
      
      // Para ler/atualizar/deletar, verifica se é membro do grupo
      // Verifica se existe referência em groupMemberships
      allow read: if request.auth != null && isGroupMember(groupId);
      allow update: if request.auth != null && isGroupMember(groupId);
      allow delete: if request.auth != null && isGroupMember(groupId);
      
      // Subcoleção de limites de orçamento
      match /budgetLimits/{limitId} {
        // Membros do grupo podem ler e escrever limites
        allow read, write: if request.auth != null && isGroupMember(groupId);
      }
      
      // Subcoleção de transações do grupo
      match /transactions/{transactionId} {
        // Membros do grupo podem ler e escrever transações
        allow read, write: if request.auth != null && isGroupMember(groupId);
      }
    }
    
    // ========== COLEÇÃO DE USUÁRIOS ==========
    
    match /users/{userId} {
      // Usuário pode ler e escrever apenas seus próprios dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Subcoleção de referências de grupos (groupMemberships)
      match /groupMemberships/{groupId} {
        // Usuário pode ler e escrever apenas suas próprias referências
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Subcoleção de categorias
      match /categories/{categoryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Subcoleção de transações
      match /transactions/{transactionId} {
        // Usuário pode ler e escrever suas próprias transações
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // ========== COLEÇÃO PÚBLICA PARA BUSCA DE USUÁRIOS ==========
    
    match /userSearch/{userId} {
      // Qualquer usuário autenticado pode ler (para busca)
      allow read: if request.auth != null;
      // Apenas o próprio usuário pode escrever/atualizar
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ========== COLEÇÃO DE CONVITES DE GRUPOS ==========
    
    match /groupInvites/{inviteId} {
      // Usuário pode ler apenas seus próprios convites (onde ele é o convidado)
      // Permite tanto leitura individual quanto queries
      allow read: if request.auth != null && 
                     (resource == null || resource.data.invitedTo == request.auth.uid);
      
      // Permitir criação de convites por usuários autenticados
      // Qualquer usuário autenticado pode criar convites para outros usuários
      allow create: if request.auth != null;
      
      // Permitir atualização apenas pelo convidado e apenas para aceitar/recusar
      allow update: if request.auth != null && 
                     resource.data.invitedTo == request.auth.uid &&
                     request.resource.data.status in ['accepted', 'rejected'];
    }
  }
}
```

## Explicação das Regras

### 1. **Coleção `groups` (Raiz)**
   - Grupos são salvos na raiz (`groups/{groupId}`) para sincronização entre membros
   - Apenas membros do grupo (com referência em `groupMemberships`) podem ler/escrever
   - Permite criar, atualizar e deletar grupos para membros

### 2. **Subcoleção `budgetLimits`**
   - Limites de orçamento ficam em `groups/{groupId}/budgetLimits/{limitId}`
   - Membros do grupo podem ler e escrever limites

### 3. **Coleção `users`**
   - Dados privados do usuário. Apenas o próprio usuário pode acessar.
   - Subcoleções:
     - `groupMemberships`: Referências aos grupos que o usuário pertence
     - `categories`: Categorias de receitas/despesas do usuário
     - `transactions`: Transações do usuário

### 4. **Coleção `userSearch`**
   - Dados públicos (nome e email) para busca
   - Qualquer usuário autenticado pode ler, mas apenas o próprio usuário pode escrever

### 5. **Coleção `groupInvites`**
   - Convites para grupos
   - Usuários podem ler apenas seus próprios convites
   - Qualquer usuário autenticado pode criar convites
   - Apenas o convidado pode aceitar/recusar

## Funções Auxiliares

- `isGroupMember(groupId)`: Verifica se o usuário tem referência do grupo em `users/{userId}/groupMemberships/{groupId}`
- Essa função garante que apenas membros do grupo (com referência criada) possam acessar dados do grupo
- A referência é criada automaticamente quando o usuário aceita um convite ou é adicionado ao grupo

## Importante

- **Grupos na raiz**: Grupos agora são salvos em `groups/{groupId}` para sincronização entre membros
- **Referências**: Cada usuário tem referências em `users/{userId}/groupMemberships/{groupId}`
- **Sincronização**: Transações e limites são sincronizados automaticamente para todos os membros
- A coleção `userSearch` é criada automaticamente quando um usuário se registra
- Ela contém apenas dados públicos (nome, email, id) para busca
- Dados sensíveis permanecem na coleção privada `users`

## ⚠️ Nota sobre Performance

As funções `isGroupMember()` fazem uma leitura adicional do Firestore para verificar a referência. 
Para melhor performance em produção, considere:
- Usar Cloud Functions para validações mais complexas
- Implementar cache de membros do grupo
- Usar regras mais específicas baseadas em dados do grupo em vez de verificar referências
