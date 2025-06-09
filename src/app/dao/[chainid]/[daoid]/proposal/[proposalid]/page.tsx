import { Metadata } from "next";
import ProposalDetail from "./proposal-detail";

export const runtime = "edge";

const appUrl = process.env.NEXT_PUBLIC_URL;

type Props = {
  params: Promise<{ chainid: string; daoid: string; proposalid: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chainid, daoid, proposalid } = await params;

  const proposalTitle = `Proposals`;

  const frame = {
    version: "next",
    imageUrl: `${appUrl}/image.png`,
    button: {
      title: proposalTitle,
      action: {
        type: "launch_frame",
        name: "Farcastle Proposals",
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
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Page() {
  return <ProposalDetail />;
}
