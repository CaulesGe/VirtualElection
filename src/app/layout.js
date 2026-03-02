import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Header from "@/lib/components/virtualElection/Header";
import { getServerAuthSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Virtual Election",
  description: "Standalone virtual election platform",
};

export default async function RootLayout({ children }) {
  const session = await getServerAuthSession();
  const userLabel = session?.user?.name || session?.user?.email || "";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header isAuthenticated={!!session?.user} userLabel={userLabel} />
        {children}
      </body>
    </html>
  );
}
