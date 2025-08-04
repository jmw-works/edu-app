import { useState, useEffect, RefObject } from 'react';

export function useHeaderHeight(ref: RefObject<HTMLElement>, defaultHeight = 60) {
  const [headerHeight, setHeaderHeight] = useState(defaultHeight);

  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        setHeaderHeight(ref.current.offsetHeight);
      }
    };

    updateHeight();

    const observer = new MutationObserver(updateHeight);
    if (ref.current) {
      observer.observe(ref.current, { childList: true, subtree: true, attributes: true });
    }

    window.addEventListener('resize', updateHeight);
    window.addEventListener('load', updateHeight);

    const interval = setInterval(updateHeight, 200);
    const timeout = setTimeout(() => clearInterval(interval), 2000);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('load', updateHeight);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [ref]);

  return headerHeight;
}

