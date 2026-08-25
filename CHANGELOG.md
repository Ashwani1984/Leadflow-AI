# Changelog

All notable changes to this project will be documented in this file.

## [0.0.1] - 2026-08-25

### Security Updates 🔒
- **CRITICAL**: Updated esbuild to 0.28.1 - Fixed directory traversal vulnerability on Windows (GHSA-g7r4-m6w7-qqqr)
- **CRITICAL**: Updated esbuild to 0.28.1 - Added integrity checks to Deno API (GHSA-gv7w-rqvm-qjhr)
- **HIGH**: Updated @grpc/grpc-js to 1.9.16 - Fixed server crash on malformed requests (GHSA-5375-pq7m-f5r2)
- **HIGH**: Updated @grpc/grpc-js to 1.9.16 - Fixed client/server crash on malformed compressed messages (GHSA-99f4-grh7-6pcq)
- Updated vite to 8.1.5 - Multiple security and bug fixes
- Updated tsx to 4.22.4 - Improved module resolution and CommonJS handling
- Updated @babel/core to 7.29.7 - Better source map handling
- Updated websocket-driver to 0.7.5 - Message length limit enforcement

### Added
- `.env.example` - Environment configuration template
- `SECURITY.md` - Comprehensive security guidelines and best practices
- `CHANGELOG.md` - This file
- Enhanced `.gitignore` - Better protection for sensitive files

### Changed
- Updated all direct dependencies to latest stable versions
- Improved dev server configuration security
- Enhanced environment variable handling

### Fixed
- Directory traversal vulnerability in development server
- gRPC server stability issues
- Module resolution and CommonJS compatibility
- WebSocket message handling

### Deprecated
- Old esbuild configuration (< 0.28.0) no longer supported

### Removed
- Legacy build configurations

### Notes
- All environment variables should be stored in `.env.local`
- Never commit secrets to version control
- Review SECURITY.md for detailed guidelines
- Run `npm audit` regularly to check for vulnerabilities

---

## Future Versions

### Planned
- Implement GitHub Actions for automated security scanning
- Add SonarQube integration for code quality
- Implement automated dependency updates with Dependabot
- Add E2E security testing
