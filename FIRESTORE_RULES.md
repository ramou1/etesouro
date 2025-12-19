# Regras de Segurança do Firestore (MVP - Simplificadas)

Para que o sistema funcione corretamente, você precisa configurar as regras de segurança do Firestore no Firebase Console.

## Regras Necessárias

Acesse o Firebase Console → Firestore Database → Rules e adicione as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========== COLEÇÃO DE GRUPOS ==========
    // Para MVP: Qualquer usuário autenticado pode ler/escrever grupos
    // O controle de acesso é feito no código da aplicação
    match /groups/{groupId} {
      allow read, write: if request.auth != null;
      
      // Subcoleções do grupo
      match /budgetLimits/{limitId} {
        allow read, write: if request.auth != null;
      }
      
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // ========== COLEÇÃO DE USUÁRIOS ==========
    // Cada usuário só acessa seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Subcoleções do usuário
      match /groupMemberships/{groupId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /categories/{categoryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // ========== BUSCA DE USUÁRIOS ==========
    // Público para busca, mas só o próprio usuário pode escrever
    match /userSearch/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ========== CONVITES DE GRUPOS ==========
    // Para MVP: Qualquer usuário autenticado pode ler convites (simplificado)
    // Usuários podem deletar seus próprios convites (ao aceitar/recusar)
    match /groupInvites/{inviteId} {
      // Permitir leitura para qualquer usuário autenticado (MVP simplificado)
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                     resource.data.invitedTo == request.auth.uid;
      allow delete: if request.auth != null && 
                     resource.data.invitedTo == request.auth.uid;
    }
  }
}
```

## Explicação Simplificada

### 1. **Grupos (`groups`)**
   - Qualquer usuário autenticado pode ler e escrever grupos
   - O controle de acesso (quem pode ver o quê) é feito no código da aplicação
   - Subcoleções (limites e transações) seguem a mesma regra

### 2. **Usuários (`users`)**
   - Cada usuário só acessa seus próprios dados
   - Subcoleções (categorias, referências de grupos, transações pessoais) são privadas

### 3. **Busca de Usuários (`userSearch`)**
   - Qualquer usuário autenticado pode ler (para buscar outros usuários)
   - Apenas o próprio usuário pode escrever/atualizar seus dados públicos

### 4. **Convites (`groupInvites`)**
   - Usuários podem ler apenas seus próprios convites
   - Qualquer usuário autenticado pode criar convites
   - Apenas o convidado pode atualizar (aceitar/recusar)

## Importante para MVP

- **Regras simplificadas**: Para um MVP, as regras são mais permissivas
- **Controle no código**: O controle de acesso real é feito no código da aplicação
- **Segurança básica**: Mantém proteção contra acesso não autenticado e dados privados
- **Fácil de entender**: Sem funções complexas ou verificações aninhadas

## Quando Evoluir (Pós-MVP)

Se o projeto crescer, você pode adicionar:
- Verificação de membros do grupo nas regras
- Validação de dados mais rigorosa
- Cloud Functions para operações sensíveis
- Auditoria e logs de acesso
