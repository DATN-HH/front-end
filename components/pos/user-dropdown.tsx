"use client"

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2, Lock, LogOut, Settings, Users } from 'lucide-react'; // Added more icons for example

interface UserDropdownProps {
  userName: string;
  userAvatarSrc?: string; // Optional: for actual image
}

// Mock employee data
const otherEmployees = [
  { id: "1", name: "Yumi Kuroi" },
  { id: "2", name: "John Doe" },
  { id: "3", name: "Alice Wonderland" },
];

export default function UserDropdown({ userName, userAvatarSrc }: UserDropdownProps) {
  const handleSwitchUser = (employeeName: string) => {
    console.log(`Switching to user: ${employeeName}`);
    // Here you would typically navigate to a login screen or PIN entry for that user
  };

  const handleLockSession = () => {
    console.log("Locking session");
    // Here you would navigate to the lock screen
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-white/10 transition-colors">
          <Avatar className="h-8 w-8">
            {userAvatarSrc ? <AvatarImage src={userAvatarSrc} alt={userName} /> : null}
            <AvatarFallback className="bg-gray-300">
              <UserCircle2 size={20} className="text-primary-orange-accent" />
            </AvatarFallback>
          </Avatar>
          <span className="text-white text-sm font-medium">{userName}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 mr-2 mt-1 border-gray-300 shadow-lg" sideOffset={5} align="end">
        <DropdownMenuLabel className="text-sm text-gray-500 px-2 py-1.5">
          Logged in as: <span className="font-semibold text-black">{userName}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Optional: Title for switching user section */}
        {otherEmployees.length > 0 && (
          <DropdownMenuLabel className="text-xs font-bold text-gray-700 px-2 pt-2 pb-1">
            SWITCH TO:
          </DropdownMenuLabel>
        )}

        {otherEmployees.map((employee) => (
          <DropdownMenuItem key={employee.id} onClick={() => handleSwitchUser(employee.name)} className="text-sm">
            <Users size={16} className="mr-2 text-gray-600" />
            {employee.name}
          </DropdownMenuItem>
        ))}

        {otherEmployees.length > 0 && <DropdownMenuSeparator />}

        <DropdownMenuItem onClick={handleLockSession} className="text-sm">
          <Lock size={16} className="mr-2 text-primary-orange" />
          Lock Session
        </DropdownMenuItem>

        {/* Example of other items you might add */}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-sm">
          <Settings size={16} className="mr-2 text-gray-600" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm">
          <LogOut size={16} className="mr-2 text-gray-600" />
          Log Out (System)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
