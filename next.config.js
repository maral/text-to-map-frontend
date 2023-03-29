/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    largePageDataBytes: 20 * 1024 * 1024, // 20MB
  },
  // headers: async () => [
  //   {
  //     source: "/(.*)",
  //     headers: [
  //       {
  //         key: "Set-Cookie",
  //         value: "cross-site-cookie=.ko-fi.com/; SameSite=None; Secure",
  //       },
  //     ],
  //   },
  // ],
};

module.exports = nextConfig;
