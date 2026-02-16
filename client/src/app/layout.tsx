import type { Metadata } from "next";
import { Doto, Share_Tech_Mono } from "next/font/google"; // Use standard next/font/google
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WarmFilterOverlay } from "@/components/ui/WarmFilterOverlay";
import { HUD } from "@/components/HUD";
import { PerformanceHUD } from "@/components/PerformanceHUD";
import { ShaderBackground } from "@/components/ShaderBackground";

// Import fonts
const doto = Doto({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"], // Adjust weights as needed
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-body",
  weight: "400",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Metis",
  description: "AI Assistant for Neurodiversity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Load OpenDyslexic via CDN for now to ensure availability without local file issues, or use local if preferred */}
      <head>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/opendyslexic@2.1.0-beta/css/opendyslexic.min.css" />
      </head>
      <body
        className={`${doto.variable} ${shareTechMono.variable} antialiased relative h-screen w-full overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
            <ShaderBackground />
            <WarmFilterOverlay />
            <HUD />
            <PerformanceHUD />
            <main className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden">
                {children}
            </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
