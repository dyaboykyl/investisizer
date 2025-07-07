import { useState, useEffect } from 'react';
import { MultiAssetCalculator } from '@/features/portfolio/components/MultiAssetCalculator';
import { Layout } from '@/features/core/components/Layout';
import { IntroModal } from '@/features/core/components/IntroModal';

function App() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('investisizer_has_seen_intro');
    if (hasSeenIntro !== 'true') {
      setShowIntro(true);
    }
  }, []);

  const handleCloseIntro = () => {
    setShowIntro(false);
    localStorage.setItem('investisizer_has_seen_intro', 'true');
  };

  return (
    <>
      {showIntro && <IntroModal onClose={handleCloseIntro} />}
      <Layout>
        <MultiAssetCalculator />
      </Layout>
    </>
  );
}

export default App;
