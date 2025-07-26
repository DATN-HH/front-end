'use client';

import { DollarSign, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCustomToast } from '@/lib/show-toast';

import {
    useCurrentPOSSession,
    useCreatePOSSession,
    useClosePOSSession,
    POSSessionStatus,
} from '@/api/v1/pos-sessions';

export function POSSessionManager() {
    const { success, error } = useCustomToast();
    const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
    const [openingBalance, setOpeningBalance] = useState<string>('');
    const [actualCash, setActualCash] = useState<string>('');
    const [closingNotes, setClosingNotes] = useState<string>('');

    // API hooks
    const { data: currentSession, isLoading } = useCurrentPOSSession();
    const createSessionMutation = useCreatePOSSession();
    const closeSessionMutation = useClosePOSSession();

    const handleStartSession = async () => {
        const balance = parseFloat(openingBalance);
        if (isNaN(balance) || balance < 0) {
            error('Error', 'Please enter a valid opening balance');
            return;
        }

        try {
            await createSessionMutation.mutateAsync({
                openingBalance: balance,
            });
            success('Success', 'POS session started successfully');
            setIsStartDialogOpen(false);
            setOpeningBalance('');
        } catch (err) {
            error('Error', 'Failed to start POS session');
        }
    };

    const handleCloseSession = async () => {
        const cash = parseFloat(actualCash);
        if (isNaN(cash) || cash < 0) {
            error('Error', 'Please enter a valid cash amount');
            return;
        }

        try {
            await closeSessionMutation.mutateAsync({
                actualCash: cash,
                closingNotes: closingNotes || undefined,
            });
            success('Success', 'POS session closed successfully');
            setIsCloseDialogOpen(false);
            setActualCash('');
            setClosingNotes('');
        } catch (err) {
            error('Error', 'Failed to close POS session');
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading session...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!currentSession) {
        // No active session - show start session dialog
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        No Active Session
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-4">
                        You need to start a POS session before taking orders.
                    </p>
                    
                    <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full">
                                <DollarSign className="w-4 h-4 mr-2" />
                                Start POS Session
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Start POS Session</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="opening-balance">Opening Balance (₫)</Label>
                                    <Input
                                        id="opening-balance"
                                        type="number"
                                        placeholder="Enter opening cash amount"
                                        value={openingBalance}
                                        onChange={(e) => setOpeningBalance(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsStartDialogOpen(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleStartSession}
                                        disabled={createSessionMutation.isPending}
                                        className="flex-1"
                                    >
                                        {createSessionMutation.isPending ? 'Starting...' : 'Start Session'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        );
    }

    // Active session - show session info and close option
    const sessionDuration = new Date().getTime() - new Date(currentSession.openedAt).getTime();
    const hours = Math.floor(sessionDuration / (1000 * 60 * 60));
    const minutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-500" />
                    Active Session #{currentSession.sessionNumber}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{hours}h {minutes}m</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Opening Balance:</span>
                        <span className="font-medium">{currentSession.openingBalance.toLocaleString()} ₫</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Sales:</span>
                        <span className="font-medium">{currentSession.totalSales.toLocaleString()} ₫</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Orders:</span>
                        <span className="font-medium">{currentSession.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Expected Cash:</span>
                        <span className="font-medium">{currentSession.expectedCash.toLocaleString()} ₫</span>
                    </div>
                </div>

                <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mt-4">
                            Close Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Close POS Session</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Session Summary</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Expected Cash:</span>
                                        <span>{currentSession.expectedCash.toLocaleString()} ₫</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Orders:</span>
                                        <span>{currentSession.totalOrders}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="actual-cash">Actual Cash Count (₫)</Label>
                                <Input
                                    id="actual-cash"
                                    type="number"
                                    placeholder="Enter actual cash amount"
                                    value={actualCash}
                                    onChange={(e) => setActualCash(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="closing-notes">Closing Notes (Optional)</Label>
                                <Textarea
                                    id="closing-notes"
                                    placeholder="Any notes about the session..."
                                    value={closingNotes}
                                    onChange={(e) => setClosingNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCloseDialogOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCloseSession}
                                    disabled={closeSessionMutation.isPending}
                                    className="flex-1"
                                >
                                    {closeSessionMutation.isPending ? 'Closing...' : 'Close Session'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
