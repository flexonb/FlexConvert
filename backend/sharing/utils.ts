export function generateShareId(): string {
  // Generate a URL-safe random ID
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function buildShareUrl(shareId: string): string {
  // This would be the frontend URL in production
  // For now, return a placeholder that the frontend can replace
  return `${process.env.FRONTEND_URL || 'http://localhost:4000'}/share/${shareId}`;
}
