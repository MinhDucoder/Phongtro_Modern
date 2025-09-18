import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import ClientErrorBoundary from "@/components/ui/ClientErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import ConnectionStatus from "@/components/ui/ConnectionStatus";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NhaTroVN - Kênh thông tin Phòng Trọ số 1 Việt Nam",
  description: "Tìm kiếm phòng trọ, nhà trọ, căn hộ cho thuê giá rẻ, chính chủ, an toàn. Hơn 75.000 tin đăng cho thuê phòng trọ mới nhất 2024.",
  keywords: "phòng trọ, nhà trọ, cho thuê phòng, căn hộ cho thuê, nhà nguyên căn, thuê nhà, bất động sản",
  authors: [{ name: "NhaTroVN" }],
  creator: "NhaTroVN",
  publisher: "NhaTroVN",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://phongtro123.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "NhaTroVN - Kênh thông tin Phòng Trọ số 1 Việt Nam",
    description: "Tìm kiếm phòng trọ, nhà trọ, căn hộ cho thuê giá rẻ, chính chủ, an toàn. Hơn 75.000 tin đăng cho thuê phòng trọ mới nhất 2024.",
    url: 'https://phongtro123.com',
    siteName: 'NhaTroVN',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NhaTroVN - Kênh thông tin Phòng Trọ số 1 Việt Nam',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "NhaTroVN - Kênh thông tin Phòng Trọ số 1 Việt Nam",
    description: "Tìm kiếm phòng trọ, nhà trọ, căn hộ cho thuê giá rẻ, chính chủ, an toàn. Hơn 75.000 tin đăng cho thuê phòng trọ mới nhất 2024.",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ClientErrorBoundary>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            {/* <ConnectionStatus /> */}
          </AuthProvider>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
