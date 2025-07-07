'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Plus, Loader2 } from 'lucide-react';
import { usePosStore } from '@/stores/pos-store';
import { useToast } from '@/hooks/use-toast';
import { 
  useSearchCustomers, 
  useRecentCustomers, 
  useAssociateCustomer,
  CustomerSearchResponse 
} from '@/api/v1/pos/payments';

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerSearchModal({ isOpen, onClose }: CustomerSearchModalProps) {
  const { toast } = useToast();
  const { selectedCustomer, setSelectedCustomer } = usePosStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  const { data: searchResults = [], isLoading: isSearching } = useSearchCustomers(searchQuery);
  const { data: recentCustomers = [], isLoading: isLoadingRecent } = useRecentCustomers();
  const associateCustomerMutation = useAssociateCustomer();

  const handleSelectCustomer = async (customer: CustomerSearchResponse) => {
    try {
      // Associate customer with current order
      await associateCustomerMutation.mutateAsync({
        orderId: 1, // This should be the current order ID
        customerData: {
          customerId: customer.id,
          customerName: customer.fullName,
          email: customer.email,
          phone: customer.phoneNumber
        }
      });

      // Update local state
      setSelectedCustomer({
        id: customer.id,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phoneNumber
      });

      toast({
        title: 'Customer Selected',
        description: `${customer.fullName} associated with order`,
      });

      onClose();
    } catch (error) {
      console.error('Error selecting customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to select customer. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Customer name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await associateCustomerMutation.mutateAsync({
        orderId: 1, // This should be the current order ID
        customerData: {
          customerName: newCustomerName.trim(),
          email: newCustomerEmail.trim() || undefined,
          phone: newCustomerPhone.trim() || undefined,
          createIfNotExists: true
        }
      });

      // Update local state
      setSelectedCustomer({
        id: response.id,
        name: response.fullName,
        email: response.email,
        phone: response.phoneNumber
      });

      toast({
        title: 'Customer Created',
        description: `${response.fullName} created and associated with order`,
      });

      // Reset form
      setNewCustomerName('');
      setNewCustomerEmail('');
      setNewCustomerPhone('');
      setShowCreateForm(false);
      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to create customer. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveCustomer = () => {
    setSelectedCustomer(undefined);
    toast({
      title: 'Customer Removed',
      description: 'Customer association removed from order',
    });
    onClose();
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setShowCreateForm(false);
      setNewCustomerName('');
      setNewCustomerEmail('');
      setNewCustomerPhone('');
    }
  }, [isOpen]);

  const displayCustomers = searchQuery.length >= 2 ? searchResults : recentCustomers;
  const isLoading = searchQuery.length >= 2 ? isSearching : isLoadingRecent;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-orange-600" />
            Select Customer
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Current Selection */}
          {selectedCustomer && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-orange-900">{selectedCustomer.name}</p>
                  {selectedCustomer.email && (
                    <p className="text-sm text-orange-700">{selectedCustomer.email}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Selected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveCustomer}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">
                  {searchQuery.length >= 2 ? 'Searching...' : 'Loading recent customers...'}
                </span>
              </div>
            ) : displayCustomers.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 px-1">
                  {searchQuery.length >= 2 ? 'Search Results' : 'Recent Customers'}
                </h3>
                {displayCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    disabled={associateCustomerMutation.isPending}
                    className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{customer.fullName}</p>
                        <div className="flex gap-3 text-sm text-gray-600">
                          {customer.email && <span>{customer.email}</span>}
                          {customer.phoneNumber && <span>{customer.phoneNumber}</span>}
                        </div>
                      </div>
                      {customer.id === selectedCustomer?.id && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Current
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">No customers found</p>
                <p className="text-sm text-gray-400">
                  Try a different search term or create a new customer
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No recent customers</p>
              </div>
            )}
          </div>

          {/* Create New Customer Section */}
          {!showCreateForm ? (
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              className="w-full border-dashed border-gray-300 hover:border-orange-300 hover:text-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Customer
            </Button>
          ) : (
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3">Create New Customer</h3>
              
              <Input
                placeholder="Customer name *"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="bg-white"
              />
              
              <Input
                type="email"
                placeholder="Email address (optional)"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                className="bg-white"
              />
              
              <Input
                type="tel"
                placeholder="Phone number (optional)"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                className="bg-white"
              />
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                  disabled={associateCustomerMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCustomer}
                  disabled={associateCustomerMutation.isPending || !newCustomerName.trim()}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {associateCustomerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Customer'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}