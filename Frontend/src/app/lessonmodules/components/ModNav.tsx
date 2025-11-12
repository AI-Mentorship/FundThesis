"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Props = {
  moduleIndex: number;
  totalModules: number;
  title?: string;
};

const ArrowCircle: React.FC<{ disabled?: boolean; direction: 'left'|'right' }> = ({ disabled, direction }) => {
  const cls = `w-10 h-10 rounded-full flex items-center justify-center border ${disabled ? 'bg-gray-100 border-gray-200 text-gray-300' : 'bg-white border-gray-300 text-gray-700 hover:shadow'}`;
  return (
    <div className={cls} aria-hidden>
      {direction === 'left' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )}
    </div>
  );
};

import { getAnsweredCount } from '../data/userProgress';

const ModNav: React.FC<Props> = ({ moduleIndex, totalModules, title }) => {
  const prev = moduleIndex - 1;
  const next = moduleIndex + 1;
  const isFirst = moduleIndex <= 1;
  const isLast = moduleIndex === totalModules;
  const [counts, setCounts] = useState(() => getAnsweredCount(moduleIndex));

  useEffect(() => {
    function onChange() {
      try { setCounts(getAnsweredCount(moduleIndex)); } catch (e) { /* ignore */ }
    }
    // custom event dispatched by userProgress write
    window.addEventListener('ft-progress-changed', onChange);
    // also respond to storage events (other tabs)
    window.addEventListener('storage', onChange);
    // ensure we have the right counts on mount
    onChange();
    return () => {
      window.removeEventListener('ft-progress-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [moduleIndex]);

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-3 py-2 flex items-center justify-between">
        <div>
          {!isFirst ? (
            <Link href={`/lessonmodules/${prev}`} className="inline-flex items-center" aria-label={`Go to module ${prev}`}>
              <ArrowCircle direction="left" />
            </Link>
          ) : (
            <div aria-hidden>
              <ArrowCircle disabled direction="left" />
            </div>
          )}
        </div>

        <div className="text-center flex-1">
          {(() => {
            const label = moduleIndex === totalModules ? 'X' : String(moduleIndex);
            return (
              <>
                <div className="text-sm text-gray-500">{`Module ${label}`}</div>
                <div className="text-lg font-semibold text-gray-900">{title ?? `Module ${label}`}</div>
                <div className="text-sm text-gray-500 mt-1">{`${counts.answered} / ${counts.total}`}</div>
              </>
            );
          })()}
        </div>

        <div>
          {next <= totalModules ? (
            <Link href={`/lessonmodules/${next}`} className="inline-flex items-center" aria-label={`Go to module ${next}`}>
              <ArrowCircle direction="right" />
            </Link>
          ) : (
            <div aria-hidden>
              <ArrowCircle disabled direction="right" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModNav;
