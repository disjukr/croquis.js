import { useState, useEffect } from 'react';

export default function useLang() {
  const [lang, setLang] = useState('en');
  useEffect(() => {
    setLang(navigator.language);
  }, []);
  return lang;
}
