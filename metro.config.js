const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Block Metro from watching non-existent tmp directories from expo-crypto
const { blockList: defaultBlockList } = config.resolver;
config.resolver.blockList = [
  ...(Array.isArray(defaultBlockList) ? defaultBlockList : defaultBlockList ? [defaultBlockList] : []),
  /expo-crypto_tmp_\d+/,
];

module.exports = config;
