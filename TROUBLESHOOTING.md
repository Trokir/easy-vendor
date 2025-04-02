# Troubleshooting

This document contains information about common issues when developing Easy Vendor and how to solve them.

## Common Issues

### Installation Problems

#### Node.js Version Conflicts

**Problem**: Error messages related to incompatible Node.js version.
**Solution**: Use nvm (Node Version Manager) to install and use the correct Node.js version specified in `.nvmrc`.

```bash
nvm install
nvm use
```

#### Package Installation Failures

**Problem**: npm install fails with dependency errors.
**Solution**: Clear npm cache and retry.

```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Development Server Issues

#### Port Already in Use

**Problem**: The development server can't start because the port is already in use.
**Solution**: Kill the process using the port or change the port.

```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 [PID]

# Or start with different port
npm run dev -- --port 3001
```

### Testing Issues

#### Tests Timeout

**Problem**: Tests are timing out.
**Solution**: Increase timeout setting in vitest.config.ts.

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    timeout: 10000, // 10 seconds
  }
});
```

### Build Issues

#### Out of Memory

**Problem**: Build process fails with out of memory error.
**Solution**: Increase Node.js memory limit.

```bash
export NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

## Getting Help

If you encounter an issue not covered in this document, please:

1. Check existing GitHub issues
2. Create a new issue with detailed information about the problem
3. Contact the development team on Slack in the #easy-vendor channel 