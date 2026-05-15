import { Routes, Route } from 'react-router';
import { useLenis } from '@/hooks/useLenis';
import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import ScoringEngine from '@/sections/ScoringEngine';
import FeaturedProjects from '@/sections/FeaturedProjects';
import Workflow from '@/sections/Workflow';
import TrustLayer from '@/sections/TrustLayer';
import Pricing from '@/sections/Pricing';
import Footer from '@/sections/Footer';
import DiscoverPage from '@/pages/DiscoverPage';
import ProjectPage from '@/pages/ProjectPage';
import SubmitPage from '@/pages/SubmitPage';
import RubricPage from '@/pages/RubricPage';
import CollectionsPage from '@/pages/CollectionsPage';
import BuilderPage from '@/pages/BuilderPage';
import InfoPage from '@/pages/InfoPage';
import WaitlistPage from '@/pages/WaitlistPage';
import PricingPage from '@/pages/PricingPage';
import SavedPage from '@/pages/SavedPage';
import NotFoundPage from '@/pages/NotFoundPage';

function HomePage() {
  return (
    <>
      <Hero />
      <ScoringEngine />
      <FeaturedProjects />
      <Workflow />
      <TrustLayer />
      <Pricing />
      <Footer />
    </>
  );
}

function App() {
  useLenis();

  return (
    <div style={{ background: '#0B0C0F', minHeight: '100vh' }}>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/rubric" element={<RubricPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/builders/:handle" element={<BuilderPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/waitlist" element={<WaitlistPage />} />
        <Route path="/info/:topic" element={<InfoPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
