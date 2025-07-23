import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const marketingSteps = [
    {
      icon: '🕉️',
      title: 'Ganpati Collection Game',
      subtitle: 'Collect All 8 Sacred Ashtavinayak Avatars',
      color: '#ff6600'
    },
    {
      icon: '🎫',
      title: 'Daily Scratch Cards',
      subtitle: 'Get Your Chance Every Day to Win Rare Avatars',
      color: '#ffcc33'
    },
    {
      icon: '🏆',
      title: 'Compete & Win',
      subtitle: 'Climb the Leaderboard & Become Champion',
      color: '#ff3300'
    },
    {
      icon: '⭐',
      title: 'Powered by Orion Stars',
      subtitle: 'Supported by Sandeep CHSL',
      color: '#ffd700'
    }
  ];

  useEffect(() => {
    // Show content after initial load
    const showTimer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    // Progress through marketing steps
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < marketingSteps.length - 1) {
          return prev + 1;
        } else {
          // Complete splash screen
          setTimeout(() => {
            onComplete();
          }, 2000);
          return prev;
        }
      });
    }, 2500);

    return () => {
      clearTimeout(showTimer);
      clearInterval(stepTimer);
    };
  }, [onComplete]);

  return (
    <div className="splash-screen">
      {/* Animated Background */}
      <div className="splash-bg">
        <div className="floating-elements">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="floating-element"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {['🕉️', '🐘', '🙏', '💎', '🌟'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`splash-content ${showContent ? 'show' : ''}`}>
        {/* Large Ganpati Icon */}
        <div className="splash-main-icon">
          <div className="ganpati-icon-large">
            🕉️
          </div>
          <div className="icon-glow"></div>
        </div>

        {/* Marketing Content */}
        <div className="marketing-content">
          <div 
            className="marketing-step"
            style={{ color: marketingSteps[currentStep].color }}
          >
            <div className="step-icon">
              {marketingSteps[currentStep].icon}
            </div>
            <h1 className="step-title">
              {marketingSteps[currentStep].title}
            </h1>
            <p className="step-subtitle">
              {marketingSteps[currentStep].subtitle}
            </p>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="progress-dots">
          {marketingSteps.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index <= currentStep ? 'active' : ''}`}
              style={{
                backgroundColor: index <= currentStep ? marketingSteps[currentStep].color : '#e9ecef'
              }}
            />
          ))}
        </div>

        {/* Loading Animation */}
        <div className="loading-section">
          <div className="loading-text">Loading Festival Magic...</div>
          <div className="loading-bar">
            <div 
              className="loading-progress"
              style={{
                width: `${((currentStep + 1) / marketingSteps.length) * 100}%`,
                backgroundColor: marketingSteps[currentStep].color
              }}
            />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="decorative-corners">
        <div className="corner top-left">🎊</div>
        <div className="corner top-right">🎉</div>
        <div className="corner bottom-left">✨</div>
        <div className="corner bottom-right">🌟</div>
      </div>
    </div>
  );
};

export default SplashScreen;