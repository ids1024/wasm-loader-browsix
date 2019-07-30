module.exports = {
  env: {
    browser: true
  },
  parser: "@typescript-eslint/parser",
  extends: "eslint:recommended",
  globals: {
    WebAssembly: 'readonly'
  },
  rules: {
    "semi": ["error", "always"],
    "indent": ["error", 4]
  }
}
