'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { anyApi } from 'convex/server';

const DEFAULT_WHATSAPP = '+44 7909707271';

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const settings = useQuery(anyApi.settings.get) as { whatsappNumber?: string } | null | undefined;

  const rawPhone = settings?.whatsappNumber || DEFAULT_WHATSAPP;
  const digits = rawPhone.replace(/\D/g, '');
  const greeting = encodeURIComponent('Hello JessAura, I have an enquiry regarding your collection.');
  const waUrl = `https://wa.me/${digits}?text=${greeting}`;

  return (
    <aside aria-label="Customer Support" className="jf-wa-floating-wrap">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="jf-wa-floating-btn"
        aria-label="Chat with JessAura Concierge on WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Pulsing ring */}
        <span className="jf-wa-pulse-ring" aria-hidden="true" />

        {/* WhatsApp Icon */}
        <svg
          className="jf-wa-icon"
          viewBox="0 0 32 32"
          fill="currentColor"
          width="28"
          height="28"
          aria-hidden="true"
        >
          <path d="M16.002 2C8.28 2 2.02 8.26 2.02 15.98c0 2.65.74 5.23 2.14 7.48L2 30.01l6.75-2.11c2.16 1.29 4.65 1.98 7.25 1.98 7.72 0 13.98-6.26 13.98-13.98S23.722 2 16.002 2zm0 25.54c-2.3 0-4.52-.63-6.46-1.82l-.46-.28-4.32 1.35 1.37-4.21-.3-.48c-1.32-2.07-2.01-4.48-2.01-6.98 0-6.47 5.27-11.74 11.74-11.74 6.47 0 11.74 5.27 11.74 11.74 0 6.47-5.27 11.74-11.74 11.74zm6.75-8.58c-.37-.18-2.18-1.08-2.52-1.2-.34-.12-.59-.18-.84.18-.25.37-.97 1.2-1.18 1.45-.22.25-.43.28-.8.09-.37-.18-1.57-.58-2.99-1.84-1.1-0.98-1.84-2.19-2.06-2.56-.22-.37-.02-.57.16-.75.16-.16.37-.43.55-.65.18-.22.25-.37.37-.62.12-.25.06-.46-.03-.65-.09-.18-.84-2.03-1.15-2.77-.3-.72-.61-.62-.84-.63-.22-.01-.46-.01-.71-.01-.25 0-.65.09-.99.46-.34.37-1.3 1.27-1.3 3.1 0 1.83 1.33 3.6 1.52 3.85.18.25 2.62 4 6.35 5.61.89.38 1.58.61 2.12.78.89.28 1.7.24 2.34.15.72-.11 2.18-.89 2.49-1.75.31-.86.31-1.6.22-1.75-.09-.16-.34-.25-.71-.44z" />
        </svg>

        {/* Text pill tooltip */}
        <span className={`jf-wa-label ${isHovered ? 'jf-wa-label-show' : ''}`}>
          <span className="jf-wa-label-dot" />
          Chat with Concierge
        </span>
      </a>
    </aside>
  );
}
