'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
    Users,
    Barcode,
    Loader2,
} from 'lucide-react';
import { usePosLogin, useCurrentPosSession } from '@/api/v1/pos';
import { PosUser } from '@/api/v1/pos/types';
import PosNumpad from '../components/PosNumpad';
import EmployeeSelectionModal from '../components/EmployeeSelectionModal';

export default function PosLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    // State
    const [pin, setPin] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<PosUser | null>(null);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // API hooks
    const loginMutation = usePosLogin();
    const { data: currentSession, isLoading: sessionLoading } = useCurrentPosSession();

    // Redirect if already logged in
    useEffect(() => {
        if (currentSession && !currentSession.isLocked) {
            router.push('/app/pos');
        }
    }, [currentSession, router]);

    const handleNumberClick = (number: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + number);
        }
    };

    const handleClear = () => {
        setPin('');
    };

    const handleLogin = async () => {
        if (!pin) {
            toast({
                title: 'PIN Required',
                description: 'Please enter your PIN to login.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            const loginData = {
                pin,
                userId: selectedEmployee?.id,
            };

            await loginMutation.mutateAsync(loginData);
            
            toast({
                title: 'Login Successful',
                description: 'Welcome to Menu+ POS!',
            });

            // Redirect to main POS interface
            router.push('/app/pos');
        } catch (error: any) {
            toast({
                title: 'Login Failed',
                description: error.message || 'Invalid PIN or user. Please try again.',
                variant: 'destructive',
            });
            setPin('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmployeeSelect = (employee: PosUser, employeePin?: string) => {
        setSelectedEmployee(employee);
        setShowEmployeeModal(false);
        
        // If employee PIN is provided, use it directly
        if (employeePin) {
            setPin(employeePin);
        }
        
        toast({
            title: 'Employee Selected',
            description: `Selected ${employee.fullName}. Enter PIN to continue.`,
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && pin && !isLoading) {
            handleLogin();
        } else if (e.key === 'Backspace') {
            setPin(prev => prev.slice(0, -1));
        } else if (/^\d$/.test(e.key) && pin.length < 6) {
            setPin(prev => prev + e.key);
        }
    };

    // Show loading if checking current session
    if (sessionLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                        <span className="text-black">Menu</span>
                        <span className="text-[#FFA500]">+</span>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {currentSession?.isLocked ? 'Session Locked' : 'Log In to Menu+'}
                    </h1>
                    <p className="text-gray-600">
                        {selectedEmployee 
                            ? `Enter PIN for ${selectedEmployee.fullName}`
                            : 'Enter your PIN or select an employee'
                        }
                    </p>
                </div>

                {/* Selected Employee Display */}
                {selectedEmployee && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-orange-700 mb-1">Selected Employee:</div>
                        <div className="font-medium text-orange-900">{selectedEmployee.fullName}</div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmployee(null)}
                            className="mt-2 text-orange-600 hover:text-orange-700"
                        >
                            Change Employee
                        </Button>
                    </div>
                )}

                {/* Login Input Group */}
                <div className="space-y-4">
                    <div className="flex space-x-2">
                        {/* PIN Input */}
                        <Input
                            type="password"
                            placeholder="Enter your PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.slice(0, 6))}
                            onKeyDown={handleKeyPress}
                            className="flex-1 h-12 text-center text-lg focus:border-orange-500 focus:ring-orange-500"
                            maxLength={6}
                            disabled={isLoading}
                        />

                        {/* Select Employee Button */}
                        <Button
                            variant="outline"
                            className="h-12 px-4 border-gray-300 hover:bg-gray-50 hover:border-orange-300"
                            onClick={() => setShowEmployeeModal(true)}
                            disabled={isLoading}
                            title="Select Employee"
                        >
                            <Users className="h-5 w-5 text-orange-600" />
                        </Button>

                        {/* Scan Badge Button */}
                        <Button
                            variant="outline"
                            className="h-12 px-4 border-gray-300 hover:bg-gray-50 hover:border-orange-300"
                            onClick={() => {
                                toast({
                                    title: 'Badge Scanning',
                                    description: 'Badge scanning feature coming soon!',
                                });
                            }}
                            disabled={isLoading}
                            title="Scan Badge"
                        >
                            <Barcode className="h-5 w-5 text-orange-600" />
                        </Button>
                    </div>

                    {/* Login Button */}
                    <Button
                        onClick={handleLogin}
                        disabled={!pin || isLoading}
                        className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </Button>
                </div>

                {/* On-Screen Numpad */}
                <div className="pt-6">
                    <PosNumpad
                        onNumberClick={handleNumberClick}
                        onClear={handleClear}
                        onEnter={pin ? handleLogin : undefined}
                        disabled={isLoading}
                        showEnter={!!pin}
                    />
                </div>

                {/* Help Text */}
                <div className="text-center text-sm text-gray-500">
                    <p>Need help? Contact your manager or system administrator.</p>
                </div>
            </div>

            {/* Employee Selection Modal */}
            {showEmployeeModal && (
                <EmployeeSelectionModal
                    employees={[]} // Will be loaded by the modal
                    onSelect={handleEmployeeSelect}
                    onClose={() => setShowEmployeeModal(false)}
                    isLoading={loginMutation.isPending}
                    requirePin={false}
                />
            )}
        </div>
    );
}