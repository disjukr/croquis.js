export interface Canvas2DConfig {
  width: number;
  height: number;
}
export async function createCanvas2D(config: Canvas2DConfig) {
  const result = document.createElement('canvas');
  result.width = config.width;
  result.height = config.height;
  result.getContext('2d');
  return result;
}
