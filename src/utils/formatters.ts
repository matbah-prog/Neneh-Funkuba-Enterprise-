export function formatLeone(amount: number): string {
  const rounded = Math.round(amount);
  return `Le ${new Intl.NumberFormat('en-US').format(rounded)}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}
