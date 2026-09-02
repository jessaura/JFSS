'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

export default function PrivacyPage() {
  const lastUpdated = 'September 2, 2026';

  const openCookiePreferences = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('jf_open_cookie_preferences'));
    }
  };

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
              <span>Privacy Policy</span>
            </nav>
            <div className="jf-legal-head-content">
              <span className="jf-legal-eyebrow">LEGAL &amp; DATA PRIVACY</span>
              <h1 className="jf-legal-title">Privacy Policy</h1>
              <p className="jf-legal-subtitle">
                How JessAura London collects, uses, and safeguards your personal information in compliance with the UK GDPR and Data Protection Act 2018.
              </p>
              <div className="jf-legal-meta">
                <span>Last Updated: {lastUpdated}</span>
                <span>·</span>
                <span>Jurisdiction: United Kingdom</span>
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
                  <h2 className="jf-toc-title">Contents</h2>
                  <ul className="jf-toc-list">
                    <li><a href="#overview">1. Overview &amp; Data Controller</a></li>
                    <li><a href="#data-collection">2. Personal Data We Collect</a></li>
                    <li><a href="#data-usage">3. How We Use Your Data</a></li>
                    <li><a href="#legal-basis">4. Legal Grounds for Processing</a></li>
                    <li><a href="#third-parties">5. Third-Party Sharing</a></li>
                    <li><a href="#cookies">6. Cookies &amp; Tracking</a></li>
                    <li><a href="#your-rights">7. Your GDPR Rights</a></li>
                    <li><a href="#security">8. Security &amp; Retention</a></li>
                    <li><a href="#contact">9. Data Concierge &amp; Inquiries</a></li>
                  </ul>
                  <div className="jf-toc-action-box">
                    <p className="jf-toc-action-text">Manage your browser cookie consent anytime:</p>
                    <button type="button" onClick={openCookiePreferences} className="jf-btn-sm jf-btn-secondary">
                      Cookie Preferences
                    </button>
                  </div>
                </nav>
              </aside>

              {/* Main Policy Content */}
              <article className="jf-legal-article">
                <section id="overview" className="jf-legal-block">
                  <h2>1. Overview &amp; Data Controller</h2>
                  <p>
                    Welcome to <strong>JessAura London</strong> (<em>“JessAura”</em>, <em>“we”</em>, <em>“us”</em>, or <em>“our”</em>). We are committed to protecting the privacy, dignity, and personal data of every client who visits our digital boutique at <Link href="/">jessaura.co.uk</Link>.
                  </p>
                  <p>
                    For the purposes of the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018, the data controller responsible for your personal information is <strong>JessAura London Ltd</strong>, registered in the United Kingdom.
                  </p>
                </section>

                <section id="data-collection" className="jf-legal-block">
                  <h2>2. Personal Data We Collect</h2>
                  <p>We may collect and process the following categories of personal information:</p>
                  <ul>
                    <li>
                      <strong>Identity &amp; Contact Data:</strong> Name, delivery and billing address, email address, and contact telephone number when you place an order or create an account.
                    </li>
                    <li>
                      <strong>Transaction &amp; Order Data:</strong> Details of the pieces you purchase, sizes, bespoke order instructions, order timestamps, fulfillment status, and returns records.
                    </li>
                    <li>
                      <strong>Payment Information:</strong> All payment transactions are encrypted and processed through certified Tier-1 payment partners (such as Stripe, Apple Pay, and PayPal). <em>JessAura never stores your full credit or debit card numbers on our servers.</em>
                    </li>
                    <li>
                      <strong>Account &amp; Preference Data:</strong> Login credentials managed securely via Clerk, saved shipping addresses, saved wishlist items, and marketing communication preferences.
                    </li>
                    <li>
                      <strong>Technical &amp; Browsing Data:</strong> IP address, browser type and version, device identifier, time zone setting, operating system, and pages viewed during your visit.
                    </li>
                  </ul>
                </section>

                <section id="data-usage" className="jf-legal-block">
                  <h2>3. How We Use Your Data</h2>
                  <p>Your personal data is processed for the following legitimate purposes:</p>
                  <ul>
                    <li><strong>Order Fulfilment:</strong> Processing your purchases, arranging delivery via tracked courier (e.g., Royal Mail, DPD), and sending order confirmation and dispatch updates.</li>
                    <li><strong>Customer Concierge:</strong> Answering sizing questions, fabric care advice, exchange requests, and order inquiries via email and WhatsApp.</li>
                    <li><strong>Account Management:</strong> Allowing registered clients to view past orders, track deliveries, save multiple delivery addresses, and manage their personal wishlists.</li>
                    <li><strong>Marketing &amp; Private Drop Previews:</strong> Delivering curated newsletter updates, seasonal Kerala edit drops, and exclusive invitations only where you have explicitly opted in.</li>
                    <li><strong>Security &amp; Fraud Prevention:</strong> Protecting our store and clients against fraudulent transactions, unauthorized access, and cyber threats.</li>
                  </ul>
                </section>

                <section id="legal-basis" className="jf-legal-block">
                  <h2>4. Legal Grounds for Processing</h2>
                  <p>Under UK data protection laws, we only process your personal data when we have a lawful basis:</p>
                  <ul>
                    <li><strong>Contractual Necessity:</strong> To fulfill our contract with you when you purchase pieces from our store.</li>
                    <li><strong>Consent:</strong> Where you have provided clear consent (for example, subscribing to our VIP newsletter or accepting marketing cookies). You may withdraw consent at any time.</li>
                    <li><strong>Legitimate Interests:</strong> To improve our website performance, understand client browsing preferences, and ensure store security.</li>
                    <li><strong>Legal Obligation:</strong> To comply with financial accounting, VAT record-keeping, and legal requirements.</li>
                  </ul>
                </section>

                <section id="third-parties" className="jf-legal-block">
                  <h2>5. Third-Party Sharing</h2>
                  <p>
                    We never sell, rent, or trade your personal data. We only share essential information with trusted service partners who assist us in operating our boutique:
                  </p>
                  <ul>
                    <li><strong>Logistics &amp; Delivery Couriers:</strong> Royal Mail, DPD, DHL, and local parcel carriers to deliver your orders.</li>
                    <li><strong>Payment Processors:</strong> Stripe, Apple Pay, Google Pay, and PayPal for PCI-DSS compliant secure checkout.</li>
                    <li><strong>Cloud Infrastructure &amp; Database:</strong> Convex Cloud and Vercel for fast, encrypted cloud database and website hosting.</li>
                    <li><strong>Authentication Services:</strong> Clerk for enterprise-grade encrypted user login and multi-factor security.</li>
                  </ul>
                </section>

                <section id="cookies" className="jf-legal-block">
                  <h2>6. Cookies &amp; Tracking Technologies</h2>
                  <p>
                    Cookies are small text files stored on your device that help our website function efficiently and remember your preferences.
                  </p>
                  <ul>
                    <li><strong>Essential Cookies:</strong> Required for fundamental site functions, such as your shopping bag, secure checkout, and active login session.</li>
                    <li><strong>Performance &amp; Analytics Cookies:</strong> Help us understand which collection pages are most visited so we can refine our client experience.</li>
                    <li><strong>Preference Cookies:</strong> Remember your currency and layout preferences.</li>
                  </ul>
                  <p>
                    You can adjust your cookie settings at any time by clicking the button below or managing your browser preferences.
                  </p>
                  <button type="button" onClick={openCookiePreferences} className="jf-btn jf-btn-secondary" style={{ marginTop: '8px' }}>
                    Open Cookie Preferences
                  </button>
                </section>

                <section id="your-rights" className="jf-legal-block">
                  <h2>7. Your GDPR Rights (Registered &amp; Guest Users)</h2>
                  <p>Under the UK and EU GDPR, you have the following rights regarding your personal information:</p>
                  <ul>
                    <li><strong>Right of Access:</strong> You can request a copy of the personal data we hold about you.</li>
                    <li><strong>Right to Rectification:</strong> You can correct or update inaccurate personal details directly in your <Link href="/account/settings">Account Settings</Link> or by contacting us.</li>
                    <li><strong>Right to Erasure (Right to be Forgotten):</strong> You can request the deletion of your account and personal data from our systems.</li>
                    <li><strong>Right to Data Portability:</strong> You can request your account details and order records in a machine-readable format.</li>
                    <li><strong>Right to Withdraw Consent:</strong> You can opt out of marketing communications at any time with one click in the email footer or in your account preferences.</li>
                  </ul>
                  <p>
                    To exercise any of these rights, registered clients can visit <Link href="/account/settings">Account Settings</Link> or contact our Data Protection Concierge at <a href="mailto:concierge@jessaura.co.uk">concierge@jessaura.co.uk</a>.
                  </p>
                </section>

                <section id="security" className="jf-legal-block">
                  <h2>8. Security &amp; Data Retention</h2>
                  <p>
                    We maintain strict technical and organizational safeguards to protect your personal data against unauthorized disclosure, alteration, or loss. All traffic is encrypted over 256-bit SSL/TLS.
                  </p>
                  <p>
                    We retain personal transaction records only as long as necessary to fulfill the purposes for which they were collected, including statutory UK tax and warranty obligations (typically 6 years for accounting compliance).
                  </p>
                </section>

                <section id="contact" className="jf-legal-block">
                  <h2>9. Data Concierge &amp; Inquiries</h2>
                  <p>If you have any questions about this Privacy Policy or wish to exercise your data rights, please reach out to us:</p>
                  <div className="jf-legal-contact-card">
                    <h3>JessAura Client Care &amp; Data Privacy</h3>
                    <p><strong>Email:</strong> <a href="mailto:concierge@jessaura.co.uk">concierge@jessaura.co.uk</a></p>
                    <p><strong>Location:</strong> London, United Kingdom</p>
                    <p><strong>Website:</strong> <Link href="/">www.jessaura.co.uk</Link></p>
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
