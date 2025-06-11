import { format } from "date-fns";

export const truncateString = (string: string, length: number) => {
  return string.length > length ? `${string.slice(0, length)} ...` : string;
};

export const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};

export const truncateError = (message: string) => {
  if (!message) return "";
  return `${message.slice(0, 25)}...`;
};

export const PROPOSAL_TYPE_LABELS: Record<string, string> = {
  SIGNAL: "Signal Proposal",
  ISSUE: "Token Proposal",
  ADD_SHAMAN: "Shaman Proposal",
  TRANSFER_ERC20: "Funding Proposal",
  TRANSFER_NETWORK_TOKEN: "Funding Proposal",
  UPDATE_GOV_SETTINGS: "Governance Proposal",
  TOKEN_SETTINGS: "Token Proposal",
  TOKENS_FOR_SHARES: "Token Proposal",
  GUILDKICK: "Token Proposal",
  WALLETCONNECT: "WalletConnect Proposal",
  MULTICALL: "Multicall Proposal",
  ADD_SIGNER: "Add Safe Signer Proposal",
};
export const getProposalTypeLabel = (
  proposalType: string,
  proposalTypes: Record<string, string> = PROPOSAL_TYPE_LABELS
) => proposalTypes?.[proposalType] || "Unknown Proposal Type";

export const formatShortDateTimeFromSeconds = (
  seconds: string | undefined
): string | undefined => {
  if (!seconds) {
    return;
  }

  return format(new Date(Number(seconds) * 1000), "MMM do, p z");
};
