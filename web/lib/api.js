export const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5005';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: options.cache || 'no-store',
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data;
}

export function money(value, currency) {
  return `${Number(value || 0).toLocaleString()} ${currency || ''}`.trim();
}

export function blockText(block) {
  if (block?.data?.note) return block.data.note;
  if (block?.data?.text) return block.data.text;
  if (block?.data?.url) return block.data.url;
  if (Array.isArray(block?.data?.items)) return block.data.items.join(', ');
  if (Array.isArray(block?.data?.days)) return block.data.days.map((day) => `${day.day}. ${day.title}`).join(' | ');
  return JSON.stringify(block?.data || {});
}

export function packageImage(pkg) {
  return pkg?.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80';
}



