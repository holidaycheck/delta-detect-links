/* eslint-env node */

import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const plugins = [
    nodeResolve({ jsnext: true, main: true, browser: true, extensions: [ '.js', '.json' ] }),
    commonjs({ namedExports: { 'node_modules/rich-text/index.js': [ 'Delta' ] } }),
    babel()
];

module.exports = {
    entry: 'lib/detectLinks.js',
    plugins,
    targets: [
        { dest: 'dist/detectLinks.cjs.js', format: 'cjs' },
        { dest: 'dist/detectLinks.amd.js', format: 'amd', moduleId: 'delta-detect-links' }
    ]
};
