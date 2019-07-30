module.exports = {
  env: {
    browser: true
  },
  parser: "@typescript-eslint/parser",
  extends: "eslint:recommended",
  rules: {
    "semi": ["error", "always"],
    "indent": ["error", 4],
    "no-unused-vars": ["off"],
    "no-undef": ["off"]
  }
}
