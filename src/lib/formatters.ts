export const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};
export const proposalCastUrl = (
  daochain: string,
  daoid: string,
  propid: number
) => {
  return `https://warpcast.com/~/compose?text=&embeds[]=https://frames.farcastle.net/molochv3/${daochain}/${daoid}/proposals/${propid}`;
};
