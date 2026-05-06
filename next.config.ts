import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy URL from the old hpsoyster.com PHP site → new internships page
      { source: "/form.php", destination: "/internships", permanent: true },
    ];
  },
};

export default nextConfig;
