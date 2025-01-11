import { ImageResponse } from "next/og";

export const alt = "Farcastle DAO Proposals";
export const size = {
  width: 600,
  height: 400,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center relative text-[#00B1CC] bg-[#341A34]">
        <h1 tw="text-6xl">Farcastle DAO Proposals</h1>
      </div>
    ),
    {
      ...size,
    }
  );
}
