import { useCallback, useEffect } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
  useSwitchChain,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import daoAbi from "../../lib/tx-prepper/abi/baal.json";
import { useDaoRecord } from "@/providers/DaoRecordProvider";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";
import { getExplorerUrl, getWagmiChainObj } from "@/lib/constants";
import { Spinner } from "../ui/spinner";
import { useProposal } from "@/hooks/useProposal";

export const ExecuteTx = ({
  daoid,
  chainid,
  proposalid,
}: {
  daoid: string;
  chainid: string;
  proposalid: string;
}) => {
  const queryClient = useQueryClient();
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { daochainid, daochain } = useDaoRecord();
  const { proposal, refetch } = useProposal({
    daoid,
    chainid: daochain,
    proposalid,
  });

  const {
    writeContract,
    data: hash,
    isError,
    isPending: isSendTxPending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    const reset = async () => {
      queryClient.invalidateQueries({
        queryKey: ["get-dao", { chainid, daoid }],
      });

      queryClient.invalidateQueries({
        queryKey: ["active-proposals", { chainid, daoid }],
      });

      queryClient.invalidateQueries({
        queryKey: ["get-proposal", { chainid, daoid, proposalid }],
      });
    };
    if (isConfirmed) {
      console.log("INVALIDATING/REFETCH");
      reset();

      setTimeout(() => {
        refetch();
        console.log("refetching");
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, queryClient, daoid, chainid, proposalid]);

  const handleProcess = async () => {
    if (chainId !== Number(chainid)) {
      await switchChain({ chainId: Number(chainid) });
      return;
    }

    writeContract({
      address: daoid as `0x${string}`,
      abi: daoAbi,
      functionName: "processProposal",
      args: [proposalid, proposal?.proposalData],
    });
  };

  const openUrl = useCallback(() => {
    sdk.actions.openUrl(`${getExplorerUrl(chainid)}/tx/${hash}`);
  }, [hash, chainid]);

  const handleChainSwitch = useCallback(() => {
    if (daochainid) {
      switchChain({ chainId: daochainid });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daochainid]);

  const validChain = chainId === daochainid;

  if (!proposal) return;

  return (
    <>
      {!isConfirmed && (
        <div className="flex flex-row justify-between mb-4 w-full">
          {isSendTxPending || isConfirming ? (
            <Spinner />
          ) : (
            <>
              <Button
                disabled={isSendTxPending || isConfirming}
                onClick={handleProcess}
              >
                Execute Proposal
              </Button>
            </>
          )}
        </div>
      )}
      {isConfirmed && (
        <div className="flex flex-col items-center gap-3">
          <Image src="/heart.svg" alt="Success" width={50} height={50} />
          Proposal has been executed
          <div className="flex flex-col w-full items-center gap-2">
            {hash && (
              <Button onClick={openUrl} className="w-full">
                View Transaction
              </Button>
            )}
          </div>
        </div>
      )}

      {isConnected && !validChain && (
        <Button onClick={handleChainSwitch} className="mt-2">
          Switch to {getWagmiChainObj(daochain).name}
        </Button>
      )}

      {isError && (
        <div className="text-xs text-red-500">Error executing proposal</div>
      )}
    </>
  );
};
