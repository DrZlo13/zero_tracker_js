import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import * as child from "child_process";

const commit_hash = child.execSync("git rev-parse --short HEAD").toString();
const branch = child.execSync("git rev-parse --abbrev-ref HEAD").toString();

export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commit_hash.trim()),
    __BRANCH__: JSON.stringify(branch.trim()),
  },
  plugins: [svelte()],
  base: '/zero_tracker_js/',
})
