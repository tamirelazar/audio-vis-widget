import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { Dimensions } from '../types';

export const useWindowSize = (): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const debouncedHandleResize = debounce(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 250);

    window.addEventListener('resize', debouncedHandleResize);
    return () => window.removeEventListener('resize', debouncedHandleResize);
  }, []);

  return dimensions;
}; 