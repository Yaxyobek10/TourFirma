import './globals.css';

export const metadata = {
  title: 'CaseLink',
  description: 'SaaS workspace for travel agents to build tour package pages and track leads.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}



