// utils/vote.ts
export function majorityLabel(fake: number, real: number) {
  if (fake === real) return 'Unclear'
  return fake > real ? 'Fake' : 'Real'
}
export function fakePercent(fake: number, real: number) {
  const total = Math.max(1, fake + real)
  return Math.round((fake / total) * 100)
}
