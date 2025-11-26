# 🔥 Configuração do Firebase - Passo a Passo

Este guia vai te ajudar a configurar o Firebase Authentication no projeto e-Tesouro.

## 📋 Pré-requisitos

- Conta no Google (para acessar o Firebase Console)
- Projeto criado no Firebase

---

## 🚀 Passo 1: Criar Projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Preencha o nome do projeto (ex: `e-tesouro`)
4. Clique em **"Continuar"**
5. Desative o Google Analytics (opcional) e clique em **"Criar projeto"**
6. Aguarde a criação e clique em **"Continuar"**

---

## 🔐 Passo 2: Habilitar Authentication

1. No menu lateral do Firebase Console, clique em **"Authentication"** (Autenticação)
2. Clique em **"Começar"** ou **"Get started"**
3. Na aba **"Sign-in method"** (Métodos de login), clique em **"Email/Password"**
4. Ative a opção **"Email/Password"** (primeiro switch)
5. Clique em **"Salvar"**

---

## 🔑 Passo 3: Obter Credenciais do Firebase

1. No Firebase Console, clique no ícone de **⚙️ Configurações** (Settings) no canto superior esquerdo
2. Clique em **"Configurações do projeto"** ou **"Project settings"**
3. Role até a seção **"Seus apps"** ou **"Your apps"**
4. Se ainda não tiver um app, clique em **"</>"** (ícone de web) para adicionar um app web
5. Preencha um nome para o app (ex: `e-tesouro-web`)
6. **NÃO marque** a opção "Também configure o Firebase Hosting"
7. Clique em **"Registrar app"**
8. Você verá um objeto de configuração parecido com:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## 📝 Passo 4: Configurar Variáveis de Ambiente

1. Na raiz do projeto, crie um arquivo chamado **`.env.local`**
2. Copie o conteúdo abaixo e preencha com suas credenciais:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

3. Substitua os valores pelas informações do seu projeto Firebase (obtidas no Passo 3)

⚠️ **IMPORTANTE**: 
- O arquivo `.env.local` já está no `.gitignore`, então não será commitado
- Nunca compartilhe essas credenciais publicamente
- Use variáveis `NEXT_PUBLIC_` para que fiquem disponíveis no cliente

---

## ✅ Passo 5: Verificar Instalação

1. Certifique-se de que o Firebase foi instalado:
   ```bash
   npm install firebase
   ```

2. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Teste o cadastro:
   - Acesse a página de registro
   - Crie uma conta com email e senha
   - Verifique no Firebase Console > Authentication se o usuário foi criado

4. Teste o login:
   - Faça logout
   - Faça login com as credenciais criadas
   - Verifique se o login funciona corretamente

---

## 🔍 Verificando no Firebase Console

Após criar contas, você pode verificar os usuários em:
- **Firebase Console** > **Authentication** > **Users**

Lá você verá todos os usuários cadastrados com:
- Email
- UID (ID único do usuário)
- Data de criação
- Último login

---

## 📌 Notas Importantes

- **Dados Internos**: Por enquanto, os dados financeiros (transações, grupos, etc.) continuam sendo os mesmos para todos os usuários (mockados). Isso será implementado posteriormente.
- **Segurança**: As regras do Firestore ainda precisarão ser configuradas quando começarmos a salvar dados no banco.
- **Erros Comuns**: 
  - Se aparecer erro de "Firebase App not initialized", verifique se as variáveis de ambiente estão corretas
  - Se o login não funcionar, verifique se o Email/Password está habilitado no Firebase Console

---

## 💾 Habilitar Firestore Database

Para salvar os dados dos usuários, você precisa habilitar o Firestore:

1. No Firebase Console, vá para **"Firestore Database"** no menu lateral
2. Clique em **"Criar banco de dados"** ou **"Create database"**
3. Escolha o modo:
   - **Modo de produção**: Mais seguro, mas requer regras configuradas
   - **Modo de teste**: Permite leitura/escrita por 30 dias (recomendado para começar)
4. Escolha a localização do banco (ex: `us-central`)
5. Clique em **"Ativar"** ou **"Enable"**

### Regras de Segurança

No modo de teste, as regras padrão permitem leitura/escrita por 30 dias. **Recomendamos configurar as regras adequadas imediatamente!**

**📋 Veja o arquivo `FIRESTORE_RULES.md` para as regras recomendadas e como configurá-las.**

**⚠️ IMPORTANTE**: As regras padrão do modo de teste permitem qualquer pessoa ler/escrever dados. Configure as regras adequadas para proteger os dados dos usuários!

### 📝 Estrutura dos Dados no Firestore

Os dados dos usuários serão salvos automaticamente na coleção `users` com a seguinte estrutura:

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

## 🎯 Próximos Passos (Futuro)

1. ✅ Implementar Firestore para salvar dados dos usuários (CONCLUÍDO!)
2. Criar regras de segurança do Firestore
3. Implementar sincronização de dados financeiros por usuário
4. Adicionar mais métodos de autenticação (Google, etc.)

---

**Pronto!** Agora o Firebase Authentication e Firestore estão configurados! Os dados dos usuários serão salvos automaticamente quando eles se registrarem. 🎉
