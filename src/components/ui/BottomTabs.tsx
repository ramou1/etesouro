'use client';

import { Home, Settings, PlusCircle, MinusCircle, ChartNoAxesCombined } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-3">
        <button className={`flex items-center justify-center py-2 ${isActive('/dashboard') ? 'text-yellow-600' : 'text-gray-400'}`}
          onClick={() => router.push('/dashboard')}>
          <Home size={32} />
        </button>
        
        <button className={`flex items-center justify-center py-2 ${isActive('/settings') ? 'text-yellow-600' : 'text-gray-400'}`}
          onClick={() => router.push('/settings')}>
          <Settings size={32} />
        </button>
        
        <button className={`flex items-center justify-center py-2 ${isActive('/income') ? 'text-yellow-600' : 'text-gray-400'}`}
          onClick={() => router.push('/income')}>
          <PlusCircle size={32} />
        </button>
        
        <button className={`flex items-center justify-center py-2 ${isActive('/expense') ? 'text-yellow-600' : 'text-gray-400'}`}
          onClick={() => router.push('/expense')}>
          <MinusCircle size={32} />
        </button>
        
        <button className={`flex items-center justify-center py-2 ${isActive('/analytics') ? 'text-yellow-600' : 'text-gray-400'}`}
          onClick={() => router.push('/analytics')}>
          <ChartNoAxesCombined size={32} />
        </button>
      </div>
    </div>
  );
}