import { TokenBalance } from "@/lib/types";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { formatEther } from "viem";
import { Button } from "../ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ProposalFormLabel } from "./ProposalFormLabel";
import { WAGMI_CHAIN_OBJS } from "@/lib/constants";

const TokenItem = ({
  token,
  chainid,
}: {
  token: TokenBalance;
  chainid: string;
}) => {
  if (!chainid) return;
  const value = token.tokenAddress || "0x0";
  const label = token.token
    ? token.token.symbol
    : WAGMI_CHAIN_OBJS[chainid].nativeCurrency.symbol;
  return <SelectItem value={value}>{label}</SelectItem>;
};

export const TokenRequestSelect = ({
  disabled,
  tokens,
  chainid,
}: {
  disabled: boolean;
  tokens?: TokenBalance[];
  chainid: string;
}) => {
  const form = useFormContext();
  const [tokenBalance, setTokenBalance] = useState<string | undefined>();
  const [tokenBalanceText, setTokenBalanceText] = useState<
    string | undefined
  >();

  const selectedTokenAddress = form.watch("tokenAddress");

  useEffect(() => {
    if (selectedTokenAddress) {
      if (selectedTokenAddress === "0x0") {
        const nativeToken = tokens?.find(
          (token) => token.tokenAddress === null
        );

        console.log("nativeToken", nativeToken);
        setTokenBalance(nativeToken?.balance);
        setTokenBalanceText(
          `${formatEther(BigInt(nativeToken?.balance || "0"))} ${WAGMI_CHAIN_OBJS[chainid].nativeCurrency.symbol}`
        );
      } else {
        const targetToken = tokens?.find(
          (token) => token.tokenAddress === selectedTokenAddress
        );
        setTokenBalance(targetToken?.balance);
        setTokenBalanceText(
          `${formatEther(BigInt(targetToken?.balance || "0"))} ${targetToken?.token?.symbol}`
        );
      }
    }
  }, [selectedTokenAddress, tokens, chainid]);

  const handleMax = () => {
    form.setValue("tokenAmount", formatEther(BigInt(tokenBalance || "0")));
  };

  return (
    <div>
      <ProposalFormLabel
        label="Funding Amount"
        id="tokenAmount"
        requiredFields={["tokenAmount"]}
      />
      <div className="flex flex-row gap-2">
        <FormField
          control={form.control}
          name="tokenAmount"
          disabled={disabled}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input id="tokenAmount" placeholder="0" {...field} />
              </FormControl>
              {tokenBalance && (
                <Button
                  size="sm"
                  onClick={handleMax}
                  className="mt-2"
                  type="button"
                >
                  Max
                </Button>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tokenAddress"
          disabled={disabled}
          render={({ field }) => (
            <FormItem className="flex-1">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card rounded-none">
                  {tokens &&
                    tokens.map((token, i) => (
                      <TokenItem token={token} key={i} chainid={chainid} />
                    ))}
                </SelectContent>
              </Select>
              {tokenBalanceText && (
                <p className="text-xs mt-2">{tokenBalanceText}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
