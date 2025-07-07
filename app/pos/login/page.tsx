"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Barcode, Delete, CornerDownLeft } from 'lucide-react';
import EmployeeSelectionModal from '@/components/pos/employee-selection-modal'; // Import the modal

interface Employee {
  id: string;
  name: string;
  avatarSrc?: string;
}

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [pageTitle, setPageTitle] = useState("Enter Your PIN");

  const primaryOrange = "hsl(var(--primary))"; // #FFA500

  const handleNumpadClick = (value: string) => {
    if (value === 'clear') {
      setPin('');
    } else if (value === 'backspace') {
      setPin((prevPin) => prevPin.slice(0, -1));
    } else {
      setPin((prevPin) => prevPin + value);
    }
  };

  const handleLogin = () => {
    if (selectedEmployee) {
      console.log(`Attempting login for ${selectedEmployee.name} with PIN: ${pin}`);
    } else {
      console.log('Attempting login with PIN:', pin);
    }
    // Add login logic here
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPageTitle(`Enter PIN for ${employee.name}`);
    setPin(''); // Clear PIN for the new user
    setIsEmployeeModalOpen(false); // Modal closes itself, but good practice
    console.log("Selected employee:", employee.name);
  };

  const numpadKeys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'CLR', '0', '⌫'
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-lg">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <span className="text-black text-5xl font-bold">Menu</span>
            <span className="text-5xl font-bold" style={{ color: primaryOrange }}>+</span>
          </div>

          {/* Screen Title */}
          <h1 className="text-3xl font-bold text-center text-gray-800">
            {pageTitle}
          </h1>

          {/* Login Input Group */}
          <div className="flex items-stretch space-x-2">
            <Input
              type="password"
              placeholder="Enter your PIN"
              value={pin}
              readOnly
              className="text-lg h-14 flex-grow focus-visible:border-primary-orange focus-visible:ring-primary-orange"
              style={{ borderColor: '#D1D5DB' }}
            />
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 bg-gray-100 border-gray-300 hover:bg-gray-200"
                    onClick={() => setIsEmployeeModalOpen(true)}
                  >
                    <Users className="h-6 w-6" style={{ color: primaryOrange }} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select Employee</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-14 w-14 bg-gray-100 border-gray-300 hover:bg-gray-200">
                    <Barcode className="h-6 w-6" style={{ color: primaryOrange }} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Scan Badge</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* On-Screen Numpad */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            {numpadKeys.map((key) => (
              <Button
                key={key}
                variant="outline"
                className="h-16 text-2xl font-medium bg-white border-gray-300 hover:bg-gray-100 focus:border-primary-orange focus:ring-primary-orange"
                onClick={() => {
                  if (key === 'CLR') handleNumpadClick('clear');
                  else if (key === '⌫') handleNumpadClick('backspace');
                  else handleNumpadClick(key);
                }}
              >
                {key === 'CLR' ? <span className="text-lg">CLR</span> : key === '⌫' ? <Delete size={28} /> : key}
              </Button>
            ))}
          </div>

          {/* Enter Button */}
          <Button
              onClick={handleLogin}
              className="w-full h-14 text-xl font-semibold mt-3"
              style={{ backgroundColor: primaryOrange, color: 'white' }}
          >
              Enter
              <CornerDownLeft size={24} className="ml-2"/>
          </Button>
        </div>
      </div>

      <EmployeeSelectionModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSelectEmployee={handleSelectEmployee}
      />
    </>
  );
}
