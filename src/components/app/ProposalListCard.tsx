"use client";

import { Card } from "@/components/ui/card";
import { getProposalTypeLabel } from "@/lib/formatters";
import { getProposalStatus } from "@/lib/proposals-status";
import { ProposalItem } from "@/lib/types";
import { useDaoRecord } from "@/providers/DaoRecordProvider";
import Link from "next/link";

interface ProposalListCardProps {
  proposal: ProposalItem;
}

export const ProposalListCard = ({ proposal }: ProposalListCardProps) => {
  const { daoid, daochain } = useDaoRecord();

  return (
    <Link
      href={`/dao/${daochain}/${daoid}/proposal/${proposal.proposalId}`}
      className="w-full"
    >
      <Card className="bg-background border hover:bg-card transition-colors rounded-none">
        <div className="flex items-center gap-3 p-4">
          <div className="flex flex-col">
            <span className="text-muted text-xs uppercase">
              {`${getProposalTypeLabel(proposal.proposalType)} | ${proposal.proposalId}`}
            </span>
            <span className="text-foreground text-lg truncate mb-2">
              {proposal.title}
            </span>
            <span className="text-muted text-xs uppercase truncate">
              {getProposalStatus(proposal)}
            </span>
            <div className="flex flex-row gap-2 text-xs">
              <span className="font-display text-xl text-success">{proposal.yesVotes}</span>
              <span className="text-muted relative top-2">to</span>
              <span className="font-display text-xl text-destructive">{proposal.noVotes}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
