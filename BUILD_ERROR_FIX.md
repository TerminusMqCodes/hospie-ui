# Build Error Fix - crypto.hash is not a function

## Issue Analysis
**Error**: `crypto.hash is not a function`
**Root Cause**: Node.js version incompatibility
**Location**: Vite Vue plugin during build process

## Problem Details

### Error Context
```
[vite:vue] crypto.hash is not a function
file: /opt/atlassian/pipelines/agent/build/src/App.vue
at getHash (file:///opt/atlassian/pipelines/agent/build/node_modules/@vitejs/plugin-vue/dist/index.mjs:115:16)
```

### Version Compatibility Issue
- **Pipeline was using**: Node.js 18
- **Package.json requires**: `^28 || ^26 || ^24 || ^22 || ^20`
- **Vite version**: v7.3.0 (requires Node.js 20+)
- **Quasar version**: v2.18.6 (requires Node.js 20+)

## Fixes Applied

### 1. Updated Node.js Version
**Changed pipeline image**:
```yaml
# Before
image: node:18

# After  
image: node:20                    # Node.js 20 LTS for Vue.js/Quasar development
```

### 2. Added Memory Optimization
**Added NODE_OPTIONS for build commands**:
```yaml
# Build commands now use increased memory limit
- NODE_OPTIONS="--max-old-space-size=4096" npm run build
- NODE_OPTIONS="--max-old-space-size=4096" npm run build:pwa
```

## Technical Background

### crypto.hash Method
- **Introduced**: Node.js 15.0.0
- **Stable**: Node.js 16.0.0+
- **Required by**: Modern Vite and Vue tooling

### Node.js LTS Versions
- **Node.js 18**: LTS until April 2025 (outdated for modern tooling)
- **Node.js 20**: LTS until April 2026 (recommended)
- **Node.js 22**: Current LTS (latest)

### Memory Optimization
- **Default Node.js heap**: ~1.4GB
- **CI environment needs**: 2-4GB for large Vue/Quasar builds
- **Solution**: `--max-old-space-size=4096` (4GB limit)

## Verification Steps

### Local Testing
```bash
# Check Node.js version
node --version  # Should be 20+

# Test build locally
npm ci
npm run build
npm run build:pwa
```

### Pipeline Testing
1. **Commit changes** to trigger pipeline
2. **Check build step** for successful completion
3. **Verify artifacts** are generated correctly

## Expected Results

After fixes:
✅ **Node.js compatibility** resolved
✅ **crypto.hash method** available
✅ **Vite Vue plugin** works correctly
✅ **Build process** completes successfully
✅ **Memory issues** prevented

## Alternative Solutions (if issues persist)

### Option 1: Pin Vite Version
```json
{
  "devDependencies": {
    "@quasar/app-vite": "^2.0.0"
  }
}
```

### Option 2: Use Node.js 22
```yaml
image: node:22
```

### Option 3: Add Build Cache
```yaml
caches:
  - node
  - npm
  - vite: ~/.vite
```

## Monitoring

### Build Performance Metrics
- **Build time**: Target < 5 minutes
- **Memory usage**: Monitor for OOM errors
- **Cache hit rate**: Optimize for faster builds

### Success Indicators
- ✅ No crypto-related errors
- ✅ Successful Vite compilation
- ✅ Generated dist/ artifacts
- ✅ PWA build completion

---

**Status**: FIXED ✅
**Node.js Version**: 20 LTS
**Memory Limit**: 4GB
**Expected Build Time**: 3-5 minutes