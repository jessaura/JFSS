'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Check if user has already made a decision
    const saved = localStorage.getItem('jf_cookie_consent');
    if (!saved) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom event to open preferences from footer or settings
  useEffect(() => {
    const handleOpen = () => {
      setShowPreferences(true);
      setVisible(true);
    };
    window.addEventListener('jf_open_cookie_preferences', handleOpen);
    return () => window.removeEventListener('jf_open_cookie_preferences', handleOpen);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('jf_cookie_consent', JSON.stringify({ essential: true, analytics: true, marketing: true, timestamp: Date.now() }));
    setVisible(false);
    setShowPreferences(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('jf_cookie_consent', JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: Date.now() }));
    setVisible(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('jf_cookie_consent', JSON.stringify({ essential: true, analytics, marketing, timestamp: Date.now() }));
    setVisible(false);
    setShowPreferences(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <div className="jf-cookie-root" aria-live="polite">
        {/* Main Floating Banner */}
        {!showPreferences ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="jf-cookie-banner"
            role="region"
            aria-label="Cookie Consent Banner"
          >
            <div className="jf-cookie-copy">
              <div className="jf-cookie-title-row">
                <span className="jf-cookie-icon">🍪</span>
                <span className="jf-cookie-heading">Your Privacy &amp; Cookie Preferences</span>
              </div>
              <p className="jf-cookie-desc">
                We use cookies and essential storage to ensure our boutique operates seamlessly, remember your bag, and provide a refined luxury shopping experience. Read our{' '}
                <Link href="/privacy" className="jf-cookie-link">Privacy Policy</Link> and{' '}
                <Link href="/terms" className="jf-cookie-link">Terms</Link>.
              </p>
            </div>

            <div className="jf-cookie-actions">
              <button type="button" onClick={() => setShowPreferences(true)} className="jf-btn-sm jf-cookie-btn-pref">
                Customize
              </button>
              <button type="button" onClick={handleEssentialOnly} className="jf-btn-sm jf-cookie-btn-secondary">
                Essential Only
              </button>
              <button type="button" onClick={handleAcceptAll} className="jf-btn-sm jf-cookie-btn-primary">
                Accept All
              </button>
            </div>
          </motion.div>
        ) : (
          /* Preferences Modal Overlay */
          <div className="jf-cookie-modal-overlay" onClick={() => setShowPreferences(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="jf-cookie-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cookie-pref-title"
            >
              <div className="jf-cookie-modal-head">
                <h2 id="cookie-pref-title">Cookie &amp; Privacy Preferences</h2>
                <button
                  type="button"
                  className="jf-cookie-modal-close"
                  onClick={() => setShowPreferences(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="jf-cookie-modal-body">
                <p className="jf-cookie-modal-intro">
                  Customize which cookies you wish to allow during your visits to JessAura London. You can update these settings at any time.
                </p>

                {/* 1. Essential */}
                <div className="jf-cookie-option">
                  <div className="jf-cookie-opt-text">
                    <h3>Essential &amp; Security Cookies</h3>
                    <p>Required for secure checkout, customer bag persistence, and account authentication.</p>
                  </div>
                  <span className="jf-cookie-always-active">Always Active</span>
                </div>

                {/* 2. Analytics */}
                <div className="jf-cookie-option">
                  <div className="jf-cookie-opt-text">
                    <h3>Performance &amp; Analytics</h3>
                    <p>Allows us to measure site performance, speed, and popular curated collections.</p>
                  </div>
                  <label className="jf-toggle-switch">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      aria-label="Allow performance and analytics cookies"
                    />
                    <span className="jf-toggle-slider" />
                  </label>
                </div>

                {/* 3. Marketing */}
                <div className="jf-cookie-option">
                  <div className="jf-cookie-opt-text">
                    <h3>Personalization &amp; Drop Invitations</h3>
                    <p>Helps tailor private drop previews, seasonal Kerala edits, and bespoke styling advice.</p>
                  </div>
                  <label className="jf-toggle-switch">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      aria-label="Allow personalization and marketing cookies"
                    />
                    <span className="jf-toggle-slider" />
                  </label>
                </div>
              </div>

              <div className="jf-cookie-modal-foot">
                <button type="button" onClick={handleEssentialOnly} className="jf-btn-sm jf-cookie-btn-secondary">
                  Reject Non-Essential
                </button>
                <button type="button" onClick={handleSavePreferences} className="jf-btn-sm jf-cookie-btn-primary">
                  Save My Preferences
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
