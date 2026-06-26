import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileNav from '@/components/layout/MobileNav'
import PWARegistrar from '@/components/PWARegistrar'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thuatmxh.vn'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: '/manifest.json',
  title: {
    default: 'Thủ Thuật MXH – Bí Kíp Mạng Xã Hội Hàng Đầu',
    template: '%s | Thủ Thuật MXH',
  },
  description:
    'Khám phá hàng trăm thủ thuật, mẹo vặt và bí kíp tăng tương tác trên Facebook, TikTok, Instagram, YouTube. Cập nhật mới nhất, hướng dẫn chi tiết.',
  keywords: ['thủ thuật mạng xã hội', 'mẹo facebook', 'tăng follower tiktok', 'hack instagram', 'seo youtube'],
  authors: [{ name: 'Thủ Thuật MXH' }],
  creator: 'Thủ Thuật MXH',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: siteUrl,
    siteName: 'Thủ Thuật MXH',
    title: 'Thủ Thuật MXH – Bí Kíp Mạng Xã Hội Hàng Đầu',
    description: 'Khám phá hàng trăm thủ thuật, mẹo vặt trên Facebook, TikTok, Instagram, YouTube.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Thủ Thuật MXH' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thủ Thuật MXH – Bí Kíp Mạng Xã Hội Hàng Đầu',
    description: 'Khám phá hàng trăm thủ thuật, mẹo vặt trên Facebook, TikTok, Instagram, YouTube.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
          <PWARegistrar />
        </ThemeProvider>
      </body>
    </html>
  )
}


// export const metadata = {
//   verification: {
//     google: "77qOlDqHLf9prEx1DF-FK8jIptHiYuHeyvxSsm2mBxM",
//   },
// };