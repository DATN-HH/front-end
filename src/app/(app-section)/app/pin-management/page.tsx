'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    KeyRound,
    Shield,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff,
    Loader2,
    Users,
    Settings,
    Info,
} from 'lucide-react';
import {
    useUpdateUserPin,
    useCheckUserHasPin,
    useAdminUpdateUserPin,
    useAdminResetUserPin,
    useSetInitialPin,
} from '@/api/v1/pin';
import { usePosEmployees } from '@/api/v1/pos';
import { useAuth } from '@/contexts/auth-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function PinManagementPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    
    // User PIN Management State
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPins, setShowPins] = useState(false);
    
    // Admin PIN Management State
    const [targetUserId, setTargetUserId] = useState('');
    const [adminNewPin, setAdminNewPin] = useState('');
    const [adminConfirmPin, setAdminConfirmPin] = useState('');
    const [adminReason, setAdminReason] = useState('');
    const [resetTargetUserId, setResetTargetUserId] = useState('');
    const [tempPin, setTempPin] = useState('');

    // API Hooks
    const { data: employees, isLoading: employeesLoading } = usePosEmployees();
    const { data: pinStatus, isLoading: pinStatusLoading } = useCheckUserHasPin(user?.id || 0);
    const updatePinMutation = useUpdateUserPin();
    const setInitialPinMutation = useSetInitialPin();
    const adminUpdatePinMutation = useAdminUpdateUserPin();
    const adminResetPinMutation = useAdminResetUserPin();

    const handleUpdatePin = async () => {
        if (newPin !== confirmPin) {
            toast({
                title: 'PIN Mismatch',
                description: 'New PIN and confirm PIN do not match.',
                variant: 'destructive',
            });
            return;
        }

        if (newPin.length < 4 || newPin.length > 6) {
            toast({
                title: 'Invalid PIN Length',
                description: 'PIN must be between 4 and 6 digits.',
                variant: 'destructive',
            });
            return;
        }

        try {
            // If user doesn't have a PIN set, use setInitialPin endpoint
            if (!pinStatus?.hasPin) {
                await setInitialPinMutation.mutateAsync({
                    userId: user?.id || 0,
                    pin: newPin,
                });
            } else {
                // If user has a PIN, use updateUserPin endpoint
                await updatePinMutation.mutateAsync({
                    userId: user?.id || 0,
                    data: {
                        currentPin,
                        newPin,
                        confirmPin,
                    }
                });
            }

            toast({
                title: 'PIN Updated',
                description: pinStatus?.hasPin ? 'Your PIN has been successfully updated.' : 'Your PIN has been successfully set.',
            });

            // Clear form
            setCurrentPin('');
            setNewPin('');
            setConfirmPin('');
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: pinStatus?.hasPin 
                    ? 'Failed to update PIN. Please check your current PIN.' 
                    : 'Failed to set PIN. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleAdminUpdatePin = async () => {
        if (adminNewPin !== adminConfirmPin) {
            toast({
                title: 'PIN Mismatch',
                description: 'New PIN and confirm PIN do not match.',
                variant: 'destructive',
            });
            return;
        }

        if (!targetUserId) {
            toast({
                title: 'Missing User ID',
                description: 'Please enter the target user ID.',
                variant: 'destructive',
            });
            return;
        }

        try {
            await adminUpdatePinMutation.mutateAsync({
                adminUserId: user?.id || 0,
                data: {
                    targetUserId: parseInt(targetUserId),
                    newPin: adminNewPin,
                    confirmPin: adminConfirmPin,
                    reason: adminReason,
                }
            });

            toast({
                title: 'PIN Updated',
                description: `PIN has been successfully updated for user ${targetUserId}.`,
            });

            // Clear form
            setTargetUserId('');
            setAdminNewPin('');
            setAdminConfirmPin('');
            setAdminReason('');
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: 'Failed to update user PIN. Please check permissions.',
                variant: 'destructive',
            });
        }
    };

    const handleAdminResetPin = async () => {
        if (!resetTargetUserId) {
            toast({
                title: 'Missing User ID',
                description: 'Please enter the target user ID.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const result = await adminResetPinMutation.mutateAsync({
                adminUserId: user?.id || 0,
                targetUserId: parseInt(resetTargetUserId),
            });

            setTempPin(result.temporaryPin);

            toast({
                title: 'PIN Reset',
                description: `Temporary PIN generated for user ${resetTargetUserId}.`,
            });
        } catch (error) {
            toast({
                title: 'Reset Failed',
                description: 'Failed to reset user PIN. Please check permissions.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                    <KeyRound className="h-12 w-12 text-orange-600 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900">PIN Management</h1>
                </div>
                <p className="text-gray-600 text-lg">
                    Manage your POS login PIN and help employees with their PIN settings
                </p>
            </div>

            {/* Current PIN Status */}
            <Card className="border-2 border-orange-200 shadow-lg mb-8">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                    <CardTitle className="flex items-center space-x-2">
                        <Info className="h-5 w-5 text-orange-600" />
                        <span>PIN Status</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">Current User: {user?.fullName || 'Unknown'}</h3>
                            <p className="text-gray-600">{user?.email || ''}</p>
                        </div>
                        <div className="text-right">
                            {pinStatusLoading ? (
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-gray-500">Checking...</span>
                                </div>
                            ) : (
                                <Badge variant={pinStatus?.hasPin ? 'default' : 'destructive'}>
                                    {pinStatus?.hasPin ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            PIN Set
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            No PIN Set
                                        </>
                                    )}
                                </Badge>
                            )}
                        </div>
                    </div>
                    {user?.isManager && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center">
                                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                                <span className="text-blue-800 font-medium">Manager Access</span>
                            </div>
                            <p className="text-blue-700 text-sm mt-1">
                                You have admin privileges to manage other users' PINs
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* PIN Management Tabs */}
            <Tabs defaultValue="user" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user" className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>My PIN</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="admin" 
                        disabled={!user?.isManager}
                        className="flex items-center space-x-2"
                    >
                        <Users className="h-4 w-4" />
                        <span>Manage Users</span>
                    </TabsTrigger>
                </TabsList>

                {/* User PIN Management */}
                <TabsContent value="user">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <KeyRound className="h-5 w-5 text-orange-600" />
                                <span>Update Your PIN</span>
                            </CardTitle>
                            <p className="text-gray-600">
                                {pinStatus?.hasPin 
                                    ? 'Change your existing PIN for POS login'
                                    : 'Set up your PIN for POS login'
                                }
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {pinStatus?.hasPin && (
                                <div>
                                    <Label htmlFor="currentPin">Current PIN</Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPin"
                                            type={showPins ? 'text' : 'password'}
                                            value={currentPin}
                                            onChange={(e) => setCurrentPin(e.target.value)}
                                            placeholder="Enter your current PIN"
                                            className="pr-10"
                                            maxLength={6}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowPins(!showPins)}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                        >
                                            {showPins ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="newPin">New PIN</Label>
                                <Input
                                    id="newPin"
                                    type={showPins ? 'text' : 'password'}
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter new PIN (4-6 digits)"
                                    maxLength={6}
                                />
                            </div>

                            <div>
                                <Label htmlFor="confirmPin">Confirm New PIN</Label>
                                <Input
                                    id="confirmPin"
                                    type={showPins ? 'text' : 'password'}
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Confirm your new PIN"
                                    maxLength={6}
                                />
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    Your PIN must be between 4-6 digits and will be used to log into the POS system.
                                    Keep it secure and don't share it with others.
                                </AlertDescription>
                            </Alert>

                            <Button
                                onClick={handleUpdatePin}
                                disabled={
                                    updatePinMutation.isPending ||
                                    setInitialPinMutation.isPending ||
                                    !newPin ||
                                    !confirmPin ||
                                    (pinStatus?.hasPin && !currentPin)
                                }
                                className="w-full bg-orange-600 hover:bg-orange-700"
                            >
                                {(updatePinMutation.isPending || setInitialPinMutation.isPending) ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {pinStatus?.hasPin ? 'Updating PIN...' : 'Setting PIN...'}
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="mr-2 h-4 w-4" />
                                        {pinStatus?.hasPin ? 'Update PIN' : 'Set PIN'}
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Admin PIN Management */}
                <TabsContent value="admin">
                    <div className="space-y-6">
                        {/* Update User PIN */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <span>Update Employee PIN</span>
                                </CardTitle>
                                <p className="text-gray-600">
                                    Set a new PIN for an employee (requires their consent)
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="targetUserId">Select Employee</Label>
                                    <Select value={targetUserId} onValueChange={setTargetUserId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employeesLoading ? (
                                                <SelectItem value="" disabled>
                                                    <div className="flex items-center">
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Loading employees...
                                                    </div>
                                                </SelectItem>
                                            ) : employees && employees.length > 0 ? (
                                                employees.map((employee) => (
                                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className="font-medium">{employee.fullName}</span>
                                                            <span className="text-sm text-gray-500 ml-2">ID: {employee.id}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="" disabled>
                                                    No employees found
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="adminNewPin">New PIN</Label>
                                    <Input
                                        id="adminNewPin"
                                        type="password"
                                        value={adminNewPin}
                                        onChange={(e) => setAdminNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="Enter new PIN (4-6 digits)"
                                        maxLength={6}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="adminConfirmPin">Confirm New PIN</Label>
                                    <Input
                                        id="adminConfirmPin"
                                        type="password"
                                        value={adminConfirmPin}
                                        onChange={(e) => setAdminConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="Confirm new PIN"
                                        maxLength={6}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="adminReason">Reason (Optional)</Label>
                                    <Input
                                        id="adminReason"
                                        value={adminReason}
                                        onChange={(e) => setAdminReason(e.target.value)}
                                        placeholder="Reason for PIN change (for audit log)"
                                    />
                                </div>

                                <Button
                                    onClick={handleAdminUpdatePin}
                                    disabled={
                                        adminUpdatePinMutation.isPending ||
                                        !targetUserId ||
                                        !adminNewPin ||
                                        !adminConfirmPin
                                    }
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    {adminUpdatePinMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating PIN...
                                        </>
                                    ) : (
                                        <>
                                            <KeyRound className="mr-2 h-4 w-4" />
                                            Update Employee PIN
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Reset User PIN */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    <span>Emergency PIN Reset</span>
                                </CardTitle>
                                <p className="text-gray-600">
                                    Generate a temporary PIN for an employee who forgot their PIN
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="resetTargetUserId">Select Employee</Label>
                                    <Select value={resetTargetUserId} onValueChange={setResetTargetUserId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employeesLoading ? (
                                                <SelectItem value="" disabled>
                                                    <div className="flex items-center">
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Loading employees...
                                                    </div>
                                                </SelectItem>
                                            ) : employees && employees.length > 0 ? (
                                                employees.map((employee) => (
                                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className="font-medium">{employee.fullName}</span>
                                                            <span className="text-sm text-gray-500 ml-2">ID: {employee.id}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="" disabled>
                                                    No employees found
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {tempPin && (
                                    <Alert className="border-yellow-200 bg-yellow-50">
                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                        <AlertDescription>
                                            <strong>Temporary PIN Generated: {tempPin}</strong>
                                            <br />
                                            Please share this PIN securely with the employee and ask them to change it immediately.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    onClick={handleAdminResetPin}
                                    disabled={adminResetPinMutation.isPending || !resetTargetUserId}
                                    variant="outline"
                                    className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                >
                                    {adminResetPinMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating PIN...
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="mr-2 h-4 w-4" />
                                            Generate Temporary PIN
                                        </>
                                    )}
                                </Button>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Important:</strong> Temporary PINs should be changed immediately by the employee.
                                        This action is logged for security audit purposes.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}