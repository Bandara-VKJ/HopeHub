const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const stubPath = path.resolve(__dirname, "livekit-web-stub.js");

const LIVEKIT_PACKAGES = [
  "@livekit/react-native",
  "@livekit/react-native-webrtc",
  "livekit-client",
  "web-streams-polyfill",
];

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Web only: swap the native calling libraries for a no-op stub
  if (
    platform === "web" &&
    LIVEKIT_PACKAGES.some(
      (pkg) => moduleName === pkg || moduleName.startsWith(pkg + "/")
    )
  ) {
    return { type: "sourceFile", filePath: stubPath };
  }

  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;