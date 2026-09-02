'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const ONBOARDING_STEPS = [
  {
    step: 1,
    eyebrow: 'WELCOME TO JESSAURA',
    title: 'Modern South Asian Dailywear',
    description:
      'Where rich South Asian textile heritage meets London everyday elegance. Crafted in 100% pure slub linen, organic cottons, and Kasavu gold handlooms.',
    badge: '🌿 100% PURE ARTISANAL LINEN',
    image: '/images/hero-casual.png',
  },
  {
    step: 2,
    eyebrow: 'THE 7 ATELIER DEPARTMENTS',
    title: 'Curated For Every Occasion',
    description:
      'Explore hand-painted floral kurtis, tailored embroidered blouses, statement jewellery, Kerala Kasavu sarees, relaxed shirts, winter knits, and gentle kids sets.',
    badge: '✨ 7 SPECIALTY DEPARTMENTS',
    image: '/images/festive-collection.png',
  },
  {
    step: 3,
    eyebrow: 'YOUR CLIENT PRIVILEGE',
    title: 'Enjoy 10% Off Your First Order',
    description:
      'Use code WELCOME10 at checkout to enjoy 10% off across all full-priced artisanal pieces, with complimentary tracked delivery on UK orders over £50.',
    badge: '🎁 CODE: WELCOME10',
    image: '/images/womens-collection.png',
    code: 'WELCOME10',
  },
];

export default function WelcomeOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if user has already seen the onboarding
    const seen = localStorage.getItem('jf_onboarding_completed');
    if (!seen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom event to reopen anytime from footer/account
  useEffect(() => {
    const handleReopen = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener('jf_open_onboarding', handleReopen);
    return () => window.removeEventListener('jf_open_onboarding', handleReopen);
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('jf_onboarding_completed', 'true');
    setIsOpen(false);
  };

  const handleCopyCode = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText('WELCOME10');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  const stepData = ONBOARDING_STEPS[currentStep];

  return (
    <AnimatePresence>
      <div className="jf-onboarding-overlay" onClick={handleComplete}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="jf-onboarding-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to JessAura Onboarding Guide"
        >
          {/* Close Button */}
          <button
            type="button"
            className="jf-onboarding-close"
            onClick={handleComplete}
            aria-label="Close Welcome Guide"
          >
            ✕
          </button>

          {/* Progress Indicators */}
          <div className="jf-onboarding-progress" aria-label={`Step ${currentStep + 1} of ${ONBOARDING_STEPS.length}`}>
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`jf-onboarding-bar ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                onClick={() => setCurrentStep(idx)}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="jf-onboarding-content-grid">
            {/* Left/Top Media Preview */}
            <div className="jf-onboarding-media">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stepData.step}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="jf-onboarding-img-wrap"
                >
                  <img src={stepData.image} alt={stepData.title} className="jf-onboarding-img" />
                  <span className="jf-onboarding-badge">{stepData.badge}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right/Bottom Narrative & Controls */}
            <div className="jf-onboarding-narrative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stepData.step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="jf-onboarding-eyebrow">{stepData.eyebrow}</span>
                  <h2 className="jf-onboarding-title">{stepData.title}</h2>
                  <p className="jf-onboarding-desc">{stepData.description}</p>

                  {/* Step 3 Promo Code Box */}
                  {stepData.code && (
                    <div className="jf-onboarding-code-box">
                      <div className="jf-onboarding-code-text">
                        <span className="jf-onboarding-code-label">PROMO CODE</span>
                        <strong className="jf-onboarding-code-val">{stepData.code}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="jf-btn-sm jf-btn-primary jf-onboarding-copy-btn"
                      >
                        {copied ? 'Copied ✓' : 'Copy Code'}
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="jf-onboarding-actions">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="jf-btn-sm jf-btn-secondary"
                  >
                    Back
                  </button>
                )}
                {currentStep < ONBOARDING_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="jf-btn-sm jf-btn-primary"
                    style={{ flex: 1 }}
                  >
                    Continue
                  </button>
                ) : (
                  <Link
                    href="/shop"
                    onClick={handleComplete}
                    className="jf-btn-sm jf-btn-primary"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    Start Exploring The Collection →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
