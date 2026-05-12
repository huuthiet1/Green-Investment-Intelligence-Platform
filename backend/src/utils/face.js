export function euclideanDistance(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 999;
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

export function faceConfidenceFromDistance(distance) {
  const confidence = Math.max(0, 1 - distance) * 100;
  return Number(confidence.toFixed(2));
}
