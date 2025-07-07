"use client";

import { Landmark, ClipboardList, Menu as MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserDropdown from './user-dropdown'; // Import the actual UserDropdown

export default function HeaderBar() {
  const primaryOrange = "hsl(var(--primary))"; // #FFA500
  const accentOrange = "hsl(var(--primary-orange-accent))"; // #FF8C00

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[68px] px-4"
      style={{ backgroundColor: primaryOrange }}
    >
      {/* Left Side: Logo */}
      <div className="flex items-center cursor-pointer" onClick={() => console.log("Logo clicked (Home Link)")}>
        <span className="text-black text-2xl font-bold">Menu</span>
        <span className="text-2xl font-bold" style={{ color: accentOrange }}>+</span>
      </div>

      {/* Center Section: Navigation Buttons */}
      <div className="flex-grow flex justify-center items-center space-x-6">
        <Button variant="ghost" className="text-white hover:bg-white/10 p-2" onClick={() => console.log("Cash In/Out clicked")}>
          <Landmark size={20} className="mr-2" />
          Cash In/Out
        </Button>
        <Button variant="ghost" className="text-white hover:bg-white/10 p-2 relative" onClick={() => console.log("Orders clicked")}>
          <ClipboardList size={20} className="mr-2" />
          Orders
          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-xs font-bold rounded-full flex items-center justify-center">
            1
          </div>
        </Button>
      </div>

      {/* Right Side Section: User Info & Hamburger Menu */}
      <div className="flex items-center space-x-4">
        <UserDropdown userName="Mitchell Admin" />

        {/* Hamburger Menu Button */}
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => console.log("Hamburger menu clicked")}>
          <MenuIcon size={24} />
        </Button>
      </div>
    </header>
  );
}
