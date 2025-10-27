'use client';

import Image from "next/image";
import { getFamilyMembers } from '@/data/mockData';
import { useApp } from '@/context/AppContext';

export default function Participants() {
    const participants = getFamilyMembers();
    const { selectedParticipants, toggleParticipant } = useApp();

    const isDisabled = (participantId: string) => {
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
                        title={isDisabled(participant.id) ? `${participant.name} (Desabilitado)` : participant.name}
                    >
                        <Image 
                            src={participant.avatar} 
                            alt={participant.name} 
                            width={42} 
                            height={42} 
                            className="w-full h-full object-cover" 
                        />
                        
                        {/* Overlay amarelo quando desabilitado */}
                        {isDisabled(participant.id) && (
                            <div className="absolute inset-0 bg-yellow-400/70 backdrop-blur-[1px]"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}