module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "util": require.resolve("util/"),
    "stream": require.resolve("stream-browserify")
  };
  return config;
} 