'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { useStore } from '@/store/store';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const catalogue = useCatalogue();
  const { openQuickView } = useStore();

  useEffect(() => {
    if (catalogue.length > 0) {
      const product = catalogue.find((p) => p.id === id || p.slug === id);
      if (product) {
        openQuickView(product);
      }
      router.replace('/shop');
    }
  }, [id, catalogue, openQuickView, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary, #FAF7F2)' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-secondary, #78716C)' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 12 }}>Loading Product Details...</p>
      </div>
    </div>
  );
}
