import { Card } from "@/components/ui/card";
import { Metadata } from "next";
import DaoHome from "./dao-home";

export const runtime = "edge"; // Required for Cloudflare Pages
const appUrl = process.env.NEXT_PUBLIC_URL;

export const revalidate = 300;

type Props = {
  params: Promise<{ chainid: string; daoid: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chainid, daoid } = await params;

  // const frame = {
  //   version: "next",
  //   imageUrl: `https://${process.env.NEXT_PUBLIC_URL}/image.png`,
  //   button: {
  //     title: "Make Proposal",
  //     action: {
  //       type: "launch_frame",
  //       name: "Proposals",
  //       url: `https://${process.env.NEXT_PUBLIC_URL}`,
  //       iconImageUrl: `https://${process.env.NEXT_PUBLIC_URL}/icon.png`,
  //       splashImageUrl: `https://${process.env.NEXT_PUBLIC_URL}/splash.png`,
  //       splashBackgroundColor: "#341A34",
  //     },
  //   },
  // };

  // export async function generateMetadata(): Promise<Metadata> {
  //   return {
  //     metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_URL}`),
  //     title: "Proposals",
  //     openGraph: {
  //       title: "Farcastle Proposals",
  //       description: "the actions of organizations",
  //       images: `https://${process.env.NEXT_PUBLIC_URL}/image.png`,
  //     },
  //     other: {
  //       "fc:frame": JSON.stringify(frame),
  //     },
  //   };
  // }

  const frame = {
    version: "next",
    imageUrl: `https://${process.env.NEXT_PUBLIC_URL}/image.png`,
    button: {
      title: "Make DAO Proposal",
      action: {
        type: "launch_frame",
        name: "DAO Proposals",
        url: `${appUrl}/dao/${chainid}/${daoid}`,
        splashImageUrl: `${appUrl}/splash.png`,
        splashBackgroundColor: "#341A34",
      },
    },
  };

  // return {
  //   title: "#1 Farcastle DAO Proposals",
  //   openGraph: {
  //     title: "#2 Farcastle DAO Proposals",
  //     description: "Farcastle DAO Proposals",
  //   },
  //   other: {
  //     "fc:frame": JSON.stringify(frame),
  //   },
  // };

  return {
    metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_URL}`),
    title: "DAO Proposals",
    openGraph: {
      title: "Farcastle DAO Proposals",
      description: "the actions of organizations",
      images: `https://${process.env.NEXT_PUBLIC_URL}/image.png`,
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Page() {
  return (
    <div className="w-full h-full pb-4 px-4">
      <Card className="flex flex-col items-center pt-4 pb-8 rounded-none">
        <DaoHome />
      </Card>
    </div>
  );
}
