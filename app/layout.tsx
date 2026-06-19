import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SITE } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
