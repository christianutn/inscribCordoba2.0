// jest.config.js (o jest.config.cjs)
// Usa 'export default' si es .js y tienes "type": "module" en package.json
export default {
  testEnvironment: 'node',

  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // ¡CAMBIO CLAVE AQUÍ! Ignora CERO patrones en node_modules
  transformIgnorePatterns: [],

  testMatch: [
    "<rootDir>/src/tests/**/*.test.js"
  ],
  // ... otras configuraciones (moduleNameMapper, coverage, etc.)
};