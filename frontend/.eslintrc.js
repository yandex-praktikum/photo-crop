module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	files: ['**/*.ts', '**/*.tsx'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react-hooks/recommended',
		'prettier',
		'plugin:storybook/recommended',
	],
	ignorePatterns: ['dist', '.eslintrc.js', 'jest.config.cjs', '!.storybook'],
	parser: '@typescript-eslint/parser',
	plugins: ['react-refresh'],
	rules: {
		'react-refresh/only-export-components': [
			'warn',
			{ allowConstantExport: true },
		],
	},
	overrides: [
		{
			files: ['tests/**/*'],
			env: {
				jest: true,
			},
		},
	],
};
