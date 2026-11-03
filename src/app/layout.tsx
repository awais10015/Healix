import type { Metadata } from "next";
import "./globals.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import SelectedUserContextProvider from "@/app/context/selectedUserContextProvider";
import TrackThemeContextProvider from "@/app/context/trackThemeContextProvider";
import { StreamVideoProvider } from "@/providers/StreamClientProvider";
import DoctorContextProvider from "@/app/context/doctorContextProvider";
import { AuthProvider } from "@/context/AuthProvider";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Healix-Home",
  description: "Where care meets innovation",
  icons: {
    icon: "/union2.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DoctorContextProvider>
              <TrackThemeContextProvider>
                <SelectedUserContextProvider>
                  <StreamVideoProvider>
                    <NextTopLoader
                      color="#2299DD"
                      initialPosition={0.08}
                      crawlSpeed={200}
                      height={3}
                      crawl={false}
                      showSpinner={false}
                      easing="ease"
                    />
                    {children}
                    <Toaster />
                  </StreamVideoProvider>
                </SelectedUserContextProvider>
              </TrackThemeContextProvider>
            </DoctorContextProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
