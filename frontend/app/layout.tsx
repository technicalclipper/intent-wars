import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";


const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-press-start-2p",
});


export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
       <body className={`${pressStart2P.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
