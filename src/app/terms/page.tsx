'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

export default function TermsPage() {
  const lastUpdated = 'September 2, 2026';

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="jf-legal-page">
        {/* Masthead */}
        <section className="jf-legal-masthead">
          <div className="container">
            <nav className="wk-crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Terms of Service</span>
            </nav>
            <div className="jf-legal-head-content">
              <span className="jf-legal-eyebrow">TERMS &amp; CONDITIONS</span>
              <h1 className="jf-legal-title">Terms of Service</h1>
              <p className="jf-legal-subtitle">
                Please review the terms and conditions governing your purchases, orders, and interactions with JessAura London.
              </p>
              <div className="jf-legal-meta">
                <span>Last Updated: {lastUpdated}</span>
                <span>·</span>
                <span>Governing Law: England &amp; Wales</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="jf-legal-body-section">
          <div className="container">
            <div className="jf-legal-layout">
              {/* Quick Table of Contents Sticky Sidebar */}
              <aside className="jf-legal-sidebar">
                <nav className="jf-legal-toc" aria-label="Table of Contents">
                  <h2 className="jf-toc-title">Terms Overview</h2>
                  <ul className="jf-toc-list">
                    <li><a href="#acceptance">1. Acceptance of Terms</a></li>
                    <li><a href="#craftsmanship">2. Craftsmanship &amp; Fabrics</a></li>
                    <li><a href="#pricing">3. Orders, Pricing &amp; Currency</a></li>
                    <li><a href="#shipping">4. Shipping &amp; Delivery</a></li>
                    <li><a href="#returns">5. Returns, Exchanges &amp; Refunds</a></li>
                    <li><a href="#ip">6. Intellectual Property</a></li>
                    <li><a href="#liability">7. Limitation of Liability</a></li>
                    <li><a href="#governing-law">8. Governing Law</a></li>
                  </ul>
                  <div className="jf-toc-action-box">
                    <p className="jf-toc-action-text">Questions regarding an order or custom request?</p>
                    <a href="mailto:concierge@jessaura.co.uk" className="jf-btn-sm jf-btn-primary">
                      Contact Concierge
                    </a>
                  </div>
                </nav>
              </aside>

              {/* Main Terms Content */}
              <article className="jf-legal-article">
                <section id="acceptance" className="jf-legal-block">
                  <h2>1. Acceptance of Terms</h2>
                  <p>
                    These Terms of Service (<em>“Terms”</em>) constitute a legally binding agreement between you and <strong>JessAura London Ltd</strong> (<em>“JessAura”</em>, <em>“we”</em>, <em>“us”</em>). By accessing our website, placing an order, or registering an account at <Link href="/">jessaura.co.uk</Link>, you agree to be bound by these Terms.
                  </p>
                </section>

                <section id="craftsmanship" className="jf-legal-block">
                  <h2>2. Craftsmanship, Sizing &amp; Natural Fabrics</h2>
                  <p>
                    JessAura specializes in artisanal South Asian fashion and contemporary silhouettes crafted from <strong>100% pure slub linen</strong>, breathable organic cottons, Kasavu gold handlooms, and traditional silks.
                  </p>
                  <ul>
                    <li>
                      <strong>Handcrafted Variations:</strong> Because our pieces are hand-painted, hand-embroidered, and woven on traditional looms, subtle variations in texture, yarn slubs, and dye tonality are natural hallmarks of bespoke artisan craftsmanship rather than defects.
                    </li>
                    <li>
                      <strong>Sizing &amp; Colors:</strong> We provide detailed measurements on each product page. While we strive to display colors as accurately as possible, slight display variations may occur across different digital screens.
                    </li>
                  </ul>
                </section>

                <section id="pricing" className="jf-legal-block">
                  <h2>3. Orders, Pricing &amp; Currency</h2>
                  <p>
                    All prices are displayed in <strong>British Pounds (£ GBP)</strong> and include applicable UK taxes unless stated otherwise.
                  </p>
                  <ul>
                    <li>
                      <strong>Order Acceptance:</strong> When you place an order, you will receive an automatic order acknowledgment. Order acceptance and formation of the contract occur upon dispatch of your pieces.
                    </li>
                    <li>
                      <strong>Payment Security:</strong> Payments are processed via encrypted, certified payment gateways (including Stripe, Apple Pay, and PayPal). Your card is charged upon order placement.
                    </li>
                    <li>
                      <strong>Price Errors:</strong> In the rare event of an obvious technical pricing error, we reserve the right to cancel the order and issue an immediate full refund.
                    </li>
                  </ul>
                </section>

                <section id="shipping" className="jf-legal-block">
                  <h2>4. Shipping &amp; Delivery</h2>
                  <p>
                    We dispatch all orders via tracked, insured courier services with signature options where applicable.
                  </p>
                  <ul>
                    <li>
                      <strong>United Kingdom:</strong> Complimentary standard tracked delivery on all UK orders over £50. Standard delivery typically takes 2–4 business days; express delivery takes 1–2 business days.
                    </li>
                    <li>
                      <strong>International Deliveries:</strong> Available worldwide with estimated delivery within 5–10 business days. International orders may be subject to local import duties and taxes, which are the responsibility of the recipient.
                    </li>
                  </ul>
                </section>

                <section id="returns" className="jf-legal-block">
                  <h2>5. Returns, Exchanges &amp; 14-Day Guarantee</h2>
                  <p>
                    We want you to love your JessAura pieces. Under the UK Consumer Contracts Regulations 2013, you have <strong>14 days</strong> from the date of receipt to request a return or exchange.
                  </p>
                  <ul>
                    <li>
                      <strong>Condition:</strong> Items must be returned in their original condition: unworn, unwashed, with all designer tags and hygiene seals intact.
                    </li>
                    <li>
                      <strong>Hygiene Exclusions:</strong> For hygiene reasons, pierced jewellery cannot be returned unless verified as defective upon arrival.
                    </li>
                    <li>
                      <strong>Refund Processing:</strong> Approved refunds will be credited back to your original payment method within 3–5 business days of inspection.
                    </li>
                  </ul>
                </section>

                <section id="ip" className="jf-legal-block">
                  <h2>6. Intellectual Property</h2>
                  <p>
                    All intellectual property rights in this website, including the <em>JessAura</em> brand name, trademarked peacock monogram, artistic patterns, lookbook photography, editorial text, and software code, are the exclusive property of JessAura London Ltd. Reproduction without prior written authorization is strictly prohibited.
                  </p>
                </section>

                <section id="liability" className="jf-legal-block">
                  <h2>7. Limitation of Liability</h2>
                  <p>
                    To the fullest extent permitted by applicable law, JessAura London shall not be liable for indirect, incidental, or consequential damages resulting from the use or inability to use our services or products. Nothing in these Terms excludes or limits our liability for death or personal injury arising from negligence or fraud.
                  </p>
                </section>

                <section id="governing-law" className="jf-legal-block">
                  <h2>8. Governing Law &amp; Dispute Resolution</h2>
                  <p>
                    These Terms and any disputes arising out of or related to your purchase shall be governed by and construed in accordance with the <strong>laws of England and Wales</strong>. You agree to submit to the exclusive jurisdiction of the English courts.
                  </p>
                  <div className="jf-legal-contact-card">
                    <h3>JessAura Legal &amp; Client Inquiries</h3>
                    <p><strong>Email:</strong> <a href="mailto:concierge@jessaura.co.uk">concierge@jessaura.co.uk</a></p>
                    <p><strong>Headquarters:</strong> London, United Kingdom</p>
                  </div>
                </section>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
