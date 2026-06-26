
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "You are a masterpiece.",
  "Bring your magic.",
  "Imagine without fear.",
  "Write your story.",
  "It's all within you.",
  "Reinvent yourself.",
  "No limits.",
  "Become you.",
  "You are enough.",
  "Dream big."
];

const Affirmations: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % MESSAGES.length);
        setFade(true);
      }, 1000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-12 right-12 pointer-events-none select-none z-0">
      <div 
        className={`transition-all duration-2000 transform text-right ${fade ? 'opacity-10 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        <h2 className="text-4xl font-black uppercase tracking-[0.4em] shimmer-text leading-tight">
          {MESSAGES[index]}
        </h2>
      </div>
    </div>
  );
};

export default Affirmations;
