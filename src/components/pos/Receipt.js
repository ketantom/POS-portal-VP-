'use client';

export default function Receipt({ items, subtotal, tax, discount, total, paymentMethod, orderId }) {
  // 58mm Thermal Printer styling via print media query
  return (
    <div className="hidden print:block print:w-[58mm] print:text-black font-mono text-[11px] leading-[1.2] p-1 pb-4">
      {/* Header */}
      <div className="text-center border-b border-black border-dashed pb-2 mb-2">
        <h1 className="font-bold text-[14px]">VIJAYA PRODUCTS</h1>
        <p>123 Main Street</p>
        <p>City, State 12345</p>
        <p>Ph: 123-456-7890</p>
        <p>GSTIN: 29XXXXX1234X1ZX</p>
        <div className="mt-1 pt-1 border-t border-black border-dashed">
          <p>Order: #{orderId}</p>
          <p>Date: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="w-full">
        <div className="flex justify-between border-b border-black pb-1 mb-1 font-bold">
          <span className="flex-1">Item</span>
          <span className="w-8 text-right">Qty</span>
          <span className="w-12 text-right">Amt</span>
        </div>
        
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between mb-1">
            <span className="flex-1 truncate pr-1">{item.name}</span>
            <span className="w-8 text-right">{item.quantity}</span>
            <span className="w-12 text-right">{Number(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-black border-dashed mt-2 pt-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{Number(subtotal).toFixed(2)}</span>
        </div>
        {Number(discount) > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{Number(discount).toFixed(2)}</span>
          </div>
        )}
        {Number(tax) > 0 && (
          <div className="flex justify-between">
            <span>GST (5%):</span>
            <span>{Number(tax).toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between font-bold text-[13px] border-t border-black border-solid mt-1 pt-1">
          <span>TOTAL:</span>
          <span>₹{Number(total).toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-3 pt-2 border-t border-black border-dashed">
        <p>Paid via: {paymentMethod}</p>
        <p className="mt-2 font-bold">*** THANK YOU ***</p>
        <p>Please come again!</p>
      </div>
      
      {/* Space for paper tear */}
      <div className="h-8"></div>
    </div>
  );
}
