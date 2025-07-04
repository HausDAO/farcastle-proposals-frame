/* eslint-disable @next/next/no-img-element */
import { getGraphUrl } from "@/lib/endpoints";
import { getProposalTypeLabel, truncateString } from "@/lib/formatters";
import { FIND_PROPOSAL } from "@/lib/graph-queries";
import { ProposalItem } from "@/lib/types";

import { GraphQLClient } from "graphql-request";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = "force-dynamic";

// Define the dimensions for the generated OpenGraph image
const size = {
  width: 600,
  height: 400,
  // width: 1200,
  // height: 630,
};

/**
 * GET handler for generating dynamic OpenGraph images
 * @param request - The incoming HTTP request
 * @param params - Route parameters containing the ID
 * @returns ImageResponse - A dynamically generated image for OpenGraph
 */
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      chainid: string;
      daoid: string;
      proposalid: string;
    }>;
  }
) {
  const { chainid, daoid, proposalid } = await params;

  try {
    const dhUrl = getGraphUrl({
      chainid: chainid,
      graphKey: process.env.NEXT_PUBLIC_GRAPH_KEY || "",
      subgraphKey: "DAOHAUS",
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_URL || "https://proposals.farcastle.net";
    let imgSrc = `${baseUrl}/fallback.svg`;
    let proposalTitle = "A Proposal";
    let proposalDescription = "";
    let proposalType = "Proposal";
    let yesVotes = "0";
    let noVotes = "0";

    // Fetch font data
    const vt323FontUrl = `${baseUrl}/fonts/VT323-Regular.woff`;
    const vt323FontData = await fetch(vt323FontUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch font: ${res.status} ${res.statusText}`
          );
        }
        return res.arrayBuffer();
      })
      .catch((error) => {
        console.error("VT323 Font fetch error:", error);
        return null;
      });

    const mulishFontUrl = `${baseUrl}/fonts/Mulish-Regular.woff`;
    const mulishFontData = await fetch(mulishFontUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch font: ${res.status} ${res.statusText}`
          );
        }
        return res.arrayBuffer();
      })
      .catch((error) => {
        console.error("Mulish Font fetch error:", error);
        return null;
      });

    try {
      const graphQLClient = new GraphQLClient(dhUrl);
      const { proposal } = (await graphQLClient.request(FIND_PROPOSAL, {
        proposalid: `${daoid?.toLowerCase()}-proposal-${proposalid}`,
      })) as { proposal: ProposalItem };

      console.log("proposal", proposal);

      if (proposal) {
        proposalTitle = truncateString(proposal.title, 45);
        proposalDescription = truncateString(proposal.description, 250);
        proposalType = getProposalTypeLabel(proposal.proposalType);
        yesVotes = proposal.yesVotes;
        noVotes = proposal.noVotes;
      }
    } catch (error) {
      console.error("Error:", error);
    }

    // Build fonts array conditionally
    const fonts = [];
    if (vt323FontData) {
      fonts.push({
        name: "VT323",
        data: vt323FontData,
      });
    }
    if (mulishFontData) {
      fonts.push({
        name: "Mulish",
        data: mulishFontData,
      });
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: "#341A34",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "20px",
            paddingBottom: "20px",
            color: "#00B1CC", // Changed default text color
          }}
        >
          {/* Card-like container */}
          <div
            style={{
              background: "#17151F",
              height: "100%",
              width: "90%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: "20px",
              border: "2px solid #39393C",
              borderRadius: "0px",
              marginLeft: "10px",
              marginRight: "10px",
              overflow: "hidden",
            }}
          >
            {/* Top section */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "32px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  gap: "2px",
                  maxWidth: "75%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "16px",
                    fontFamily: "'Mulish'",
                    color: "#9FA3AF",
                    textTransform: "uppercase",
                    justifyContent: "flex-start",
                  }}
                >
                  {proposalType} | {proposalid}
                </div>

                <div
                  style={{
                    display: "flex",
                    fontSize: "32px",
                    fontFamily: "'VT323'",
                    color: "#00B1CC",
                    textTransform: "uppercase",
                    justifyContent: "center",
                    marginBottom: "8px",
                  }}
                >
                  {proposalTitle}
                </div>
              </div>
              <div style={{ display: "flex" }}>
                <img
                  src={imgSrc}
                  alt="Campaign Icon"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
            {/* Bottom section */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "20px",
                  fontFamily: "'Mulish'",
                  color: "#EAF8FF",
                  justifyContent: "flex-start",
                }}
              >
                {proposalDescription}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginTop: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "50%",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "32px",
                    fontFamily: "'VT323'",
                    color: "#00B1CC",
                    textTransform: "uppercase",
                    justifyContent: "center",
                    margin: 0,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  Yes
                </div>

                <div
                  style={{
                    display: "flex",
                    fontSize: "48px",
                    fontFamily: "'VT323'",
                    color: "#707C4E",
                    textTransform: "uppercase",
                    justifyContent: "center",
                    margin: 0,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  {yesVotes}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "50%",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "32px",
                    fontFamily: "'VT323'",
                    color: "#00B1CC",
                    textTransform: "uppercase",
                    justifyContent: "center",
                    margin: 0,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  No
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "48px",
                    fontFamily: "'VT323'",
                    color: "#CD4A50",
                    textTransform: "uppercase",
                    justifyContent: "center",
                    margin: 0,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  {noVotes}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: fonts, // Pass the conditionally built fonts array
      }
    );
  } catch (e) {
    // Log and handle any errors during image generation
    console.log(`Failed to generate yeet image`, e);
    return new Response(`Failed to generate yeet image`, {
      status: 500,
    });
  }
}
