import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Header from "@/lib/components/virtualElection/Header";
import { getServerAuthSession } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next"

const siteUrl =
	process.env.NEXT_PUBLIC_SITE_URL ||
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
	template: "%s | VirtualElection",
	default: "VirtualElection - Interactive Election Maps and Live Virtual Voting"
  },
  description:
	"Explore Canada, USA, and UK election maps with live virtual voting totals, regional breakdowns, and riding-level results.",
  alternates: {
	canonical: "/"
  },
  openGraph: {
	type: "website",
	url: "/",
	title: "VirtualElection - Interactive Election Maps and Live Virtual Voting",
	description:
		"Explore Canada, USA, and UK election maps with live virtual voting totals, regional breakdowns, and riding-level results.",
	siteName: "VirtualElection"
  },
  twitter: {
	card: "summary_large_image",
	title: "VirtualElection - Interactive Election Maps and Live Virtual Voting",
	description:
		"Explore Canada, USA, and UK election maps with live virtual voting totals, regional breakdowns, and riding-level results."
  }
};

export default async function RootLayout({ children }) {
  const session = await getServerAuthSession();
  const userLabel = session?.user?.name || session?.user?.email || "";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  name: "VirtualElection",
                  url: siteUrl,
                  description:
                    "Interactive election maps with live virtual voting totals for Canada, USA, and the United Kingdom."
                },
                {
                  "@type": "Organization",
                  name: "VirtualElection",
                  url: siteUrl
                }
              ]
            })
          }}
        />
        <Header isAuthenticated={!!session?.user} userLabel={userLabel} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
