'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    UserCircle,
    Search,
    X,
    Loader2,
} from 'lucide-react';
import { PosUser } from '@/api/v1/pos/types';
import { usePosEmployees } from '@/api/v1/pos';

interface EmployeeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectEmployee: (employee: any) => void;
    employees?: PosUser[];
    isLoading?: boolean;
    requirePin?: boolean;
}

export default function EmployeeSelectionModal({
    isOpen,
    onClose,
    onSelectEmployee,
    employees: providedEmployees,
    isLoading: externalLoading = false,
    requirePin = false,
}: EmployeeSelectionModalProps) {
    // Fetch real employee data
    const { data: fetchedEmployees, isLoading: fetchLoading } = usePosEmployees();
    
    // Use provided employees or fetched employees
    const employees = providedEmployees || fetchedEmployees || [];
    const isLoading = externalLoading || fetchLoading;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<PosUser | null>(null);
    const [pin, setPin] = useState('');
    const [showPinInput, setShowPinInput] = useState(false);

    // Filter employees based on search term
    const filteredEmployees = useMemo(() => {
        if (!employees || employees.length === 0) return [];
        if (!searchTerm) return employees;
        
        const lowerSearch = searchTerm.toLowerCase();
        return employees.filter(employee =>
            employee.fullName.toLowerCase().includes(lowerSearch) ||
            employee.username.toLowerCase().includes(lowerSearch) ||
            employee.email.toLowerCase().includes(lowerSearch)
        );
    }, [employees, searchTerm]);

    const handleEmployeeClick = (employee: PosUser) => {
        if (requirePin) {
            setSelectedEmployee(employee);
            setShowPinInput(true);
            setPin('');
        } else {
            onSelectEmployee(employee);
        }
    };

    const handlePinSubmit = () => {
        if (selectedEmployee && pin) {
            onSelectEmployee(selectedEmployee);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && selectedEmployee && pin) {
            handlePinSubmit();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <UserCircle className="h-5 w-5 text-orange-600" />
                        <span>Select Employee</span>
                    </DialogTitle>
                    <DialogDescription>
                        Choose an employee to switch to or log in as.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 focus:border-orange-500 focus:ring-orange-500"
                        />
                    </div>

                    {/* PIN Input (if showing) */}
                    {showPinInput && selectedEmployee && (
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="text-sm font-medium text-orange-900 mb-2">
                                Enter PIN for {selectedEmployee.fullName}:
                            </div>
                            <div className="flex space-x-2">
                                <Input
                                    type="password"
                                    placeholder="Enter PIN"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="flex-1 focus:border-orange-500 focus:ring-orange-500"
                                    maxLength={6}
                                    autoFocus
                                />
                                <Button
                                    onClick={handlePinSubmit}
                                    disabled={!pin || isLoading}
                                    className="bg-orange-600 hover:bg-orange-700"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Login'
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowPinInput(false);
                                        setSelectedEmployee(null);
                                        setPin('');
                                    }}
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Employee List */}
                    <div className="max-h-80 overflow-y-auto">
                        {filteredEmployees.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <UserCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>No employees found</p>
                                {searchTerm && (
                                    <p className="text-sm">Try adjusting your search terms</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredEmployees.map((employee) => (
                                    <button
                                        key={employee.id}
                                        onClick={() => handleEmployeeClick(employee)}
                                        disabled={isLoading}
                                        className="w-full p-3 text-left hover:bg-orange-50 transition-colors duration-150 rounded-lg flex items-center space-x-3 disabled:opacity-50 border border-transparent hover:border-orange-200"
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            <UserCircle className="h-6 w-6 text-gray-600" />
                                        </div>

                                        {/* Employee Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 truncate">
                                                {employee.fullName}
                                            </div>
                                            <div className="text-sm text-gray-500 truncate">
                                                {employee.username} • {employee.email}
                                            </div>
                                            {employee.branchName && (
                                                <div className="text-xs text-gray-400 truncate">
                                                    {employee.branchName}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Indicator */}
                                        <div className="flex-shrink-0">
                                            <div className={`w-3 h-3 rounded-full ${
                                                employee.isActive 
                                                    ? 'bg-green-400' 
                                                    : 'bg-gray-300'
                                            }`} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-gray-500">
                            {filteredEmployees.length} of {employees?.length || 0} employees
                        </div>
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}