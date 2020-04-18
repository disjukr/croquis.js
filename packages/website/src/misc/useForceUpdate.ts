import { useState, useRef } from 'react';

export default function useForceUpdate() {
  const [, setCount] = useState(0);
  const state = {
    cnt: 0,
    fn: () => setCount(++state.cnt),
  };
  const ref = useRef(state);
  return ref.current.fn;
}
