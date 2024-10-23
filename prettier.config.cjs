module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: ['*.md'],
      options: { parser: 'markdown-nocjsp' },
    },
  ],
}
