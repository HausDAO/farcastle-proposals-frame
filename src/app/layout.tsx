import "./globals.css";

import type { Metadata } from "next";

import { Header } from "@/components/ui/header";
import { Providers } from "@/providers/Providers";

const frame = {
  version: "next",
  imageUrl: `https://${process.env.NEXT_PUBLIC_URL}/image.png`,
  button: {
    title: "Make Proposal",
    action: {
      type: "launch_frame",
      name: "Proposals",
      url: `https://${process.env.NEXT_PUBLIC_URL}`,
      iconImageUrl: `https://${process.env.NEXT_PUBLIC_URL}/icon.png`,
      splashImageUrl: `https://${process.env.NEXT_PUBLIC_URL}/splash.png`,
      splashBackgroundColor: "#341A34",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_URL}`),
    title: "Proposals",
    openGraph: {
      title: "Farcastle Proposals",
      description: "the actions of organizations",
      images: `https://${process.env.NEXT_PUBLIC_URL}/image.png`,
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

// eslint-disable-next-line import/no-default-export
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        {/* eslint-disable-next-line @next/next/google-font-display */}
        <link
          href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preload"
          href="/fonts/FetteUNZFraktur.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased scrollbar-vert">
        <Providers>
          <Header />
          <div className="mt-1">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
