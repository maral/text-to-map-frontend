/**
 * Writes the address files (see getAddressesFile) to public/data/addresses
 * before `next build`. They are plain static files rather than prerendered
 * routes because on Vercel every prerender served from the ISR cache costs
 * ISR read units, and these files are ~15 MB each.
 */
import fs from "fs/promises";
import path from "path";
import {
  ADDRESS_FILE_YEARS,
  ADDRESS_FILES_DIR,
  getAddressesFile,
} from "@/utils/dataCache";

const main = async () => {
  await fs.rm(ADDRESS_FILES_DIR, { recursive: true, force: true });
  await fs.mkdir(ADDRESS_FILES_DIR, { recursive: true });
  for (const year of ADDRESS_FILE_YEARS) {
    const file = await getAddressesFile(year);
    await fs.writeFile(
      path.join(ADDRESS_FILES_DIR, `${year}.json`),
      JSON.stringify(file)
    );
    console.log(`[address-files] ${year}: version ${file.version}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
