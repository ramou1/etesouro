import { useApp } from "@/context/AppContext";
import Image from "next/image";

export default function Header() {

const { user } = useApp();

  return (
    <div className="bg-white flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Image
            src="/images/logo02.png"
            alt="eTE$OURO Logo"
            width={120}
            height={40}
            className="h-6 w-auto"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Olá, {user?.name}</span>
        </div>
      </div>
    </div>
  );
}
