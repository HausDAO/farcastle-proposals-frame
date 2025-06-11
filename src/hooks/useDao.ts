import { useQuery } from "@tanstack/react-query";
import { GraphQLClient } from "graphql-request";

import { getGraphUrl } from "@/lib/endpoints";
import { FIND_DAO } from "@/lib/graph-queries";
import { DaoItem, DaoProfile, RecordItem } from "@/lib/types";
import { useDaoHooksConfig } from "@/providers/DaoHooksProvider";

export const addParsedContent = <T>(record?: RecordItem): T | undefined => {
  if (record?.contentType === "json") {
    try {
      const obj = JSON.parse(record.content);
      return obj;
    } catch (e) {
      console.log("err", e);
      return;
    }
  }
};

export const useDao = ({
  chainid,
  daoid,
}: {
  chainid?: string;
  daoid?: string;
}) => {
  const { config } = useDaoHooksConfig();

  if (!config?.graphKey) {
    console.error(
      "useDao: DaoHooksContext must be used within a DaoHooksProvider"
    );
  }

  const { data, ...rest } = useQuery<{ dao: DaoItem }>({
    queryKey: [`get-dao`, { chainid, daoid }],
    enabled: Boolean(chainid && daoid),
    queryFn: async () => {
      if (!chainid || !daoid || !config?.graphKey) {
        return { dao: undefined as unknown as DaoItem };
      }

      console.log("useDao chainid", chainid);

      const dhUrl = getGraphUrl({
        chainid,
        graphKey: config.graphKey,
        subgraphKey: "DAOHAUS",
      });
      const graphQLClient = new GraphQLClient(dhUrl);
      const daores = (await graphQLClient.request(FIND_DAO, { daoid })) as {
        dao: DaoItem;
      };
      const profile = addParsedContent<DaoProfile>(daores.dao.rawProfile[0]);
      return { dao: { ...daores.dao, profile } };
    },
  });

  return { dao: data?.dao, ...rest };
};
