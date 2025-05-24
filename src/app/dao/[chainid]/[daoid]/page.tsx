import { Card } from "@/components/ui/card";
import { Metadata } from "next";
import DaoHome from "./dao-home";

export const runtime = "edge";

const appUrl = process.env.NEXT_PUBLIC_URL;

type Props = {
  params: Promise<{ chainid: string; daoid: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chainid, daoid } = await params;

  const frame = {
    version: "next",
    imageUrl: `${appUrl}/dao/${chainid}/${daoid}/opengraph-image`,
    button: {
      title: "Make Proposal",
      action: {
        type: "launch_frame",
        name: "Proposals",
        url: `${appUrl}/dao/${chainid}/${daoid}`,
        iconImageUrl: `${appUrl}/icon.png`,
        splashImageUrl: `${appUrl}/splash.png`,
        splashBackgroundColor: "#341A34",
      },
    },
  };
  return {
    title: "Proposals",
    openGraph: {
      title: "Farcastle Proposals",
      description: "Shape the fate of the realm",
      images: `${appUrl}/image.png`,
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
