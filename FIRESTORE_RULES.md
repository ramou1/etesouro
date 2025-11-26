# 🔒 Regras do Firestore - Configuração Simplificada (MVP)

## 📝 Regras Simples para MVP

Cole estas regras no Firebase Console (Firestore Database → Regras):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuários: apenas o próprio usuário
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Categorias: usuário só acessa as suas
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == request.resource.data.userId);
    }
    
    // Grupos: usuário só acessa os seus
    match /groups/{groupId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == request.resource.data.userId);
    }
  }
}
```

## 📝 Como Aplicar

1. Firebase Console → **Firestore Database** → aba **"Regras"**
2. Cole as regras acima
3. Clique em **"Publicar"**

**Pronto!** Regras simples e funcionais para MVP. ✅
