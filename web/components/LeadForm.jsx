'use client';

import { useState } from 'react';

export default function LeadForm({ apiBase, slug, source }) {
  const [status, setStatus] = useState('');

  async function submitLead(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    payload.source = source || 'direct';
    setStatus('Sending...');
    try {
      const response = await fetch(`${apiBase}/public/packages/${slug}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Lead yuborilmadi');
      event.currentTarget.reset();
      setStatus('Request sent');
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <form className="formStack" onSubmit={submitLead}>
      <label>Name<input name="name" placeholder="Ismingiz" /></label>
      <label>Phone<input name="phone" placeholder="+998 90 123 45 67" /></label>
      <label>Message<textarea name="message" placeholder="Savolingiz yoki sayohat sanasi" /></label>
      <button className="primaryButton" type="submit">Send request</button>
      {status && <span className="pill">{status}</span>}
    </form>
  );
}



