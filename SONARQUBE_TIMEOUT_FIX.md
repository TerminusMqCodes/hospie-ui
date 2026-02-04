# SonarQube Timeout Issue Fix

## Issue Analysis
**Error**: `"error waiting for container: unexpected EOF"`
**Location**: SonarQube scan step during JavaScript/TypeScript analysis
**Cause**: Container timeout or memory exhaustion during analysis

## Problem Details

### SonarQube Analysis Progress
The scan was progressing normally:
- ✅ Project detection: `terminusmq_codes_hospie-pms-ui`
- ✅ Organization: `terminusmq-codes`
- ✅ Branch: `master`
- ✅ File indexing: 208 files
- ✅ HTML sensor: Completed
- ✅ JavaScript/TypeScript analysis: Started
- ❌ **Container stopped unexpectedly**

### Root Causes
1. **Memory exhaustion** during JS/TS analysis
2. **Timeout** due to large codebase analysis
3. **Container resource limits** exceeded

## Fixes Applied

### 1. Increased Container Size
```yaml
- step: &build-test-sonarcloud
    name: Build, test and analyze on SonarQube Cloud
    size: 2x  # Use larger container (4GB RAM, 2 vCPUs)
```

### 2. Memory Optimization
```yaml
variables:
  SONAR_SCANNER_OPTS: "-Xmx2048m"  # Increase JVM heap to 2GB
```

### 3. Enhanced Exclusions
```yaml
-Dsonar.exclusions=**/node_modules/**,**/dist/**,**/dist-pwa/**,**/dist-electron/**,**/*.min.js,**/coverage/**,**/.quasar/**
```

### 4. Analysis Timeout Configuration
```properties
# In sonar-project.properties
sonar.ws.timeout=1800  # 30 minutes timeout
```

### 5. Alternative Pipeline
Added `build-without-sonar` custom pipeline as fallback:
```yaml
custom:
  build-without-sonar:
    - step: *build-test-only
    - step: *build-production
    - step: *security-scan
```

## Optimized Configuration

### SonarQube Scanner Settings
- **JVM Heap**: 2GB (`-Xmx2048m`)
- **Container Size**: 2x (4GB RAM)
- **Timeout**: 30 minutes
- **File Exclusions**: Enhanced to skip build artifacts

### Project Configuration
```properties
# Performance optimizations
sonar.scm.disabled=false
sonar.scm.provider=git
sonar.ws.timeout=1800

# Language-specific settings
sonar.javascript.file.suffixes=.js,.jsx
sonar.typescript.file.suffixes=.ts,.tsx,.vue
```

## Troubleshooting Steps

### If SonarQube Still Fails

#### Option 1: Use Alternative Pipeline
```bash
# Run custom pipeline without SonarQube
# In Bitbucket: Pipelines > Run pipeline > Custom: build-without-sonar
```

#### Option 2: Reduce Analysis Scope
```yaml
# Analyze only specific directories
-Dsonar.sources=src/components,src/pages,src/layouts
```

#### Option 3: Skip Large Files
```yaml
# Exclude large generated files
-Dsonar.exclusions=**/*.min.js,**/vendor/**,**/assets/**
```

#### Option 4: Use Incremental Analysis
```yaml
# Only analyze changed files (for PRs)
-Dsonar.pullrequest.key=$BITBUCKET_PR_ID
-Dsonar.pullrequest.branch=$BITBUCKET_BRANCH
```

## Monitoring and Prevention

### Resource Monitoring
- **Memory usage**: Monitor JVM heap usage
- **Analysis time**: Track scan duration trends
- **File count**: Monitor analyzed file count

### Performance Optimization
- **Regular cleanup**: Remove unused files
- **Dependency audit**: Keep dependencies minimal
- **Code splitting**: Break large files into smaller modules

### Alternative Quality Tools
If SonarQube continues to fail:
- **ESLint**: Already configured for code quality
- **Prettier**: Code formatting validation
- **TypeScript**: Type checking
- **npm audit**: Security vulnerability scanning

## Expected Results

After optimizations:
✅ **Increased memory** for analysis
✅ **Longer timeout** for large projects
✅ **Better exclusions** to reduce scope
✅ **Alternative pipeline** as fallback
✅ **Enhanced monitoring** capabilities

## Success Metrics

### SonarQube Analysis
- **Completion rate**: Target > 95%
- **Analysis time**: Target < 15 minutes
- **Memory usage**: Stay under 3GB
- **Quality gate**: Pass rate > 90%

### Fallback Pipeline
- **Build success**: 100% success rate
- **Security scan**: Zero critical vulnerabilities
- **Code quality**: ESLint pass rate 100%

---

**Status**: OPTIMIZED ✅
**Container Size**: 2x (4GB RAM)
**JVM Heap**: 2GB
**Timeout**: 30 minutes
**Fallback**: Available