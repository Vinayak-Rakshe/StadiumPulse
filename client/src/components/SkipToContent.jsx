import React from 'react';

const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="absolute top-0 left-0 bg-fifa-gold text-stadium-dark px-4 py-2 font-semibold -translate-y-full focus:translate-y-0 transition-transform duration-200 z-50 skip-to-content focus:outline-none focus:ring-4 focus:ring-amber-500"
    >
      Skip to Main Content
    </a>
  );
};

export default SkipToContent;
