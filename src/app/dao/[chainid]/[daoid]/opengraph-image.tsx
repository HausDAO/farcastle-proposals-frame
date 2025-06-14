/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { getGraphUrl } from "@/lib/endpoints";
import { GraphQLClient } from "graphql-request";
import { DaoItem } from "@/lib/types";
import { FIND_DAO_LITE } from "@/lib/graph-queries";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  // width: 1200,
  // height: 630,
  width: 600,
  height: 400,
};

export default async function Image({
  params,
}: {
  params: { chainid: string; daoid: string };
}) {
  console.log("dao api route chainid", params.chainid);
  const dhUrl = getGraphUrl({
    chainid: params.chainid,
    graphKey: process.env.NEXT_PUBLIC_GRAPH_KEY || "",
    subgraphKey: "DAOHAUS",
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_URL || "https://proposals.farcastle.net";
  let imgSrc = `${baseUrl}/fallback.svg`;

  try {
    const graphQLClient = new GraphQLClient(dhUrl);
    const { dao } = (await graphQLClient.request(FIND_DAO_LITE, {
      daoid: params.daoid,
    })) as { dao: DaoItem };

    if (dao?.rawProfile?.[0]?.content) {
      const profile = JSON.parse(dao.rawProfile[0].content);
      if (profile.avatarImg) {
        imgSrc = profile.avatarImg;
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }

  return new ImageResponse(
    (
      <div tw="flex items-center justify-center h-full w-full bg-[#17151F]">
        <img
          src={imgSrc}
          width="500"
          height="500"
          tw="rounded-full"
          alt="DAO Avatar"
        />
      </div>
    ),
    size
  );
}
