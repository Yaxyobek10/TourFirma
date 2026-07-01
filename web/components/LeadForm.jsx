'use client';

import { useState } from 'react';

const copy = {
  uz: {
    sending: 'Yuborilmoqda...',
    error: 'Buyurtma yuborilmadi',
    success: 'Buyurtma yuborildi. Agent siz bilan boglanadi.',
    eyebrow: 'Bron sorovi',
    title: 'Bu turni bron qilish',
    text: 'Malumotlaringizni qoldiring, agent narx va joylarni tasdiqlaydi.',
    name: 'Ism',
    phone: 'Telefon',
    date: 'Sana',
    pax: 'Odam soni',
    contact: 'Aloqa turi',
    note: 'Izoh',
    notePlaceholder: 'Masalan: 2 kattalar, 1 bola, oynaga yaqin xona kerak',
    button: 'Turni bron qilish',
  },
  ru: {
    sending: 'Otpravlyaetsya...',
    error: 'Ne udalos otpravit zayavku',
    success: 'Zayavka otpravlena. Agent svyazhetsya s vami.',
    eyebrow: 'Zayavka na bron',
    title: 'Zabronirovat etot tur',
    text: 'Ostavte dannye, agent podtverdit tsenu i nalichie mest.',
    name: 'Imya',
    phone: 'Telefon',
    date: 'Data',
    pax: 'Kolichestvo chelovek',
    contact: 'Sposob svyazi',
    note: 'Kommentariy',
    notePlaceholder: 'Naprimer: 2 vzroslyh, 1 rebenok, nuzhen nomer u okna',
    button: 'Zabronirovat tur',
  },
  en: {
    sending: 'Sending...',
    error: 'Could not send the booking request',
    success: 'Request sent. An agent will contact you.',
    eyebrow: 'Booking request',
    title: 'Book this tour',
    text: 'Leave your details and an agent will confirm price and availability.',
    name: 'Name',
    phone: 'Phone',
    date: 'Date',
    pax: 'Travelers',
    contact: 'Preferred contact',
    note: 'Note',
    notePlaceholder: 'Example: 2 adults, 1 child, window room preferred',
    button: 'Book this tour',
  },
};

export default function LeadForm({ apiBase, slug, source, lang = 'uz' }) {
  const [status, setStatus] = useState('');
  const t = copy[lang] || copy.uz;

  async function submitLead(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    payload.source = source || 'direct';
    payload.intent = 'booking';
    payload.pax = Number(payload.pax || 1);
    setStatus(t.sending);
    try {
      const response = await fetch(`${apiBase}/public/packages/${slug}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(t.error);
      event.currentTarget.reset();
      setStatus(t.success);
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <form className="bookingForm" onSubmit={submitLead}>
      <div className="bookingTitle">
        <span>{t.eyebrow}</span>
        <strong>{t.title}</strong>
        <p>{t.text}</p>
      </div>
      <label>{t.name}<input name="name" placeholder="Ali Karimov" required /></label>
      <label>{t.phone}<input name="phone" placeholder="+998 90 123 45 67" required /></label>
      <label>Email<input name="email" type="email" placeholder="ali@example.com" /></label>
      <div className="formTwo">
        <label>{t.date}<input name="preferredDate" type="date" /></label>
        <label>{t.pax}<input name="pax" type="number" min="1" defaultValue="2" /></label>
      </div>
      <label>{t.contact}<select name="preferredContact" defaultValue="telegram"><option value="telegram">Telegram</option><option value="phone">{t.phone}</option><option value="email">Email</option></select></label>
      <label>{t.note}<textarea name="message" placeholder={t.notePlaceholder} /></label>
      <button className="primaryButton" type="submit">{t.button}</button>
      {status && <span className="pill success">{status}</span>}
    </form>
  );
}
