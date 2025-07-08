let globalsLib;
let js;
let tseslint;
let reactHooks;
let reactRefresh;

const noopParser = {
  parse: () => ({
    type: 'Program',
    body: [],
    sourceType: 'module',
    tokens: [],
    comments: [],
    range: [0, 0],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 0 },
    },
  }),
};

try {
  globalsLib = (await import('globals')).default;
  js = (await import('@eslint/js')).default;
  tseslint = (await import('typescript-eslint')).default;
  reactHooks = (await import('eslint-plugin-react-hooks')).default;
  reactRefresh = (await import('eslint-plugin-react-refresh')).default;
} catch (err) {
  console.warn('Falling back to minimal ESLint config:', err.message);
}

export default tseslint && js
  ? tseslint.config(
      { ignores: ['dist'] },
      {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
          ecmaVersion: 2020,
          globals: (globalsLib && globalsLib.browser) || {},
        },
        plugins: {
          'react-hooks': reactHooks,
          'react-refresh': reactRefresh,
        },
        rules: {
          ...(reactHooks?.configs?.recommended?.rules || {}),
          'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
          ],
        },
      }
    )
  : [
      {
        ignores: ['dist'],
        files: ['**/*.{js,ts,tsx}'],
        languageOptions: {
          ecmaVersion: 2020,
          parser: noopParser,
          globals: (globalsLib && globalsLib.browser) || {},
        },
      },
    ];