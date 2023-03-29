/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
