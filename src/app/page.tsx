'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import HeroSection from '@/components/home/HeroSection';
import CraftMarquee from '@/components/home/CraftMarquee';
import CollectionsGrid from '@/components/home/CollectionsGrid';
import OnamCelebration from '@/components/home/OnamCelebration';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import StatementBand from '@/components/home/StatementBand';
import BrandStory from '@/components/home/BrandStory';
import Testimonials from '@/components/home/Testimonials';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <HeroSection />
        <CraftMarquee />
        <CollectionsGrid />
        <OnamCelebration />
        <FeaturedProducts />
        <StatementBand />
        <BrandStory />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
