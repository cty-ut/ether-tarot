import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server', // 开启服务端渲染模式
  adapter: node({
    mode: 'standalone' // 独立模式，直接用 node 运行
  }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    })
  ],
});
