import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
	{
		files: ["**/*.js"],
		plugins: { js },
		extends: ["js/recommended"],
		rules: {
			"no-unused-vars": "warn",
			"no-undef": "warn",
		},
	},
	...tseslint.configs.recommended.map((config) => ({
		...config,
		files: ["**/*.{ts,tsx}"],
	})),
	{
		files: ["**/*.{ts,tsx}"],
		rules: {
			"@typescript-eslint/no-unused-vars": "warn",
		},
	},
]);
