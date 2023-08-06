"use client"
import { useState, useEffect } from 'react';

function useViewport() {
  const windowDefined = typeof window !== 'undefined';
  const [viewport, setViewport] = useState({width: windowDefined ? window.innerWidth : 1000, height: windowDefined ? window.innerHeight : 600});

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleWindowResize = () => {
      setViewport({width: window.innerWidth, height: window.innerHeight});
    }

    // Add event listener for window resize
    window.addEventListener('resize', handleWindowResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []); // Empty array ensures effect is only run on mount and unmount

  return viewport;
}

export default useViewport;
