import React from 'react';

const Confetti: React.FC<{ active?: boolean }> = ({ active = false }) => {
  if (!active) return null;

  const pieces = Array.from({ length: 18 }).map((_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * 80,
    emoji: ['🎉', '✨', '🎊', '💥'][i % 4]
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{ left: `${p.left}%`, top: `${p.top}%`, position: 'absolute', transform: 'translate(-50%, -50%)', fontSize: 22 }}>
          {p.emoji}
        </div>
      ))}
    </div>
  );
};

export default Confetti;
