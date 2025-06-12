import { GraphQLClient } from "graphql-request";
import { useQuery } from "@tanstack/react-query";

import { useDaoHooksConfig } from "@/providers/DaoHooksProvider";
import { MemberItem } from "@/lib/types";
import { FIND_MEMBER } from "@/lib/graph-queries";
import { getGraphUrl } from "@/lib/endpoints";

export const useMember = ({
  chainid,
  memberaddress,
  daoid,
}: {
  chainid?: string;
  memberaddress?: string;
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
    queryKey: [`get-member`, { chainid, daoid, memberaddress }],
    enabled: Boolean(chainid && memberaddress && daoid),
    queryFn: async (): Promise<{
      member: MemberItem;
    }> => {
      const res = (await graphQLClient.request(FIND_MEMBER, {
        memberid: `${daoid?.toLowerCase()}-member-${memberaddress?.toLowerCase()}`,
      })) as {
        member: MemberItem;
      };

      return {
        member: res.member,
      };
    },
  });

  return {
    member: data?.member,
    ...rest,
  };
};
