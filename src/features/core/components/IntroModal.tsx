import React, { useCallback, useEffect, useState } from 'react';
import { ProgressDots } from './ProgressDots';

interface IntroModalProps {
  onClose: () => void;
}

const slides = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2 1M4 7l2-1M4 7v2.5M12 21v-2.5M12 6l-2-1-2 1M6 17.5v-2.5M18 17.5v-2.5" /></svg>,
    headline: 'Welcome to Investisizer!',
    body: 'Your personal sandbox for financial forecasting. Model investments, properties, and see your entire financial future in one place.',
  },
  {
    headline: 'Powerful, Flexible Analysis',
    body: (
      <ul className="space-y-3 text-left">
        <li className="flex items-start space-x-3">
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <div><span className="font-semibold">Investment Modeling:</span> Project growth for stocks, funds, and savings.</div>
          </>
        </li>
        <li className="flex items-start space-x-3">
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <div><span className="font-semibold">In-Depth Property Analysis:</span> Model mortgages, rental income, and tax-aware sales.</div>
          </>
        </li>
        <li className="flex items-start space-x-3">
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <div><span className="font-semibold">Unified Portfolio View:</span> See how all your assets interact and grow together.</div>
          </>
        </li>
      </ul>
    ),
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    headline: 'Explore a Real-World Scenario',
    body: `We've pre-loaded a "Strategic Investor" portfolio to showcase what's possible. Feel free to change any value or reset it at any time.`,
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    headline: 'Save & Sync (Optional)',
    body: `Want to access your portfolio on other devices? You can create a free, optional account to save and sync your data.`,
  },
];

export const IntroModal: React.FC<IntroModalProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [direction, setDirection] = useState(1);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  }, [currentSlide, handleClose]);

  const handleBack = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handleBack, handleClose]);

  const getBackButtonStyle = () => {
    return `text-xs px-3 py-1 sm:text-sm sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`;
  };

  return (
    <div className={`fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-3/4 transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="relative overflow-x-hidden">
          <div className="min-h-[280px]">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="absolute w-full transition-all duration-300 ease-in-out"
                style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
              >
                <div className="p-6 ">
                  <div className="text-center pb-20">
                    {slide.icon && <div className="flex justify-center mb-4">{slide.icon}</div>}
                    <h2 className="text-2xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">{slide.headline}</h2>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{slide.body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 sm:p-8 pt-0 px-6">
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handleBack}
                className={getBackButtonStyle()}
                disabled={currentSlide === 0}
              >
                Back
              </button>
              <ProgressDots count={slides.length} current={currentSlide} onDotClick={setCurrentSlide} />
              <button
                onClick={handleNext}
                className="text-sm px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {currentSlide === slides.length - 1 ? 'Explore the App' : 'Next'}
              </button>
            </div>
          </div>
        </div>
        <button onClick={handleClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};