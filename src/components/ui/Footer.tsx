'use client';

import { APP_VERSION } from '@/config/version';

export default function Footer() {
  return (
    <footer className="fixed bottom-2 left-2 z-10">
      <div className="bg-white/40 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-gray-200/30">
        <p className="text-xs text-gray-500 font-medium">
          v{APP_VERSION}
        </p>
      </div>
    </footer>
  );
}

