import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Forma AI — Prompt-to-Interactive UI Studio',
  description: 'AI-driven prompt-to-UI generator powered by Gemini & OpenAI. Live streaming React component sandbox with Tailwind CSS in your browser.',
  keywords: ['AI UI Generator', 'v0 alternative', 'React Generator', 'Next.js AI', 'Generative UI', 'Tailwind Sandpack'],
  authors: [{ name: 'Roshanlal D' }],
  openGraph: {
    title: 'Forma AI — Prompt-to-Interactive UI Studio',
    description: 'Turn prompts into interactive, production-ready React components rendered live in your browser.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
