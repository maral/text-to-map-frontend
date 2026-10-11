import { ADDRESS_FILE_YEARS, getAddressesFile } from "@/utils/dataCache";

// Prerendered at build time into static files, one per year.
export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = () =>
  ADDRESS_FILE_YEARS.map((year) => ({ year: String(year) }));

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ year: string }> }
) => {
  const { year } = await params;
  return Response.json(await getAddressesFile(Number(year)));
};
