import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(
    () => localStorage.getItem('lms_dark_mode') === 'true'
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lms_dark_mode', String(dark));
  }, [dark]);

  const toggle = () => setDark(d => !d);

  return { dark, toggle };
}