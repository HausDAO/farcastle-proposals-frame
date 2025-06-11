"use client";

import sdk from "@farcaster/frame-sdk";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { FormSwitcher } from "@/components/app/FormSwitcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { getExplorerUrl, getWagmiChainObj } from "@/lib/constants";
import { FORM_CONFIGS, FormConfig, validFormId } from "@/lib/form-configs";
import { truncateError } from "@/lib/formatters";
import { ArbitraryState, ValidNetwork } from "@/lib/tx-prepper/prepper-types";
import { prepareTX } from "@/lib/tx-prepper/tx-prepper";
import { WaitForReceipt } from "@/lib/types";
import { useDaoRecord } from "@/providers/DaoRecordProvider";
import { useFrameSDK } from "@/providers/FramesSDKProvider";
import { useParams } from "next/navigation";
import { fromHex } from "viem";
import Link from "next/link";

const getPropidFromReceipt = (receipt: WaitForReceipt): number | null => {
  if (!receipt || !receipt.logs[0].topics[1]) return null;

  return fromHex(receipt.logs[0].topics[1], "number");
};

export default function Proposal() {
  const params = useParams<{ proposaltype: string }>();

  const { isLoaded, connector } = useFrameSDK();
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { daoid, daochain, daosafe, daochainid } = useDaoRecord();

  const [propid, setPropid] = useState<number | null>(null);
  const [propTitle, setPropTitle] = useState<string | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);

  const {
    writeContract,
    data: hash,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useWriteContract();

  const {
    data: receiptData,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: hash,
  });

  useEffect(() => {
    if (params.proposaltype && validFormId(params.proposaltype)) {
      setFormConfig(FORM_CONFIGS[params.proposaltype]);
    }
  }, [params]);

  useEffect(() => {
    if (!receiptData || !receiptData.logs[0].topics[1]) return;
    setPropid(getPropidFromReceipt(receiptData));
  }, [receiptData]);

  const openProposalCastUrl = useCallback(() => {
    sdk.actions.composeCast({
      text: propTitle || "A new proposal",
      embeds: [
        `https://proposals.farcastle.net/dao/${daochain}/${daoid}/proposal/${propid}`,
      ],
    });
  }, [propid, daoid, daochain, propTitle]);

  const openUrl = useCallback(() => {
    sdk.actions.openUrl(`${getExplorerUrl(daochain)}/tx/${hash}`);
  }, [hash, daochain]);

  const handleSend = async (values: ArbitraryState) => {
    if (!formConfig) return;

    const wholeState = {
      formValues: {
        ...values,
      },
      senderAddress: address,
      // TODO: is safeID and chainID needed at both levels?
      // chainId: daochain,
      // safeId: daosafe,
      daoId: daoid,
      localABIs: {},
    };

    let tx = formConfig.tx;
    if (formConfig.txToggle && values.txKey) {
      tx = formConfig.txToggle[values.txKey];
    }

    const txPrep = await prepareTX({
      tx,
      chainId: daochain as ValidNetwork,
      safeId: daosafe,
      appState: wholeState,
      argCallbackRecord: {},
      localABIs: {},
    });

    console.log("txPrep", txPrep);
    if (!txPrep) return;

    setPropTitle(values.title);
    writeContract(txPrep);
  };

  const renderError = (error: Error | null) => {
    if (!error) return null;
    return (
      <div className="text-destructive text-xs mt-1">
        Error: {truncateError(error.message)}
      </div>
    );
  };

  const validChain = chainId === daochainid;

  const [shouldSwitch, setShouldSwitch] = useState(false);

  useEffect(() => {
    if (shouldSwitch) {
      switchChain({ chainId: getWagmiChainObj(daochain).id });
      setShouldSwitch(false);
    }
  }, [shouldSwitch, switchChain, daochain]);

  const handleChainSwitch = useCallback(() => {
    setShouldSwitch(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!formConfig) return null;

  return (
    <>
      <div className="w-full h-full space-y-4 pb-4 px-4">
        <Card className="flex flex-col items-center px-4 pt-4 pb-8 rounded-none">
          <div className="text-muted font-display text-3xl uppercase mb-4">
            {formConfig.title}
          </div>

          {!isConfirmed && (
            <FormSwitcher
              formConfig={formConfig}
              confirmed={isConfirmed}
              loading={isSendTxPending || isConfirming}
              invalidConnection={!isConnected || !validChain}
              handleSubmit={handleSend}
              formElmClass="w-full space-y-4"
            />
          )}

          <div className="flex flex-col gap-2 w-full">
            {isSendTxError && renderError(sendTxError)}

            {!isConnected && (
              <Button
                onClick={() => connect({ connector: connector })}
                className="mt-2"
              >
                Connect
              </Button>
            )}

            {isConfirmed && (
              <div className="flex flex-col items-center gap-8">
                <Image
                  src="/heart.svg"
                  alt="Success"
                  width={300}
                  height={254}
                />
                <div className="flex flex-col w-full items-center gap-2">
                  {propid && (
                    <>
                      <Link
                        href={`/dao/${daochain}/${daoid}/proposal/${propid}`}
                        className="w-full"
                      >
                        <Button className="w-full">View Proposal</Button>
                      </Link>
                      <Button onClick={openProposalCastUrl} className="w-full">
                        Cast Proposal
                      </Button>
                    </>
                  )}
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
          </div>
        </Card>
      </div>
    </>
  );
}
