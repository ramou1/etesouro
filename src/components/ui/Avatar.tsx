'use client';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
  bgColor?: string;
  textColor?: string;
}

// Função para extrair iniciais do nome
const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  
  if (parts.length >= 2) {
    // Se tem sobrenome, pega primeira letra do nome e primeira do sobrenome
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1) {
    // Se tem apenas um nome, pega as duas primeiras letras
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return '?';
};

// Função para gerar cor de fundo baseada no nome (consistente)
const getBackgroundColor = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  
  // Usar o nome para gerar um índice consistente
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export default function Avatar({ 
  name, 
  size = 40, 
  className = '',
  bgColor,
  textColor = 'text-white'
}: AvatarProps) {
  const initials = getInitials(name);
  const backgroundColor = bgColor || getBackgroundColor(name);
  
  return (
    <div
      className={`${backgroundColor} ${textColor} rounded-full flex items-center justify-center font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

