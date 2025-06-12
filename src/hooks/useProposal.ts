import { GraphQLClient } from "graphql-request";
import { useQuery } from "@tanstack/react-query";

import { useDaoHooksConfig } from "@/providers/DaoHooksProvider";
import { getGraphUrl } from "@/lib/endpoints";
import { ProposalItem } from "@/lib/types";
import { FIND_PROPOSAL } from "@/lib/graph-queries";

export const useProposal = ({
  chainid,
  proposalid,
  daoid,
}: {
  chainid?: string;
  proposalid?: string;
  daoid?: string;
}) => {
  const { config } = useDaoHooksConfig();

  if (!config?.graphKey) {
    console.error(
      "useActiveDaoProposals: DaoHooksContext must be used within a DaoHooksProvider"
    );
  }

  const dhUrl = getGraphUrl({
    chainid: chainid || "",
    graphKey: config?.graphKey || "",
    subgraphKey: "DAOHAUS",
  });

  const graphQLClient = new GraphQLClient(dhUrl);

  const { data, ...rest } = useQuery({
    queryKey: [`get-proposal`, { chainid, daoid, proposalid }],
    enabled: Boolean(chainid && proposalid && daoid),
    queryFn: async (): Promise<{
      proposal: ProposalItem;
    }> => {
      const res = (await graphQLClient.request(FIND_PROPOSAL, {
        proposalid: `${daoid?.toLowerCase()}-proposal-${proposalid}`,
      })) as {
        proposal: ProposalItem;
      };

      return {
        proposal: res.proposal,
      };
    },
  });

  return {
    proposal: data?.proposal,
    ...rest,
  };
};
