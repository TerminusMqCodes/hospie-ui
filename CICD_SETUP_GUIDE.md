# CI/CD Setup Guide for Hospie UI

## Overview
This guide explains how to set up Continuous Integration and Continuous Deployment for the Hospie UI project using Bitbucket Pipelines and SonarQube Cloud.

## Prerequisites

### 1. SonarQube Cloud Setup
1. **Create SonarQube Cloud Account**
   - Go to [SonarQube Cloud](https://sonarcloud.io/)
   - Sign up with your Bitbucket account

2. **Create Organization**
   - Create a new organization or use existing one
   - Note down the organization key

3. **Create Project**
   - Import your Bitbucket repository
   - Note down the project key (should be `hospie-ui`)

4. **Generate Token**
   - Go to My Account > Security > Generate Tokens
   - Create a token for CI/CD
   - Copy the token securely

### 2. Bitbucket Repository Variables
Set up the following repository variables in Bitbucket:

**Repository Settings > Pipelines > Repository variables:**

| Variable Name | Value | Secured |
|---------------|-------|---------|
| `SONAR_TOKEN` | Your SonarQube token | ✅ Yes |
| `SONAR_ORGANIZATION` | Your SonarQube organization key | ❌ No |

## Pipeline Configuration

### Files Created
- `bitbucket-pipelines.yml` - Main pipeline configuration
- `sonar-project.properties` - SonarQube project settings

### Pipeline Features

#### 1. **Build and Test Pipeline**
- ✅ Install Node.js dependencies
- ✅ Install Quasar CLI
- ✅ Run ESLint
- ✅ Run unit tests (if configured)
- ✅ Build the project
- ✅ Generate test coverage
- ✅ SonarQube code analysis

#### 2. **Quality Gate Check**
- ✅ Verify code quality standards
- ✅ Block deployment if quality gate fails

#### 3. **Production Build**
- ✅ Build optimized production bundle
- ✅ Build PWA version (if configured)
- ✅ Build Electron app (if configured)
- ✅ Store build artifacts

#### 4. **Security Scan**
- ✅ NPM security audit
- ✅ Check for outdated packages

### Supported Branches

#### **Master/Main Branch**
- Full pipeline with all steps
- Production build
- Security scan

#### **Develop Branch**
- Build, test, and quality analysis
- No production build

#### **Pull Requests**
- Build and test validation
- Quality gate check

#### **Tags (v*)**
- Full pipeline for releases
- Artifact generation

### Custom Pipelines

#### **Manual Deployment**
- `deploy-staging` - Deploy to staging environment
- `deploy-production` - Deploy to production (manual trigger)

## Package.json Scripts

Ensure your `package.json` includes these scripts:

```json
{
  "scripts": {
    "lint": "eslint --ext .js,.ts,.vue ./",
    "lint:fix": "eslint --ext .js,.ts,.vue ./ --fix",
    "test:unit": "vitest",
    "test:coverage": "vitest --coverage",
    "build": "quasar build",
    "build:pwa": "quasar build -m pwa",
    "build:electron": "quasar build -m electron"
  }
}
```

## SonarQube Quality Profile

### Recommended Settings
- **Reliability**: A rating
- **Security**: A rating  
- **Maintainability**: A rating
- **Coverage**: > 80%
- **Duplicated Lines**: < 3%

### Code Quality Rules
- ESLint rules for JavaScript/TypeScript
- Vue.js specific rules
- Security vulnerability detection
- Code smell detection

## Troubleshooting

### Common Issues

#### 1. **SonarQube Token Issues**
```bash
Error: Invalid authentication token
```
**Solution**: Verify `SONAR_TOKEN` is correctly set in repository variables

#### 2. **Quality Gate Failure**
```bash
Quality gate failed
```
**Solution**: Check SonarQube dashboard for specific issues and fix code quality problems

#### 3. **Build Failures**
```bash
npm ERR! code ELIFECYCLE
```
**Solution**: Check package.json scripts and ensure all dependencies are properly defined

#### 4. **Test Failures**
```bash
Tests failed
```
**Solution**: Fix failing tests or update test configuration

### Debug Steps

1. **Check Pipeline Logs**
   - Go to Bitbucket > Pipelines
   - Click on failed pipeline
   - Review step-by-step logs

2. **Verify SonarQube Analysis**
   - Go to SonarQube Cloud dashboard
   - Check project analysis results
   - Review quality gate conditions

3. **Local Testing**
   ```bash
   # Test locally before pushing
   npm ci
   npm run lint
   npm run test:unit
   npm run build
   ```

## Best Practices

### 1. **Code Quality**
- Fix all critical and major issues
- Maintain test coverage above 80%
- Follow ESLint rules consistently

### 2. **Security**
- Regularly update dependencies
- Fix security vulnerabilities promptly
- Use `npm audit` locally

### 3. **Performance**
- Use caching for faster builds
- Optimize bundle size
- Monitor build times

### 4. **Deployment**
- Use manual triggers for production
- Test in staging first
- Monitor deployment success

## Monitoring and Maintenance

### Regular Tasks
- [ ] Review SonarQube quality reports weekly
- [ ] Update dependencies monthly
- [ ] Monitor pipeline success rates
- [ ] Review and update quality gates quarterly

### Metrics to Track
- Build success rate
- Test coverage percentage
- Code quality ratings
- Security vulnerability count
- Build duration trends

## Support

For issues with:
- **Bitbucket Pipelines**: Check Atlassian documentation
- **SonarQube Cloud**: Check SonarSource documentation
- **Quasar Framework**: Check Quasar documentation
- **Vue.js**: Check Vue.js documentation

---

**Status**: Ready for implementation
**Last Updated**: February 2026