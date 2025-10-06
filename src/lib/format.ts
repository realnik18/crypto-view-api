/**
 * Formatting utilities for crypto dashboard
 */

export function formatCurrency(value: number, decimals = 2): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(decimals)}K`;
  }
  return `$${value.toFixed(decimals)}`;
}

export function formatPrice(value: number): string {
  if (value >= 1) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (value >= 0.01) {
    return `$${value.toFixed(4)}`;
  }
  return `$${value.toFixed(8)}`;
}

export function formatPercentage(value: number | string | null | undefined, decimals = 2): string {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return 'N/A';
  const formatted = num.toFixed(decimals);
  return num >= 0 ? `+${formatted}%` : `${formatted}%`;
}

export function formatNumber(value: number, decimals = 0): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

export function formatMarketCap(value: number): string {
  return formatCurrency(value, 2);
}

export function formatVolume(value: number): string {
  return formatCurrency(value, 2);
}

export function getPercentageColor(percentage: number | null | undefined): string {
  if (percentage === null || percentage === undefined) return 'text-muted-foreground';
  return percentage >= 0 ? 'text-success' : 'text-destructive';
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
