'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    Minus,
    ShoppingCart,
    CreditCard,
    DollarSign,
    Search,
    Package,
    Loader2,
    Trash2,
    Lock,
    LogOut,
    ArrowLeft,
    User,
    FileText,
    Calculator,
    Users,
    Grid3X3,
    Receipt,
    Star,
    ChevronDown,
    ChevronUp,
    Filter, Delete,
} from 'lucide-react';
import { useCurrentPosSession, useCategories, useProducts, useSearchProducts, useFeaturedProducts, useProductsByCategory } from '@/api/v1/pos';
import { usePosStore } from '@/stores/pos-store';
import { CustomerSelectionModal } from './components/CustomerSelectionModal';
import { CustomerNotesModal } from './components/CustomerNotesModal';
import { ComboSelectionModal } from './components/ComboSelectionModal';
import { PaymentModal } from './components/PaymentModal';
import { PaymentScreen } from './components/PaymentScreen';
import { AddTipModal } from './components/AddTipModal';
import { PaymentSuccessView } from './components/PaymentSuccessView';
import { CustomerSearchModal } from './components/CustomerSearchModal';
import { useCreatePosOrder } from '@/api/v1/pos/operations';

export default function ComprehensivePosPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    // Store state
    const {
        currentOrder,
        orderType,
        selectedCategory,
        searchTerm,
        selectedCustomer,
        numpadMode,
        numpadValue,
        showComboModal,
        showCustomerModal,
        showNotesModal,
        showPaymentModal,
        addItem,
        updateItemQuantity,
        removeItem,
        clearOrder,
        setOrderType,
        setSelectedCategory,
        setSearchTerm,
        setNumpadMode,
        setNumpadValue,
        openCustomerModal,
        openNotesModal,
        openPaymentModal,
        getSubtotal,
        getTax,
        getTotal,
        getItemCount,
        orderId,
        setOrderId
    } = usePosStore();

    // Local state
    const [showNumpad, setShowNumpad] = useState(false);
    const [selectedOrderItem, setSelectedOrderItem] = useState<string | null>(null);
    
    // New payment flow state
    const [paymentMode, setPaymentMode] = useState<'order' | 'payment' | 'success'>('order');
    const [showTipModal, setShowTipModal] = useState(false);
    const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
    const [currentTipAmount, setCurrentTipAmount] = useState(0);
    const [paymentResponse, setPaymentResponse] = useState<any>(null);
    const [isPaymentInterfaceCollapsed, setIsPaymentInterfaceCollapsed] = useState(false);

    // API hooks
    const { data: session, isLoading: sessionLoading, error: sessionError } = useCurrentPosSession();
    const { data: categories = [] } = useCategories();
    const { data: featuredProducts = [] } = useFeaturedProducts();
    const { data: categoryProducts = [] } = useProductsByCategory(selectedCategory || 0);
    const { data: searchResults = [] } = useSearchProducts(searchTerm);
    const createOrderMutation = useCreatePosOrder();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!sessionLoading && (!session || (session as any)?.isLocked)) {
            router.push('/pos/login');
        }
    }, [session, sessionLoading, router]);

    // Determine which products to show
    const getDisplayProducts = () => {
        if (searchTerm) return searchResults;
        if (selectedCategory) return categoryProducts;
        return featuredProducts;
    };

    const displayProducts = getDisplayProducts();

    // Order calculations
    const orderSubtotal = getSubtotal();
    const orderTax = getTax();
    const orderTotal = getTotal();
    const itemCount = getItemCount();

    const handleAddToOrder = (product: any) => {
        addItem(product, 'PRODUCT');
        toast({
            title: 'Item Added',
            description: `${product.name} added to order`,
            duration: 1000
        });
    };

    const handleQuantityChange = (localId: string, newQuantity: number) => {
        updateItemQuantity(localId, newQuantity);
    };

    const handleNumpadToggle = (orderItemId?: string) => {
        setSelectedOrderItem(orderItemId || null);
        setNumpadMode('quantity');
        setShowNumpad(!showNumpad);
    };

    const handleLockSession = () => {
        toast({
            title: 'Session Locked',
            description: 'Session has been locked. Enter PIN to unlock.',
        });
    };

    const handleLogout = () => {
        router.push('/pos/login');
    };

    const handleBackToApp = () => {
        router.push('/app');
    };

    // Numpad handlers
    const handleNumberClick = (number: string) => {
        const currentValue = numpadValue || '';
        if (currentValue === '0' && number !== '.') {
            setNumpadValue(number);
        } else {
            setNumpadValue(currentValue + number);
        }
    };

    const handleClearLastNumber = () => {
        const currentValue = numpadValue || '';
        if (currentValue.length > 0) {
            setNumpadValue(currentValue.slice(0, -1));
        }
    };

    const handleClearNumpad = () => {
        setNumpadValue('');
    };

    const handleApplyNumpad = () => {
        const value = parseFloat(numpadValue);
        if (!value || value <= 0) return;

        // For now, just show a toast - later we can implement different modes
        toast({
            title: 'Numpad Value Applied',
            description: `Value: ${value}`,
        });
        
        // Clear the numpad after applying
        setNumpadValue('');
    };

    // New payment flow handlers
    const handlePaymentClick = async () => {
        if (currentOrder.length === 0) {
            toast({
                title: 'Empty Order',
                description: 'Add items to your order before processing payment',
                variant: 'destructive'
            });
            return;
        }

        if (!session) {
            toast({ title: 'Error', description: 'No session', variant: 'destructive' });
            return;
        }

        // Ensure order exists in backend (draft-first)
        if (!orderId) {
            try {
                const draft = await createOrderMutation.mutateAsync({
                    sessionId: (session as any).id,
                    customerId: selectedCustomer?.id,
                    orderType,
                    customerNotes: '',
                    specialInstructions: '',
                    items: currentOrder.map((item) => ({
                        itemType: item.itemType,
                        productId: item.productId,
                        comboId: item.comboId,
                        comboVariantId: (item as any).comboVariantId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                    })),
                });
                setOrderId(draft.id);
            } catch (err) {
                toast({ title: 'Error', description: 'Failed to create order', variant: 'destructive' });
                return;
            }
        }

        setPaymentMode('payment');
    };

    const handleTipClick = () => {
        setShowTipModal(true);
    };

    const handleCustomerClick = () => {
        setShowCustomerSearchModal(true);
    };

    const handleTipApplied = (tipAmount: number) => {
        setCurrentTipAmount(tipAmount);
        setShowTipModal(false);
    };

    const handlePaymentSuccess = (response: any) => {
        setPaymentResponse(response);
        setPaymentMode('success');
    };

    const handleNewOrder = () => {
        setPaymentMode('order');
        setCurrentTipAmount(0);
        setPaymentResponse(null);
        setIsPaymentInterfaceCollapsed(false); // Reset payment interface for new order
        clearOrder();
    };

    const handleTogglePaymentInterface = () => {
        setIsPaymentInterfaceCollapsed(!isPaymentInterfaceCollapsed);
    };

    // Keyboard shortcut for collapsing payment interface
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Only in payment mode and when Ctrl/Cmd + H is pressed
            if ((paymentMode === 'payment' || paymentMode === 'success') && 
                (event.ctrlKey || event.metaKey) && event.key === 'h') {
                event.preventDefault();
                handleTogglePaymentInterface();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [paymentMode, isPaymentInterfaceCollapsed]);

    // Show loading if checking session
    if (sessionLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
                    <p className="text-gray-600">Loading POS...</p>
                </div>
            </div>
        );
    }

    // Show error if session failed
    if (sessionError || !session) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load POS session</p>
                    <Button onClick={() => router.push('/pos/login')}>
                        Return to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-[#FFA500] h-16 px-4 flex items-center justify-between shadow-md">
                {/* Left side - Back to app & Branding */}
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
                        <span className="text-white ml-2 text-lg">POS</span>
                    </div>
                </div>

                {/* Right side - User info and actions */}
                <div className="flex items-center space-x-2">
                    <div className="text-white text-sm">
                        <div className="font-medium">{(session as any)?.user?.fullName || 'User'}</div>
                        <div className="text-xs opacity-90">{(session as any)?.branch?.name || 'Branch'}</div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLockSession}
                        className="text-white hover:bg-[#FF8C00]"
                    >
                        <Lock className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-white hover:bg-[#FF8C00]"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Left Panel - Order Management (40-45%) */}
                <div className="w-2/5 bg-white border-r shadow-lg flex flex-col h-[calc(100vh-4rem)]">
                    {/* Order Header */}
                    <div className="p-4 border-b bg-gray-50 flex-shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <ShoppingCart className="h-5 w-5 mr-2 text-orange-600" />
                                Current Order
                            </h2>
                            <div className="flex items-center gap-2">
                                {currentOrder.length > 0 && paymentMode === 'order' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearOrder}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        {/* Order Type & Customer */}
                        <div className="flex gap-2 mb-3">
                            {(['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'PICKUP'] as const).map((type) => (
                                <Button
                                    key={type}
                                    variant={orderType === type ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setOrderType(type)}
                                    className={orderType === type ? 'bg-orange-600 hover:bg-orange-700' : ''}
                                >
                                    {type.replace('_', ' ')}
                                </Button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openCustomerModal}
                                className="flex-1"
                            >
                                <User className="h-4 w-4 mr-2" />
                                {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openNotesModal}
                            >
                                <FileText className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <Badge variant="secondary" className="mt-3">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </Badge>
                    </div>

                    {/* Order Items - Always Visible Scrollable Area */}
                    <div className="flex-1 overflow-y-auto p-4 min-h-0">
                        {currentOrder.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>No items in order</p>
                                <p className="text-sm">Select products to add them</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {currentOrder.map((item) => (
                                    <div key={item.localId} className="p-3 border rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-900 flex-1">
                                                {item.productName || item.comboName}
                                            </h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(item.localId)}
                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleQuantityChange(item.localId, item.quantity - 1)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <button
                                                    onClick={() => handleNumpadToggle(item.localId)}
                                                    className="w-12 text-center text-sm hover:bg-gray-100 rounded px-2 py-1"
                                                >
                                                    {item.quantity}
                                                </button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleQuantityChange(item.localId, item.quantity + 1)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <span className="font-medium text-orange-600">
                                                ${(item.totalPrice || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dynamic Bottom Section */}
                    {paymentMode === 'order' && (
                        <div className="flex-shrink-0 border-t bg-gray-50 p-4">
                            {/* Order Totals */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span>${orderSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax (10%):</span>
                                    <span>${orderTax.toFixed(2)}</span>
                                </div>
                                {currentTipAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tip:</span>
                                        <span className="text-orange-600">${currentTipAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total:</span>
                                    <span className="text-orange-600">${(orderTotal + currentTipAmount).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <Button
                                    variant="outline" 
                                    size="sm"
                                    className="w-full h-10"
                                >
                                    <Receipt className="h-4 w-4 mr-2" />
                                    Print Receipt
                                </Button>
                                
                                {currentOrder.length > 0 && (
                                    <Button
                                        onClick={handlePaymentClick}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-semibold"
                                    >
                                        <CreditCard className="h-5 w-5 mr-2" />
                                        PAYMENT - ${(orderTotal + currentTipAmount).toFixed(2)}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {paymentMode === 'payment' && (
                        <PaymentScreen
                            onTipClick={handleTipClick}
                            onCustomerClick={handleCustomerClick}
                            onPaymentSuccess={handlePaymentSuccess}
                            isCollapsed={isPaymentInterfaceCollapsed}
                            onToggleCollapse={handleTogglePaymentInterface}
                        />
                    )}

                    {paymentMode === 'success' && paymentResponse && (
                        <PaymentSuccessView
                            paymentResponse={paymentResponse}
                            onNewOrder={handleNewOrder}
                        />
                    )}
                </div>

                {/* Right Panel - Product Catalog (55-60%) */}
                <div className="flex-1 p-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-12 text-lg focus:border-orange-500 focus:ring-orange-500"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedCategory || ''}
                                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                                    className="h-12 px-4 pr-10 border border-gray-300 rounded-md text-lg focus:border-orange-500 focus:ring-orange-500 bg-white appearance-none min-w-[180px]"
                                >
                                    <option value="">Featured Items</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Category Navigation */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                            <Button
                                variant={selectedCategory === null ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(null)}
                                className={`whitespace-nowrap ${
                                    selectedCategory === null
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'border-gray-300 hover:bg-orange-50 hover:border-orange-300'
                                }`}
                            >
                                <Star className="h-4 w-4 mr-2" />
                                Featured
                            </Button>
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`whitespace-nowrap ${
                                        selectedCategory === category.id
                                            ? 'bg-orange-600 hover:bg-orange-700'
                                            : 'border-gray-300 hover:bg-orange-50 hover:border-orange-300'
                                    }`}
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {displayProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-orange-300"
                                onClick={() => handleAddToOrder(product)}
                            >
                                <CardContent className="p-4">
                                    <div className="w-full h-24 bg-gray-200 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                                        {product.imageUrl ? (
                                            <img 
                                                src={product.imageUrl} 
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
                                    {product.description && (
                                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                                    )}
                                    <p className="text-lg font-bold text-orange-600">${product.price ? product.price.toFixed(2) : '0.00'}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {displayProducts.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">
                                {searchTerm ? 'No products found for your search' : 'No products available'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals and Components */}
            <CustomerSelectionModal />
            <CustomerNotesModal />
            <ComboSelectionModal />
            <PaymentModal />
            
            {/* New Payment Flow Modals */}
            <AddTipModal
                isOpen={showTipModal}
                onClose={() => setShowTipModal(false)}
                onTipApplied={handleTipApplied}
                currentTipAmount={currentTipAmount}
            />
            
            <CustomerSearchModal
                isOpen={showCustomerSearchModal}
                onClose={() => setShowCustomerSearchModal(false)}
            />
        </div>
    );
}