'use client';

import { SidebarModule } from './SidebarModule';
import { SidebarLink } from './SidebarLink';
import { SIDEBAR_CONFIG } from './sidebar-config';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [openModule, setOpenModule] = useState<string | null>(null);
  
  // Logic để quản lý việc mở/đóng module
  const toggleModule = (moduleId: string) => {
    setOpenModule(current => current === moduleId ? null : moduleId);
  };
  
  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex flex-col gap-2 p-4 overflow-y-auto">
        {/* Các link độc lập */}
        <SidebarLink 
          href="/app" 
          icon={<Home className="h-5 w-5" />} 
          label="Dashboard"
          isActive={pathname === '/app'} 
          onClick={() => setOpenModule(null)}
        />
        
        {/* Render các module từ config */}
        {SIDEBAR_CONFIG.modules.map(module => (
          <SidebarModule
            key={module.id}
            module={module}
            isOpen={openModule === module.id}
            onToggle={() => toggleModule(module.id)}
            pathname={pathname}
          />
        ))}
      </div>
    </div>
  );
}