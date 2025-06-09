import { Metadata } from "next";
import ProposalDetail from "./proposal-detail";

export const runtime = "edge";

const appUrl = process.env.NEXT_PUBLIC_URL;

type Props = {
  params: Promise<{ chainid: string; daoid: string; proposalid: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chainid, daoid, proposalid } = await params;

  const imageUrl = new URL(
    `${appUrl}/api/proposal/${chainid}/${daoid}/${proposalid}`
  );

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: "View Proposal",
      action: {
        type: "launch_frame",
        name: "Proposals",
        url: `${appUrl}/dao/${chainid}/${daoid}/proposal/${proposalid}`,
        splashImageUrl: `${appUrl}/splash.png`,
        splashBackgroundColor: "#17151F",
      },
    },
  };
  return {
    title: "Farcastle Proposal",
    openGraph: {
      title: "Farcastle Proposal",
      description: "Farcastle Proposal",
      images: [{ url: imageUrl.toString() }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
      "fc:frame:image": `${imageUrl.toString()}`,
      "fc:frame:button:1": "View Proposal",
    },
  };
}

export default function Page() {
  return <ProposalDetail />;
}
