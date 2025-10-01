/** @type {import('next').NextConfig} */
const nextConfig = {
  // Adicione esta configuração de webpack
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000, // Verifica por mudanças a cada 1000ms (1 segundo)
      aggregateTimeout: 300, // Agrupa múltiplas mudanças em uma única reconstrução
    };
    return config;
  },
};

module.exports = nextConfig;