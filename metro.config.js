const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs', 'mjs');

const config = {
  resolver: {
    sourceExts: defaultConfig.resolver.sourceExts,
  },
};

module.exports = mergeConfig(defaultConfig, config);
