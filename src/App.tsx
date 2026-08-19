import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toast } from '@/components/ui/Toast';
import { PWAUpdateNotification } from '@/components/pwa/PWAUpdateNotification';
import { AppLoader } from '@/components/loading/AppLoader';
import { PageTransition } from '@/components/animations/PageTransition';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SpeakersPage from './pages/SpeakersPage';
import NewSpeakerPage from './pages/NewSpeakerPage';
import PodcastsPage from './pages/PodcastsPage';
import NewPodcastPage from './pages/NewPodcastPage';
import PodcastDetailPage from './pages/PodcastDetailPage';
import LandingPage from './pages/LandingPage';
import BillingPage from './pages/BillingPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <PageTransition>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/speakers" element={<SpeakersPage />} />
        <Route path="/dashboard/speakers/new" element={<NewSpeakerPage />} />
        <Route path="/dashboard/podcasts" element={<PodcastsPage />} />
        <Route path="/dashboard/podcasts/new" element={<NewPodcastPage />} />
        <Route path="/dashboard/podcasts/:id" element={<PodcastDetailPage />} />
        <Route path="/dashboard/billing" element={<BillingPage />} />
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(() => {
    return !sessionStorage.getItem('podcraft-loaded');
  });

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  const handleLoaderComplete = () => {
    sessionStorage.setItem('podcraft-loaded', 'true');
    setIsLoading(false);
  };

  if (isLoading) {
    return <AppLoader onComplete={handleLoaderComplete} />;
  }

  return (
    <>
      <AnimatedRoutes />
      <Toast />
      <PWAUpdateNotification />
    </>
  );
}
