'use client';

import { useState } from 'react';
import Image from "next/image";
import { getFamilyMembers } from '@/data/mockData';

export default function Participants() {
    const participants = getFamilyMembers();
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

    const toggleParticipant = (participantId: string) => {
        setSelectedParticipants(prev => {
            if (prev.includes(participantId)) {
                // Remove da lista (habilita novamente)
                return prev.filter(id => id !== participantId);
            } else {
                // Adiciona na lista (desabilita)
                return [...prev, participantId];
            }
        });
    };

    const isSelected = (participantId: string) => {
        return selectedParticipants.includes(participantId);
    };

    return (
        <div className="fixed bottom-16 left-0 right-0 bg-yellow-300 py-2 px-4 z-20 h-8">
            <div className="flex justify-center space-x-4 -mt-8">
                {participants.map((participant) => (
                    <button
                        key={participant.id}
                        onClick={() => toggleParticipant(participant.id)}
                        className="relative w-12 h-12 border-4 border-yellow-300 rounded-full overflow-hidden transition-all hover:scale-110 focus:outline-none"
                        title={isSelected(participant.id) ? `${participant.name} (Desabilitado)` : participant.name}
                    >
                        <Image 
                            src={participant.avatar} 
                            alt={participant.name} 
                            width={42} 
                            height={42} 
                            className="w-full h-full object-cover" 
                        />
                        
                        {/* Overlay amarelo quando selecionado */}
                        {isSelected(participant.id) && (
                            <div className="absolute inset-0 bg-yellow-400/70 backdrop-blur-[1px]"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}