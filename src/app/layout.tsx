import "./globals.css";
import Providers from "@/components/providers";
import ConditionalNavbar from "@/components/conditional-navbar";
import ConditionalMain from "@/components/conditional-main";
import { PageTransitionLoader } from "@/components/page-transition-loader";

export const metadata = { title: "Helpo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <PageTransitionLoader />
          <ConditionalNavbar />
          <ConditionalMain>{children}</ConditionalMain>
        </Providers>
      </body>
    </html>
  );
}
