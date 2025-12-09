// src/components/Participants.tsx
'use client';

import { useApp } from '@/context/AppContext';
import Avatar from '@/components/ui/Avatar';

export default function Participants() {
    const { activeGroup, selectedParticipants, toggleParticipant } = useApp();

    const isDisabled = (participantId: string) => {
        return selectedParticipants.includes(participantId);
    };

    // Não renderizar se não houver grupo ativo ou membros
    if (!activeGroup || !activeGroup.members || activeGroup.members.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-300 py-2 px-4 z-20">
            <div className="flex justify-center space-x-4 -mt-5">
                {activeGroup.members.map((participant) => (
                    <button
                        key={participant.id}
                        onClick={() => toggleParticipant(participant.id)}
                        className="relative transition-all hover:scale-110 focus:outline-none"
                        title={isDisabled(participant.id) ? `${participant.name} (Desabilitado)` : participant.name}
                    >
                        <div className="relative">
                            <Avatar 
                                name={participant.name}
                                size={48}
                                className="border-4 border-yellow-300"
                            />
                            
                            {/* Overlay amarelo quando desabilitado */}
                            {isDisabled(participant.id) && (
                                <div className="absolute inset-0 bg-yellow-400/70 backdrop-blur-[1px] rounded-full"></div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}