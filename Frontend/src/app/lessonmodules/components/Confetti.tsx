"use client";
import React, { useEffect } from 'react';

const Confetti: React.FC = () => {
  useEffect(() => {
  const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.overflow = 'hidden';
  container.style.zIndex = '9999';
    document.body.appendChild(container);

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    const pieces: HTMLDivElement[] = [];

    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.width = '8px';
      el.style.height = '12px';
      el.style.background = colors[i % colors.length];
      el.style.left = Math.random() * 100 + '%';
      el.style.top = '-10%';
      el.style.opacity = '0.95';
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      el.style.borderRadius = '2px';
      el.style.transition = 'transform 1.8s cubic-bezier(.2,.9,.3,1), top 1.8s cubic-bezier(.2,.9,.3,1), opacity 1.8s linear';
      container.appendChild(el);
      pieces.push(el);
      // animate
      requestAnimationFrame(() => {
        // random horizontal drift using translateX and fall using top
        const drift = (Math.random() - 0.5) * 20; // px
        el.style.transform = `translateX(${drift}px) rotate(${Math.random() * 720}deg)`;
        el.style.top = (110 + Math.random() * 40) + '%';
        el.style.opacity = '0';
      });
    }

    const cleanup = () => {
      pieces.forEach(p => p.remove());
      container.remove();
    };

    const t = setTimeout(cleanup, 2200);
    return () => { clearTimeout(t); cleanup(); };
  }, []);

  return null;
};

export default Confetti;
