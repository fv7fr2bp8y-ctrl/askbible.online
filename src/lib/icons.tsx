/** Малки inline SVG икони за категориите — споделени между Landing и BibleApp. */
export function IconBook() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6v14" />
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v14H6.5A2.5 2.5 0 0 0 4 19.5z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v14h5.5a2.5 2.5 0 0 1 2.5 2.5z" />
    </svg>
  )
}
export function IconHarp() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3v14a3 3 0 0 0 3 3" />
      <path d="M19 3C13 6 9 11 8 20" />
      <path d="M5 3h14" />
      <path d="M9 6v9M13 6v6" />
    </svg>
  )
}
export function IconScroll() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h11a2 2 0 0 1 2 2v1H8" />
      <path d="M8 7v11a2 2 0 0 1-2 2 2 2 0 0 1-2-2V6a2 2 0 0 1 2-2" />
      <path d="M19 7v11a2 2 0 0 1-2 2H6" />
      <path d="M11 11h5M11 14h5" />
    </svg>
  )
}
export function IconFlame() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 0-2-.5-3 2 1.5 3.5 4 3.5 6.5a5 5 0 0 1-10 0C7 10 10 8 12 3z" />
    </svg>
  )
}
export function IconDove() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8c4 0 6 3 9 3 4 0 7-3 9-6-1 6-4 10-9 10-3 0-4-2-6-2s-3 1-3 1z" />
      <path d="M12 11v5" />
    </svg>
  )
}
export function IconStar({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#d7b06c" style={{ opacity: 0.9 }}>
      <path d="M12 2l2.4 6.9H22l-6 4.4 2.3 7-6.3-4.6L5.7 20l2.3-7-6-4.4h7.6z" />
    </svg>
  )
}
