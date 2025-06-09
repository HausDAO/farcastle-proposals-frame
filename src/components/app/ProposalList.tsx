"use client";

import { ProposalItem } from "@/lib/types";
import { Card } from "../ui/card";
import { LoadingSpinner } from "../ui/loading";
import { useActiveDaoProposals } from "@/hooks/useActiveDaoProposals";
import { useDaoRecord } from "@/providers/DaoRecordProvider";
import { ProposalListCard } from "./ProposalListCard";

export const ProposalList = () => {
  const { daoid, daochain } = useDaoRecord();

  const {
    proposals,
    isLoading: proposalsLoading,
    isFetched,
  } = useActiveDaoProposals({
    chainid: daochain,
    daoid,
  });

  if (proposalsLoading) return <LoadingSpinner />;

  if (isFetched && (!proposals || proposals.length === 0)) {
    return (
      <div className="flex flex-col flex-wrap items-center justify-center gap-2 px-5 mt-3">
        <Card className="w-full bg-background border rounded-none">
          <div className="flex justify-center p-4">
            <span className="text-primary font-display text-xl uppercase">
              No active proposals
            </span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-wrap items-center justify-center gap-2 px-5 mt-3">
      {isFetched &&
        proposals?.map((proposal: ProposalItem) => {
          return <ProposalListCard key={proposal.id} proposal={proposal} />;
        })}
    </div>
  );
};
