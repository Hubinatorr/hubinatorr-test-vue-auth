module.exports = {
	extends: [
		'airbnb-typescript',
		'airbnb/hooks',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
	],
	env: {
		browser: true,
	},
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: './tsconfig.json',
	},
	// ignorePatterns: ['.eslintrc.js'],
	rules: {
		indent: 'off',
		'@typescript-eslint/indent': ['error', 'tab', { SwitchCase: 1 }],
		'no-tabs': ['off'],
		'react/jsx-indent': ['error', 'tab'],
		'react/jsx-indent-props': ['error', 'tab'],
		'import/prefer-default-export': 'off', // Allow single Named-export
		'react/prop-types': 'off', // Why use prop-types when we have interfaces
	},
	overrides: [
		{
			files: [
				'**/*.stories.*',
			],
			rules: {
				'import/no-anonymous-default-export': 'off',
				'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
				'react/jsx-props-no-spreading': 'off',
			},
		},
	],
};

// 		"template-curly-spacing": 0,
// 		"react/jsx-indent": ["error", "tab"],
// 		"react/jsx-indent-props":  ["error", "tab"],
// 		"no-tabs": ["off"],
// 		"max-len": ["error", 120],
// 		"object-curly-newline": ["error", {
// 		"ObjectPattern": { "multiline": true }
// 	}],
// 		"react/prefer-stateless-function": ["off"],
// 		"no-param-reassign": ["error", {
// 		"ignorePropertyModificationsFor": ["draft"]
// 	}],
// 		"react/static-property-placement": ["error", "static public field"]
// }
// }
