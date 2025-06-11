"use client";

import sdk from "@farcaster/frame-sdk";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { getWagmiChainObj } from "@/lib/constants";
import {
  getProposalTypeLabel,
  proposalCastUrl,
  truncateAddress,
  truncateString,
} from "@/lib/formatters";
import { useDaoRecord } from "@/providers/DaoRecordProvider";
import { useFrameSDK } from "@/providers/FramesSDKProvider";
import { useParams } from "next/navigation";
import { useProposal } from "@/hooks/useProposal";
import {
  checkHasVoted,
  getProposalStatus,
  PROPOSAL_STATUS,
  proposalStateText,
} from "@/lib/proposals-status";
import { useMember } from "@/hooks/useMember";
import { VoteTx } from "@/components/app/VoteTx";
import { ExecuteTx } from "@/components/app/ExecuteTx";

export default function ProposalDetail() {
  const { proposalid } = useParams<{ proposalid: string }>();

  const { isLoaded } = useFrameSDK();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { daoid, daochain, daochainid } = useDaoRecord();

  const [propVotes, setPropVotes] = useState<{ yes: number; no: number }>({
    yes: 0,
    no: 0,
  });

  const { proposal } = useProposal({
    daoid,
    chainid: daochain,
    proposalid,
  });
  const { member } = useMember({
    daoid,
    chainid: daochain,
    memberaddress: address,
  });

  const [canVote, setCanVote] = useState(false);

  const openProposalCastUrl = useCallback(() => {
    if (!daochain || !daoid || !proposalid) return;
    sdk.actions.openUrl(proposalCastUrl(daochain, daoid, Number(proposalid)));
  }, [proposalid, daoid, daochain]);

  const validChain = chainId === daochainid;

  const [shouldSwitch, setShouldSwitch] = useState(false);

  useEffect(() => {
    if (shouldSwitch) {
      switchChain({ chainId: getWagmiChainObj(daochain).id });
      setShouldSwitch(false);
    }
  }, [shouldSwitch, switchChain, daochain]);

  useEffect(() => {
    if (proposal) {
      setPropVotes({
        yes: Number(proposal.yesVotes),
        no: Number(proposal.noVotes),
      });
    }
  }, [proposal]);

  useEffect(() => {
    if (address && proposal) {
      console.log("member", member);
      const hasShares = member && Number(member.shares) > 0;
      const hasVoted = checkHasVoted(proposal.votes, address);
      const status = getProposalStatus(proposal);
      const isVoting = status === PROPOSAL_STATUS["voting"];
      setCanVote(isVoting && Boolean(hasShares) && !hasVoted);
    }
  }, [address, proposal, member]);

  const handleChainSwitch = useCallback(() => {
    setShouldSwitch(true);
  }, []);

  const openUrl = useCallback(() => {
    sdk.actions.openUrl(
      `https://admin.daohaus.club/${daochain}/${daoid}/proposal/${proposalid}`
    );
  }, [daoid, daochain, proposalid]);

  if (!isLoaded || !proposal) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  const status = proposal && getProposalStatus(proposal);
  const canExecute =
    proposal && status === PROPOSAL_STATUS["needsProcessing"] && isConnected;

  return (
    <div className="w-full h-full space-y-4 pb-4 px-4">
      <Card className="flex flex-col items-center px-4 pt-4 pb-8 rounded-none">
        <div className="text-muted text-xs mb-1 uppercase w-full text-left">
          {`${getProposalTypeLabel(proposal.proposalType)} | ${proposalid}`}
        </div>

        <div className="text-primary font-display text-2xl mb-1 uppercase w-full text-left">
          {proposal.title}
        </div>
        {proposal.description && (
          <div className="leading-relaxed font-mulish mb-4 w-full text-left">
            {truncateString(proposal.description, 400)}
          </div>
        )}

        <div className="flex flex-row justify-between mb-2 w-full">
          <div>
            <div className="text-muted text-xs mb-1 uppercase w-full text-left">
              Submitted by
            </div>
            <div className="font-mulish text-base w-full text-left">
              {truncateAddress(proposal.proposedBy)}
            </div>
          </div>
          <div>
            <div className="text-muted text-xs mb-1 uppercase w-full text-right">
              Status
            </div>
            <div className="font-mulish text-base w-full text-right">
            {proposalStateText(proposal, status)}
            </div>
          </div>
        </div>

        <div className="mb-1">
            <div className="text-muted text-xs mb-1 uppercase w-full text-center">
              Voting Ends
            </div>
          <div className="font-mulish text-base w-full">
            {format(new Date(Number(proposal.votingEnds) * 1000), "MMMM dd, HH:mm z")}
          </div>

          {status === PROPOSAL_STATUS.needsProcessing && (
            <div className="text-destructive font-mulish text-sm w-full text-left">
              * Proposals must be executed in order
            </div>
          )}
        </div>

        <div className="flex flex-row justify-between mb-1 w-full">
          <div>
            <div className="text-primary font-display text-2xl uppercase w-full text-left -mb-2">
              YES
            </div>
            <div className="text-success font-display text-4xl w-full text-left">
              {propVotes.yes}
            </div>
          </div>
          <div>
            <div className="text-primary font-display text-2xl uppercase w-full text-right -mb-2">
              NO
            </div>
            <div className="text-destructive font-display text-4xl w-full text-right">
              {propVotes.no}
            </div>
          </div>
        </div>

        {canVote && daoid && daochain && (
          <VoteTx
            daoid={daoid}
            chainid={daochain}
            proposalid={proposalid}
            setPropVotes={setPropVotes}
            propVotes={propVotes}
          />
        )}

        {canExecute && daoid && daochain && (
          <ExecuteTx daoid={daoid} chainid={daochain} proposalid={proposalid} />
        )}

        <Button
          onClick={openProposalCastUrl}
          variant="secondary"
          className="w-full"
        >
          Share Proposal
        </Button>

        <Button onClick={openUrl} variant="tertiary" className="w-full mt-4">
          Audit Proposal
        </Button>

        {isConnected && !validChain && (
          <Button onClick={handleChainSwitch} className="mt-2">
            Switch to {getWagmiChainObj(daochain).name}
          </Button>
        )}
      </Card>
    </div>
  );
}
