const { currentYear } = require("./src/config/years.json");
const schoolRedirects = require("./src/config/school-redirects.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    largePageDataBytes: 20 * 1024 * 1024, // 20MB
  },
  // Keeps links and embeds of renamed schools working. Each rename takes effect
  // with the year its new name was introduced in. Query strings (embed
  // settings) are passed through.
  redirects: async () =>
    Object.entries(schoolRedirects)
      .filter(([year]) => Number(year) <= currentYear)
      .flatMap(([, redirects]) =>
        Object.entries(redirects).map(([from, to]) => ({
          source: `/s/${from}`,
          destination: `/s/${to}`,
          permanent: false,
        }))
      ),
};

module.exports = nextConfig;
