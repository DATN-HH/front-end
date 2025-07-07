"use client"

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2, Search, X } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  avatarSrc?: string; // Optional
}

// Mock employee data
const allEmployees: Employee[] = [
  { id: "0", name: "Mitchell Admin", avatarSrc: "/placeholder-avatar.png" }, // Current user might be in list
  { id: "1", name: "Yumi Kuroi" },
  { id: "2", name: "John Doe" },
  { id: "3", name: "Alice Wonderland", avatarSrc: "/placeholder-avatar.png" },
  { id: "4", name: "Bob The Builder" },
  { id: "5", name: "Charlie Brown" },
  { id: "6", name: "Diana Prince" },
  { id: "7", name: "Edward Scissorhands" },
  { id: "8", name: "Fiona Apple" },
  { id: "9", name: "George Jetson" },
];

interface EmployeeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmployee: (employee: Employee)  => void;
}

export default function EmployeeSelectionModal({
  isOpen,
  onClose,
  onSelectEmployee,
}: EmployeeSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return allEmployees;
    return allEmployees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSelect = (employee: Employee) => {
    onSelectEmployee(employee);
    onClose(); // Close modal after selection
  };

  const primaryOrange = "hsl(var(--primary))";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-800">Select Employee</DialogTitle>
          {/* DialogClose is automatically added by shadcn DialogContent, but if custom needed:
          <DialogClose asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
              <X className="h-5 w-5 text-gray-600 hover:text-primary-orange" />
            </button>
          </DialogClose> */}
        </DialogHeader>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" style={{color: primaryOrange}} />
            <Input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 focus-visible:border-primary-orange focus-visible:ring-primary-orange"
              style={{ borderColor: '#D1D5DB' }}
            />
          </div>
        </div>

        {/* Employee List */}
        <ScrollArea className="max-h-[60vh] h-[calc(min(300px,60vh))]"> {/* Adjust height as needed */}
          <div className="p-2">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => handleSelect(employee)}
                  className="flex items-center p-3 hover:bg-primary-orange-light rounded-md cursor-pointer transition-colors group"
                >
                  <Avatar className="h-8 w-8 mr-3">
                    {employee.avatarSrc ? <AvatarImage src={employee.avatarSrc} alt={employee.name} /> : null}
                    <AvatarFallback className="bg-gray-200 group-hover:bg-orange-200">
                      <UserCircle2 size={20} className="text-gray-500 group-hover:text-primary-orange" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary-orange">
                    {employee.name}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No employees found.</p>
            )}
          </div>
        </ScrollArea>
        {/* Footer could be added here if needed, e.g. for a manual close button if not using DialogClose from header */}
        {/* <div className="p-4 border-t border-gray-200 flex justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
