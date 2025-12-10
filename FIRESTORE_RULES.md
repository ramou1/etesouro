# Regras de Segurança do Firestore

Para que a busca de usuários funcione corretamente, você precisa configurar as regras de segurança do Firestore no Firebase Console.

## Regras Necessárias

Acesse o Firebase Console → Firestore Database → Rules e adicione as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para a coleção de usuários (dados privados)
    match /users/{userId} {
      // Usuário pode ler e escrever apenas seus próprios dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Subcoleções do usuário
      match /groups/{groupId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /categories/{categoryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Coleção pública para busca de usuários (apenas nome e email)
    match /userSearch/{userId} {
      // Qualquer usuário autenticado pode ler (para busca)
      allow read: if request.auth != null;
      // Apenas o próprio usuário pode escrever/atualizar
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Coleção de convites de grupos
    match /groupInvites/{inviteId} {
      // Usuário pode ler apenas seus próprios convites (onde ele é o convidado)
      // Esta regra funciona para queries quando o campo 'invitedTo' corresponde ao userId
      allow read: if request.auth != null && 
                     resource.data.invitedTo == request.auth.uid;
      
      // Permitir criação de convites por usuários autenticados
      // Simplificado: qualquer usuário autenticado pode criar convites
      allow create: if request.auth != null;
      
      // Permitir atualização apenas pelo convidado e apenas para aceitar/recusar
      allow update: if request.auth != null && 
                     resource.data.invitedTo == request.auth.uid &&
                     request.resource.data.status in ['accepted', 'rejected'];
    }
  }
}
```

## Explicação

1. **Coleção `users`**: Dados privados do usuário. Apenas o próprio usuário pode acessar.
2. **Coleção `userSearch`**: Dados públicos (nome e email) para busca. Qualquer usuário autenticado pode ler, mas apenas o próprio usuário pode escrever.

## Importante

- A coleção `userSearch` é criada automaticamente quando um usuário se registra
- Ela contém apenas dados públicos (nome, email, id) para busca
- Dados sensíveis permanecem na coleção privada `users`
