export default function Receipt({ items, subtotal, tax, discount, total, paymentMethod, orderId }) {
  const date = new Date().toLocaleString();

  return (
    <div className="receipt-container hidden print:block text-black bg-white w-[58mm] mx-auto text-xs font-mono p-2">
      <div className="text-center mb-4">
        <h2 className="font-bold text-sm uppercase">Vijaya Products</h2>
        <p className="text-[10px]">123 Market Street, City</p>
        <p className="text-[10px]">GSTIN: 27AABCU9603R1ZX</p>
        <p className="text-[10px] mt-1">Tel: +91 9876543210</p>
      </div>

      <div className="border-t border-b border-black border-dashed py-2 mb-2 text-[10px]">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{date}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Order #:</span>
          <span>{orderId || '0001'}</span>
        </div>
      </div>

      <table className="w-full text-[10px] mb-2">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left font-normal pb-1">Item</th>
            <th className="text-center font-normal pb-1">Qty</th>
            <th className="text-right font-normal pb-1">Amt</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td className="py-1 pr-1 truncate max-w-[30mm]">{item.name}</td>
              <td className="text-center py-1">{item.quantity}</td>
              <td className="text-right py-1">{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-black border-dashed pt-2 text-[10px]">
        <div className="flex justify-between mb-1">
          <span>Subtotal:</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between mb-1">
            <span>Discount:</span>
            <span>-{discount.toFixed(2)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between mb-1">
            <span>CGST/SGST (5%):</span>
            <span>{tax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm mt-2 border-t border-black pt-1">
          <span>TOTAL:</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 text-center text-[10px]">
        <p>Paid via: {paymentMethod.toUpperCase()}</p>
        <p className="mt-2 font-bold">*** THANK YOU ***</p>
        <p className="mt-1">Visit Again!</p>
      </div>
      
      {/* 
        IMPORTANT CSS INJECTION FOR PRINTING
        This ensures the browser formats exactly to 58mm thermal paper 
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 0;
            size: 58mm auto;
          }
          body * {
            visibility: hidden;
          }
          .receipt-container, .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 58mm;
          }
        }
      `}} />
    </div>
  );
}
