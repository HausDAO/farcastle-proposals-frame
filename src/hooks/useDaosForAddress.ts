import { GraphQLClient } from "graphql-request";

import { useQuery } from "@tanstack/react-query";
import { getGraphUrl } from "@/lib/endpoints";
import { useDaoHooksConfig } from "@/providers/DaoHooksProvider";
import { LIST_ALL_DAOS_FOR_ADDRESS } from "@/lib/graph-queries";
import { DaoItem, MemberItem } from "@/lib/types";

export const useDaosForAddress = ({
  chainid,
  address,
}: {
  chainid?: string;
  address?: string;
}) => {
  const { config } = useDaoHooksConfig();

  if (!config?.graphKey) {
    console.error(
      "useDaosForAddress: DaoHooksContext must be used within a DaoHooksProvider"
    );
  }

  type DaosWithMembers = DaoItem &
    {
      members: MemberItem[];
    }[];

  const { data, ...rest } = useQuery({
    queryKey: [`get-daos-address-${chainid}-${address}`, { chainid, address }],
    enabled: Boolean(chainid && address),
    queryFn: (): Promise<{
      daos: DaosWithMembers[];
    }> => {
      console.log("useDaosForAddress chainid", chainid);
      const yeeterUrl = getGraphUrl({
        chainid: chainid || "",
        graphKey: config?.graphKey || "",
        subgraphKey: "DAOHAUS",
      });

      const graphQLClient = new GraphQLClient(yeeterUrl);

      return graphQLClient.request(LIST_ALL_DAOS_FOR_ADDRESS, {
        address,
      });
    },
  });

  return {
    daos: data?.daos,
    ...rest,
  };
};
