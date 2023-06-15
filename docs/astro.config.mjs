import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://rowlinsonmike.github.io",
  base: "/security-group-console",
  integrations: [
    starlight({
      logo: { src: "/src/assets/sgc-logo.svg" },
      title: "",
      social: {
        github: "https://github.com/withastro/starlight",
      },
      sidebar: [
        {
          label: "Start Here",
          autogenerate: { directory: "start" },
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
      ],
    }),
  ],
});
