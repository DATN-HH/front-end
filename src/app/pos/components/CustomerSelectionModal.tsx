'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePosStore } from '@/stores/pos-store';
import { Search, User, Plus } from 'lucide-react';

// Mock customer data - replace with real API
const mockCustomers = [
    { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+1234567890' },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com', phone: '+1234567891' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', phone: '+1234567893' },
];

export function CustomerSelectionModal() {
    const { showCustomerModal, closeCustomerModal, setSelectedCustomer, selectedCustomer } = usePosStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = mockCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    const handleSelectCustomer = (customer: typeof mockCustomers[0]) => {
        setSelectedCustomer(customer);
        closeCustomerModal();
    };

    const handleClearCustomer = () => {
        setSelectedCustomer(undefined);
        closeCustomerModal();
    };

    return (
        <Dialog open={showCustomerModal} onOpenChange={closeCustomerModal}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-orange-600" />
                        Select Customer
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Current Selection */}
                    {selectedCustomer && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-orange-900">{selectedCustomer.name}</p>
                                    <p className="text-sm text-orange-700">{selectedCustomer.email}</p>
                                    <p className="text-sm text-orange-700">{selectedCustomer.phone}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearCustomer}
                                    className="text-orange-600 hover:text-orange-800"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Customer List */}
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredCustomers.map((customer) => (
                            <div
                                key={customer.id}
                                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleSelectCustomer(customer)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                        <p className="text-sm text-gray-600">{customer.email}</p>
                                        <p className="text-sm text-gray-600">{customer.phone}</p>
                                    </div>
                                    {selectedCustomer?.id === customer.id && (
                                        <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredCustomers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No customers found</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                    // Handle new customer creation
                                    console.log('Create new customer');
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Customer
                            </Button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={closeCustomerModal}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                // Handle walk-in customer
                                setSelectedCustomer({ id: 0, name: 'Walk-in Customer' });
                                closeCustomerModal();
                            }}
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                        >
                            Walk-in Customer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}