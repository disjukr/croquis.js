import {EventEmitter} from 'events';
import React, { useState, useEffect, useContext } from 'react';

export interface Hwapan {
  width: number;
  height: number;
  layers: Layer[];
}

export interface Layer {
  name: string;
  canvas: HTMLCanvasElement;
}

export const emptyHwapan: Hwapan = {
  width: 0,
  height: 0,
  layers: [],
};

interface HwapanContextValue {
  emitter: EventEmitter;
  hwapan: Hwapan;
  update: (updateFn: UpdateFn) => void;
}
interface UpdateFn {
  (hwapan: Hwapan): string | undefined;
}
const hwapanContext = React.createContext<HwapanContextValue>(null as any);

interface HwapanProviderProps {
  initialHwapan: Hwapan;
}
export const HwapanProvider: React.FC<HwapanProviderProps> = ({ children }) => {
  const [hcv] = useState(() => {
    const hcv: HwapanContextValue = {
      emitter: new EventEmitter(),
      hwapan: emptyHwapan,
      update: updateFn => {
        const event = updateFn(hcv.hwapan);
        hcv.emitter.emit(event ?? 'update');
      },
    };
    return hcv;
  });
  return <hwapanContext.Provider value={hcv}>{children}</hwapanContext.Provider>;
};

export function useUpdateHwapan(): HwapanContextValue['update'] {
  return useContext(hwapanContext).update;
}

export function useHwapan<T>(selector: (hwapan: Hwapan) => T, event?: string): T {
  const hcv = useContext(hwapanContext);
  const [state, setState] = useState(selector(hcv.hwapan));
  useEffect(() => {
    const e = event ?? 'update';
    const handler = () => {
      const newState = selector(hcv.hwapan);
      if (state !== newState) setState(newState);
    };
    hcv.emitter.addListener(e, handler);
    () => hcv.emitter.removeListener(e, handler);
  }, [hcv.emitter, state]);
  return state;
}
