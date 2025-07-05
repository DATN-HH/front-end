'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    UserCircle,
    Lock,
    Loader2,
} from 'lucide-react';
import { usePosEmployees, useSwitchPosUser } from '@/api/v1/pos';
import { PosUser } from '@/api/v1/pos/types';
import EmployeeSelectionModal from './EmployeeSelectionModal';

interface UserSwitchingDropdownProps {
    currentUser?: PosUser;
    onClose: () => void;
    onLockSession: () => void;
    isLocking?: boolean;
}

export default function UserSwitchingDropdown({
    currentUser,
    onClose,
    onLockSession,
    isLocking = false,
}: UserSwitchingDropdownProps) {
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    
    // API hooks
    const { data: employees = [] } = usePosEmployees();
    const switchUserMutation = useSwitchPosUser();

    // Filter out current user from the list
    const availableEmployees = employees.filter(emp => emp.id !== currentUser?.id);

    const handleEmployeeSelect = async (employee: PosUser, pin?: string) => {
        try {
            await switchUserMutation.mutateAsync({
                targetUserId: employee.id,
                pin,
            });
            setShowEmployeeModal(false);
            onClose();
        } catch (error) {
            console.error('Failed to switch user:', error);
        }
    };

    const handleQuickSwitch = (employee: PosUser) => {
        // For quick switch, open modal to enter PIN
        setShowEmployeeModal(true);
    };

    return (
        <>
            <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* Current User Display */}
                {currentUser && (
                    <>
                        <div className="px-4 py-2">
                            <div className="text-sm text-gray-500">Logged in as:</div>
                            <div className="font-medium text-gray-900 flex items-center space-x-2 mt-1">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                    <UserCircle className="h-4 w-4 text-gray-600" />
                                </div>
                                <span>{currentUser.fullName}</span>
                            </div>
                        </div>
                        <Separator className="my-2" />
                    </>
                )}

                {/* Switch to Other Employees */}
                {availableEmployees.length > 0 && (
                    <>
                        <div className="px-4 py-1">
                            <div className="text-sm font-medium text-gray-700">Switch to:</div>
                        </div>
                        
                        <div className="max-h-48 overflow-y-auto">
                            {availableEmployees.slice(0, 5).map((employee) => (
                                <button
                                    key={employee.id}
                                    onClick={() => handleQuickSwitch(employee)}
                                    disabled={switchUserMutation.isPending}
                                    className="w-full px-4 py-2 text-left hover:bg-orange-50 transition-colors duration-150 flex items-center space-x-2 disabled:opacity-50"
                                >
                                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <UserCircle className="h-3 w-3 text-gray-600" />
                                    </div>
                                    <span className="text-gray-900 truncate">{employee.fullName}</span>
                                    {switchUserMutation.isPending && (
                                        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {availableEmployees.length > 5 && (
                            <div className="px-4 py-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowEmployeeModal(true)}
                                    className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                    View All Employees ({availableEmployees.length})
                                </Button>
                            </div>
                        )}

                        <Separator className="my-2" />
                    </>
                )}

                {/* Lock Session */}
                <button
                    onClick={onLockSession}
                    disabled={isLocking}
                    className="w-full px-4 py-2 text-left hover:bg-orange-50 transition-colors duration-150 flex items-center space-x-2 disabled:opacity-50"
                >
                    <Lock className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-900">Lock Session</span>
                    {isLocking && (
                        <Loader2 className="h-4 w-4 animate-spin text-orange-500 ml-auto" />
                    )}
                </button>
            </div>

            {/* Employee Selection Modal */}
            {showEmployeeModal && (
                <EmployeeSelectionModal
                    employees={availableEmployees}
                    onSelect={handleEmployeeSelect}
                    onClose={() => setShowEmployeeModal(false)}
                    isLoading={switchUserMutation.isPending}
                />
            )}
        </>
    );
}