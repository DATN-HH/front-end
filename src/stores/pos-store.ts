import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PosOrderItem, PosOrder, Product, FoodCombo } from '@/api/v1/pos';

export interface CartItem extends PosOrderItem {
  // Additional local properties
  localId: string; // For managing items before they have database IDs
  customizations?: string[];
}

export interface PosState {
  // Current order state
  currentOrder: CartItem[];
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'PICKUP';
  customerId?: number;
  customerNotes: string;
  specialInstructions: string;
  
  // Draft orders (auto-saved)
  draftOrders: PosOrder[];
  currentDraftOrderId?: number;
  
  // Selected customer
  selectedCustomer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  
  // UI state
  selectedCategory: number | null;
  searchTerm: string;
  numpadMode: 'quantity' | 'price' | 'discount' | 'payment';
  numpadValue: string;
  
  // Modals
  showComboModal: boolean;
  showCustomerModal: boolean;
  showNotesModal: boolean;
  showPaymentModal: boolean;
  selectedCombo?: FoodCombo;
  selectedProduct?: Product;
  
  // Actions
  addItem: (product: Product | FoodCombo, itemType: 'PRODUCT' | 'COMBO') => void;
  updateItemQuantity: (localId: string, quantity: number) => void;
  removeItem: (localId: string) => void;
  clearOrder: () => void;
  
  // Order management
  setOrderType: (type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'PICKUP') => void;
  setCustomerNotes: (notes: string) => void;
  setSpecialInstructions: (instructions: string) => void;
  setSelectedCustomer: (customer: { id: number; name: string; email?: string; phone?: string; } | undefined) => void;
  
  // Draft order management
  saveDraftOrder: () => void;
  loadDraftOrder: (orderId: number) => void;
  deleteDraftOrder: (orderId: number) => void;
  
  // UI actions
  setSelectedCategory: (categoryId: number | null) => void;
  setSearchTerm: (term: string) => void;
  setNumpadMode: (mode: 'quantity' | 'price' | 'discount' | 'payment') => void;
  setNumpadValue: (value: string) => void;
  
  // Modal actions
  openComboModal: (combo: FoodCombo) => void;
  closeComboModal: () => void;
  openCustomerModal: () => void;
  closeCustomerModal: () => void;
  openNotesModal: () => void;
  closeNotesModal: () => void;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  
  // Calculations
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentOrder: [],
      orderType: 'DINE_IN',
      customerNotes: '',
      specialInstructions: '',
      draftOrders: [],
      selectedCategory: null,
      searchTerm: '',
      numpadMode: 'quantity',
      numpadValue: '',
      showComboModal: false,
      showCustomerModal: false,
      showNotesModal: false,
      showPaymentModal: false,
      
      // Actions
      addItem: (product, itemType) => {
        const state = get();
        const localId = `${itemType}_${product.id}_${Date.now()}`;
        
        // Check if item already exists (for simple products)
        if (itemType === 'PRODUCT') {
          const existingItemIndex = state.currentOrder.findIndex(
            item => item.itemType === 'PRODUCT' && item.productId === product.id
          );
          
          if (existingItemIndex >= 0) {
            // Update quantity of existing item
            const newOrder = [...state.currentOrder];
            const existingItem = newOrder[existingItemIndex];
            const newQuantity = existingItem.quantity + 1;
            const newTotal = newQuantity * (existingItem.unitPrice || 0);
            
            newOrder[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity,
              totalPrice: newTotal
            };
            
            set({ currentOrder: newOrder });
            return;
          }
        }
        
        // Add new item
        const newItem: CartItem = {
          localId,
          itemType,
          productId: itemType === 'PRODUCT' ? product.id : undefined,
          comboId: itemType === 'COMBO' ? product.id : undefined,
          quantity: 1,
          unitPrice: itemType === 'PRODUCT' ? (product as Product).price : (product as FoodCombo).basePrice,
          totalPrice: itemType === 'PRODUCT' ? (product as Product).price : (product as FoodCombo).basePrice,
          productName: itemType === 'PRODUCT' ? product.name : undefined,
          comboName: itemType === 'COMBO' ? product.name : undefined,
          productImageUrl: itemType === 'PRODUCT' ? (product as Product).imageUrl : undefined
        };
        
        set({ 
          currentOrder: [...state.currentOrder, newItem]
        });
      },
      
      updateItemQuantity: (localId, quantity) => {
        const state = get();
        if (quantity <= 0) {
          state.removeItem(localId);
          return;
        }
        
        const newOrder = state.currentOrder.map(item => {
          if (item.localId === localId) {
            const newTotal = quantity * (item.unitPrice || 0);
            return {
              ...item,
              quantity,
              totalPrice: newTotal
            };
          }
          return item;
        });
        
        set({ currentOrder: newOrder });
      },
      
      removeItem: (localId) => {
        const state = get();
        set({ 
          currentOrder: state.currentOrder.filter(item => item.localId !== localId)
        });
      },
      
      clearOrder: () => {
        set({ 
          currentOrder: [],
          customerNotes: '',
          specialInstructions: '',
          selectedCustomer: undefined
        });
      },
      
      // Order management
      setOrderType: (type) => set({ orderType: type }),
      setCustomerNotes: (notes) => set({ customerNotes: notes }),
      setSpecialInstructions: (instructions) => set({ specialInstructions: instructions }),
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      
      // Draft order management
      saveDraftOrder: () => {
        const state = get();
        const draftOrder: PosOrder = {
          id: state.currentDraftOrderId || Date.now(),
          sessionId: 0, // Will be set when actually saving to backend
          orderStatus: 'DRAFT',
          orderType: state.orderType,
          customerNotes: state.customerNotes,
          specialInstructions: state.specialInstructions,
          customerId: state.selectedCustomer?.id,
          customerName: state.selectedCustomer?.name,
          items: state.currentOrder,
          subtotalAmount: state.getSubtotal(),
          totalAmount: state.getTotal(),
          orderDate: new Date().toISOString()
        };
        
        const existingIndex = state.draftOrders.findIndex(order => order.id === draftOrder.id);
        const newDraftOrders = [...state.draftOrders];
        
        if (existingIndex >= 0) {
          newDraftOrders[existingIndex] = draftOrder;
        } else {
          newDraftOrders.push(draftOrder);
        }
        
        set({ 
          draftOrders: newDraftOrders,
          currentDraftOrderId: draftOrder.id
        });
      },
      
      loadDraftOrder: (orderId) => {
        const state = get();
        const draftOrder = state.draftOrders.find(order => order.id === orderId);
        
        if (draftOrder) {
          set({
            currentOrder: draftOrder.items as CartItem[] || [],
            orderType: draftOrder.orderType,
            customerNotes: draftOrder.customerNotes || '',
            specialInstructions: draftOrder.specialInstructions || '',
            selectedCustomer: draftOrder.customerId ? {
              id: draftOrder.customerId,
              name: draftOrder.customerName || 'Customer'
            } : undefined,
            currentDraftOrderId: orderId
          });
        }
      },
      
      deleteDraftOrder: (orderId) => {
        const state = get();
        set({
          draftOrders: state.draftOrders.filter(order => order.id !== orderId),
          currentDraftOrderId: state.currentDraftOrderId === orderId ? undefined : state.currentDraftOrderId
        });
      },
      
      // UI actions
      setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      setNumpadMode: (mode) => set({ numpadMode: mode }),
      setNumpadValue: (value) => set({ numpadValue: value }),
      
      // Modal actions
      openComboModal: (combo) => set({ showComboModal: true, selectedCombo: combo }),
      closeComboModal: () => set({ showComboModal: false, selectedCombo: undefined }),
      openCustomerModal: () => set({ showCustomerModal: true }),
      closeCustomerModal: () => set({ showCustomerModal: false }),
      openNotesModal: () => set({ showNotesModal: true }),
      closeNotesModal: () => set({ showNotesModal: false }),
      openPaymentModal: () => set({ showPaymentModal: true }),
      closePaymentModal: () => set({ showPaymentModal: false }),
      
      // Calculations
      getSubtotal: () => {
        const state = get();
        return state.currentOrder.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      },
      
      getTax: () => {
        const state = get();
        return state.getSubtotal() * 0.1; // 10% tax
      },
      
      getTotal: () => {
        const state = get();
        return state.getSubtotal() + state.getTax();
      },
      
      getItemCount: () => {
        const state = get();
        return state.currentOrder.reduce((sum, item) => sum + item.quantity, 0);
      }
    }),
    {
      name: 'pos-store',
      partialize: (state) => ({
        draftOrders: state.draftOrders,
        orderType: state.orderType,
        selectedCategory: state.selectedCategory
      })
    }
  )
);