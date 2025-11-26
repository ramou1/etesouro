# 🔒 Regras do Firestore - Configuração

Este documento explica como configurar as regras de segurança do Firestore.

## 📍 Como Acessar as Regras

1. No Firebase Console, vá para **"Firestore Database"**
2. Clique na aba **"Regras"** (Rules) no topo
3. Você verá um editor de código com as regras atuais

## ⚙️ Regras Recomendadas para o Projeto e-Tesouro

Substitua o conteúdo do editor pelas seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para a coleção de usuários
    match /users/{userId} {
      // Permite leitura e escrita apenas se o usuário estiver autenticado
      // e o ID do documento corresponder ao ID do usuário autenticado
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regras para transações (quando implementar)
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Regras para grupos (quando implementar)
    match /groups/{groupId} {
      allow read: if request.auth != null 
        && request.auth.uid in resource.data.memberIds;
      allow write: if request.auth != null 
        && request.auth.uid == resource.data.ownerId;
    }
    
    // Bloqueia tudo mais por padrão
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🔐 Regras Explicadas

### Coleção `users`:
- ✅ Usuários autenticados podem ler/escrever apenas seus próprios dados
- ❌ Usuários não podem acessar dados de outros usuários

### Coleção `transactions` (futuro):
- ✅ Usuários podem ler/escrever apenas transações onde eles são os donos
- ❌ Usuários não podem ver transações de outros

### Coleção `groups` (futuro):
- ✅ Usuários podem ler grupos onde são membros
- ✅ Apenas o dono pode escrever no grupo

## 📝 Como Aplicar as Regras

1. Copie as regras acima
2. Cole no editor de regras do Firebase Console
3. Clique em **"Publicar"** (Publish)
4. Aguarde a confirmação de publicação

## ⚠️ Importante

- **Não deixe regras permissivas em produção!**
- Teste sempre as regras após publicá-las
- O modo de teste expira após 30 dias, então configure as regras antes disso

## 🧪 Testar as Regras

Após configurar, teste criando um usuário e verificando:
- ✅ O usuário consegue criar seus próprios dados
- ❌ O usuário não consegue acessar dados de outros

---

**Dica**: As regras são aplicadas imediatamente após publicação, então tenha cuidado ao testar em produção!

