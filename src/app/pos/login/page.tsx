'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import SimpleNumpad from '../components/SimpleNumpad';
import EmployeeSelectionModal from '../components/EmployeeSelectionModal';
import { usePosLogin, usePosEmployees } from '@/api/v1/pos';

export default function PosLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    // API hooks
    const loginMutation = usePosLogin();
    const { data: employees, isLoading: employeesLoading } = usePosEmployees();
    
    const [pin, setPin] = useState('');
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    
    const isLoading = loginMutation.isPending;
    
    // Auto-select first employee if none selected and employees are loaded
    useEffect(() => {
        if (!selectedEmployee && employees && employees.length > 0 && !employeesLoading) {
            // Auto-select the first employee for easier testing
            setSelectedEmployee(employees[0]);
        }
    }, [employees, selectedEmployee, employeesLoading]);

    const handlePinChange = (newPin: string) => {
        setPin(newPin);
    };

    const handleEmployeeSelect = (employee: any) => {
        setSelectedEmployee(employee);
        setShowEmployeeModal(false);
        setPin('');
    };

    const handleLogin = async () => {
        console.log('handleLogin called');
        console.log('PIN:', pin);
        console.log('Selected employee:', selectedEmployee);
        
        if (!pin || pin.length < 4) {
            console.log('PIN validation failed');
            toast({
                title: 'Invalid PIN',
                description: 'Please enter a valid 4-6 digit PIN.',
                variant: 'destructive',
            });
            return;
        }

        if (!selectedEmployee) {
            console.log('No employee selected');
            toast({
                title: 'Select Employee',
                description: 'Please click "Browse All Employees" to select an employee first.',
                variant: 'destructive',
            });
            return;
        }

        console.log('Making API call...');
        try {
            const result = await loginMutation.mutateAsync({
                pin,
                userId: selectedEmployee.id,
                branchId: 1, // TODO: Get from context or selection
                openingCashAmount: 0,
                sessionNotes: ''
            });
            
            console.log('Login successful:', result);
            
            toast({
                title: 'Login Successful',
                description: `Welcome, ${selectedEmployee?.fullName || 'User'}!`,
            });

            console.log('Attempting to navigate to /pos...');
            router.push('/pos');
            console.log('Navigation command sent');
        } catch (error: any) {
            console.log('Login failed:', error);
            toast({
                title: 'Login Failed',
                description: error.response?.data?.message || 'Invalid PIN or user credentials. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleBackToApp = () => {
        router.push('/app');
    };

    const clearPin = () => {
        setPin('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
            {/* Header */}
            <header className="bg-[#FFA500] h-16 px-4 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToApp}
                        className="text-white hover:bg-[#FF8C00]"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to App
                    </Button>
                    <div className="text-2xl font-bold">
                        <span className="text-black">Menu</span>
                        <span className="text-[#FF8C00]">+</span>
                        <span className="text-white ml-2 text-lg">POS Login</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-4xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Side - Login Form */}
                        <Card className="border-2 border-orange-200 shadow-lg">
                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-3xl font-bold text-gray-800">
                                    POS Login
                                </CardTitle>
                                <p className="text-gray-600 mt-2">
                                    Select your employee profile and enter your PIN
                                </p>
                                {process.env.NODE_ENV === 'development' && (
                                    <p className="text-sm text-orange-600 mt-1 font-medium">
                                        💡 Test PIN: 1234 (for John Waiter)
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Employee Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Employee
                                    </label>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowEmployeeModal(true)}
                                        className="w-full h-12 justify-start text-left border-2 border-gray-300 hover:border-orange-300"
                                    >
                                        {selectedEmployee ? (
                                            <div>
                                                <div className="font-medium">{selectedEmployee.fullName}</div>
                                                <div className="text-sm text-gray-500">{selectedEmployee.email}</div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">Select Employee</span>
                                        )}
                                    </Button>
                                </div>

                                {/* PIN Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        PIN
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="password"
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                            placeholder="Enter your PIN"
                                            className="h-12 text-center text-lg tracking-widest border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                            maxLength={6}
                                            readOnly
                                        />
                                        {pin && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearPin}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Login Button */}
                                <Button
                                    onClick={handleLogin}
                                    disabled={!pin || pin.length < 4 || isLoading}
                                    className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white text-lg font-medium"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Logging in...
                                        </>
                                    ) : (
                                        'Login to POS'
                                    )}
                                </Button>

                                {/* Quick Employee Login */}
                                <div className="text-center pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-3">Quick access for managers:</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowEmployeeModal(true)}
                                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                    >
                                        Browse All Employees
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Side - Numpad */}
                        <Card className="border-2 border-orange-200 shadow-lg">
                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-xl font-semibold text-gray-800">
                                    Touch PIN Entry
                                </CardTitle>
                                <p className="text-gray-600">
                                    Use the numpad below to enter your PIN
                                </p>
                            </CardHeader>
                            <CardContent>
                                <SimpleNumpad
                                    value={pin}
                                    onChange={handlePinChange}
                                    maxLength={6}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-gray-500 text-sm">
                            Need help? Contact your manager or IT support.
                        </p>
                    </div>
                </div>
            </div>

            {/* Employee Selection Modal */}
            <EmployeeSelectionModal
                isOpen={showEmployeeModal}
                onClose={() => setShowEmployeeModal(false)}
                onSelectEmployee={handleEmployeeSelect}
            />
        </div>
    );
}