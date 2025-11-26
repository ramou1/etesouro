// Serviço de autenticação do Firebase
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from './config';
import { saveUserData } from './user';

export interface AuthError {
  code: string;
  message: string;
}

// Converter erro do Firebase para mensagem amigável em português
const getErrorMessage = (error: any): string => {
  // Extrair o código do erro, mesmo se vier em formato diferente
  let code = error.code;
  
  // Se não tiver code, tentar extrair da mensagem
  if (!code && error.message) {
    const match = error.message.match(/\(([^)]+)\)/);
    if (match) {
      code = match[1];
    }
  }
  
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este email já está em uso';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/invalid-credential':
      return 'Email ou senha incorretos';
    case 'auth/user-not-found':
      return 'Email ou senha incorretos';
    case 'auth/wrong-password':
      return 'Email ou senha incorretos';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida';
    case 'auth/weak-password':
      return 'A senha é muito fraca';
    case 'auth/user-disabled':
      return 'Esta conta foi desabilitada';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet';
    default:
      // Se não encontrar código específico, retornar mensagem genérica
      if (error.message && error.message.includes('invalid-credential')) {
        return 'Email ou senha incorretos';
      }
      return 'Erro ao fazer login. Verifique suas credenciais.';
  }
};

// Registrar novo usuário
export const registerWithEmail = async (
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> => {
  if (!auth) {
    return {
      success: false,
      error: 'Firebase não está configurado. Configure as variáveis de ambiente.',
    };
  }

  try {
    // Criar usuário
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Atualizar perfil com o nome
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Salvar dados do usuário no Firestore
      await saveUserData({
        id: userCredential.user.uid,
        name: name,
        email: email,
        avatar: userCredential.user.photoURL || undefined,
      });
    }

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// Fazer login
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> => {
  if (!auth) {
    return {
      success: false,
      error: 'Firebase não está configurado. Configure as variáveis de ambiente.',
    };
  }

  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// Fazer logout
export const signOut = async (): Promise<void> => {
  if (!auth) {
    console.warn('Firebase não está configurado. Não é possível fazer logout.');
    return;
  }

  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

