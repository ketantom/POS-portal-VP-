import PageLayout from '@/components/layout/PageLayout';
import ProductGrid from '@/components/pos/ProductGrid';
import Cart from '@/components/pos/Cart';

export default function Home() {
  return (
    <PageLayout>
      <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 overflow-hidden h-full pb-16 md:pb-0">
        <ProductGrid />
        <Cart />
      </div>
    </PageLayout>
  );
}
