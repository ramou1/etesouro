import Image from "next/image";
import { getFamilyMembers } from '@/data/mockData';

export default function Participants() {
    const participants = getFamilyMembers();

    return (
        <div className="fixed bottom-16 left-0 right-0 bg-yellow-300 py-2 px-4 z-20 h-8">
            <div className="flex justify-center space-x-4 -mt-8">

                {participants.map((participant) => (
                    <div key={participant.id} className="w-12 h-12 border-4 border-yellow-300 rounded-full overflow-hidden">
                        <Image src={participant.avatar} alt={participant.name} width={42} height={42} className="w-full h-full object-cover" />
                    </div>
                ))}

            </div>
        </div>
    );
}