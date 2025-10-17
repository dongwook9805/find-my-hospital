module.exports = {
  root: true,
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname
  },
  env: {
    browser: true,
    es2024: true
  },
  extends: [
    "standard-with-typescript",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  plugins: ["react-refresh"],
  rules: {
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/react-in-jsx-scope": "off",
    "react-refresh/only-export-components": "warn"
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};
