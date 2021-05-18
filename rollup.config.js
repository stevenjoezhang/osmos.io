import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'client.js',
    plugins: [resolve(), commonjs()]
};
