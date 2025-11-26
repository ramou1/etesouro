# 🔒 Regras do Firestore - Configuração Simplificada (MVP)

## 📝 Regras Simples para MVP

Cole estas regras no Firebase Console (Firestore Database → Regras):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuários e suas subcoleções
    match /users/{userId} {
      // Usuário só acessa seus próprios dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Categorias do usuário (subcoleção)
      match /categories/{categoryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Grupos do usuário (subcoleção)
      match /groups/{groupId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Transações do usuário (subcoleção)
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 📝 Como Aplicar

1. Firebase Console → **Firestore Database** → aba **"Regras"**
2. Cole as regras acima
3. Clique em **"Publicar"**

**Pronto!** Regras simples e funcionais para MVP. ✅
