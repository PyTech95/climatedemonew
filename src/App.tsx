import { useState } from 'react';
import { useLenis } from '@/hooks/useLenis';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CustomCursor } from '@/components/CustomCursor';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/sections/Hero';
import { About } from '@/sections/About';
import { Mission } from '@/sections/Mission';
import { Values } from '@/sections/Values';
import { Leadership } from '@/sections/Leadership';
import { Services } from '@/sections/Services';
import { Certifications } from '@/sections/Certifications';
import { Projects } from '@/sections/Projects';
import { Collaborations } from '@/sections/Collaborations';
import { WhyMatters } from '@/sections/WhyMatters';
import { Community } from '@/sections/Community';
import { Contact } from '@/sections/Contact';
import { Footer } from '@/sections/Footer';

function App() {
  const [loaded, setLoaded] = useState(false);
  useLenis(loaded);

  return (
    <>
      <LoadingScreen onComplete={() => setLoaded(true)} />
      <CustomCursor />
      <div className="noise-overlay" />

      <Navigation />

      <main>
        <Hero />
        <About />
        <Mission />
        <Values />
        <Leadership />
        <Services />
        <Certifications />
        <Projects />
        <Collaborations />
        <WhyMatters />
        <Community />
        <Contact />
      </main>

      <Footer />
    </>
  );
}

export default App;
