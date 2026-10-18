const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch monorepo root to allow resolving hoisted/pnpm symlinked packages
config.watchFolders = [monorepoRoot];

// 2. Add both project and workspace node_modules to resolution paths
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Intercept HMRClient resolution so Metro directly uses Expo's async-require HMR
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'expo/src/async-require/hmr.ts' ||
    moduleName.endsWith('async-require/hmr.ts')
  ) {
    try {
      const resolved = require.resolve('expo/src/async-require/hmr.ts', {
        paths: [projectRoot],
      });
      return {
        type: 'sourceFile',
        filePath: resolved,
      };
    } catch (e) {}
  }

  if (
    moduleName === '../Utilities/HMRClient' ||
    moduleName === './HMRClient' ||
    moduleName.endsWith('/Libraries/Utilities/HMRClient') ||
    moduleName.endsWith('/Libraries/Utilities/HMRClient.js')
  ) {
    try {
      const resolved = require.resolve('expo/src/async-require/hmr.ts', {
        paths: [projectRoot],
      });
      return {
        type: 'sourceFile',
        filePath: resolved,
      };
    } catch (e) {}
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
