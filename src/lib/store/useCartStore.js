import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  discount: 0, 
  isTaxEnabled: true,
  isDiscountEnabled: false,
  
  addItem: (product) => set((state) => {
    const existing = state.items.find(item => item.sku === product.sku);
    if (existing) {
      return {
        items: state.items.map(item =>
          item.sku === product.sku ? { ...item, qty: item.qty + 1 } : item
        )
      };
    }
    return { items: [...state.items, { ...product, qty: 1 }] };
  }),

  removeItem: (sku) => set((state) => ({
    items: state.items.filter(item => item.sku !== sku)
  })),

  updateQuantity: (sku, qty) => set((state) => {
    if (qty <= 0) {
      return { items: state.items.filter(item => item.sku !== sku) };
    }
    return {
      items: state.items.map(item =>
        item.sku === sku ? { ...item, qty } : item
      )
    };
  }),

  setDiscount: (amount) => set({ discount: amount }),
  setIsTaxEnabled: (enabled) => set({ isTaxEnabled: enabled }),
  setIsDiscountEnabled: (enabled) => set({ isDiscountEnabled: enabled }),

  clearCart: () => set({ items: [], discount: 0, isTaxEnabled: true, isDiscountEnabled: false }),

  getTotals: () => {
    const { items, discount, isTaxEnabled, isDiscountEnabled } = get();
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
    
    // Tax calculation
    const tax = isTaxEnabled ? (subtotal * 0.18) : 0; 
    
    // Discount calculation
    const appliedDiscount = isDiscountEnabled ? discount : 0;

    const total = Math.max(0, subtotal + tax - appliedDiscount);
    return { subtotal, tax, discount: appliedDiscount, total, isTaxEnabled, isDiscountEnabled };
  }
}));
