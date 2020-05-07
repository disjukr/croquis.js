export interface Lfsr113State {
  a: number;
  b: number;
  c: number;
  d: number;
}

export function getInitialState(seed: number = 0): Lfsr113State {
  const IA = 16807;
  const IM = 2147483647;
  const IQ = 127773;
  const IR = 2836;
  let a: number, b: number, c: number, d: number, e: number;
  let s = seed | 0;
  if (s <= 0) s = 1;
  e = (s / IQ) | 0;
  s = (((IA * (s - ((e * IQ) | 0))) | 0) - ((IR * e) | 0)) | 0;
  if (s < 0) s = (s + IM) | 0;
  if (s < 2) a = (s + 2) | 0;
  else a = s;
  e = (s / IQ) | 0;
  s = (((IA * (s - ((e * IQ) | 0))) | 0) - ((IR * e) | 0)) | 0;
  if (s < 0) s = (s + IM) | 0;
  if (s < 8) b = (s + 8) | 0;
  else b = s;
  e = (s / IQ) | 0;
  s = (((IA * (s - ((e * IQ) | 0))) | 0) - ((IR * e) | 0)) | 0;
  if (s < 0) s = (s + IM) | 0;
  if (s < 16) c = (s + 16) | 0;
  else c = s;
  e = (s / IQ) | 0;
  s = (((IA * (s - ((e * IQ) | 0))) | 0) - ((IR * e) | 0)) | 0;
  if (s < 0) s = (s + IM) | 0;
  if (s < 128) d = (s + 128) | 0;
  else d = s;
  return { a, b, c, d };
}

export default function* lfsr113(state: Lfsr113State = getInitialState(0)) {
  const s = state;
  while (true) {
    let f = ((s.a << 6) ^ s.a) >> 13;
    s.a = ((s.a & 4294967294) << 18) ^ f;
    f = ((s.b << 2) ^ s.b) >> 27;
    s.b = ((s.b & 4294967288) << 2) ^ f;
    f = ((s.c << 13) ^ s.c) >> 21;
    s.c = ((s.c & 4294967280) << 7) ^ f;
    f = ((s.d << 3) ^ s.d) >> 12;
    s.d = ((s.d & 4294967168) << 13) ^ f;
    yield (s.a ^ s.b ^ s.c ^ s.d) * 2.3283064365386963e-10 + 0.5;
  }
}
