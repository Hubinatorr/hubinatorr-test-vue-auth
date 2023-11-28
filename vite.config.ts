import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import replace from '@rollup/plugin-replace';

import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
    	reactRefresh(),
	    replace({ __VERSION__: `'${pkg.version}'` }),
    ],
	build: {
		target: 'modules',
		outDir: 'lib',
		lib: {
			entry: pkg.source,
			fileName: 'index',
			name: 'auth0n',
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			external: Object.keys(pkg.peerDependencies),
		},
	},
})
