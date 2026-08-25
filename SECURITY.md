# Security Guidelines for Leadflow AI

## Critical Security Updates (2026-08-25)

### Fixed Vulnerabilities

1. **esbuild (0.28.1)**
   - Fixed: Directory traversal vulnerability on Windows via backslash in development server
   - Reference: GHSA-g7r4-m6w7-qqqr
   - Impact: Prevents unauthorized access to files outside the serve directory
   
   - Fixed: Integrity checks in Deno API
   - Reference: GHSA-gv7w-rqvm-qjhr
   - Impact: Verifies authenticity of downloaded binaries

2. **@grpc/grpc-js (1.9.16)**
   - Fixed: Server crash vulnerability when handling malformed requests
   - Reference: GHSA-5375-pq7m-f5r2
   - Impact: Prevents DoS attacks via malformed gRPC messages
   
   - Fixed: Client/server crash when handling malformed compressed messages
   - Reference: GHSA-99f4-grh7-6pcq
   - Impact: Prevents crashes due to malformed compression data

3. **vite (8.1.5)**
   - Multiple bug fixes and security improvements
   - Optimized build process security

4. **tsx (4.22.4)**
   - Fixed CommonJS directory require handling
   - Improved module resolution security

5. **websocket-driver (0.7.5)**
   - Enforced message length limits
   - Prevents connection abuse

6. **@babel/core (7.29.7)**
   - Improved source map handling
   - Better identifier preservation

## Environment Variables Security

### ✅ DO
- ✓ Use `.env.local` for local development (add to .gitignore)
- ✓ Use `VITE_` prefix for client-side variables (safe to expose in frontend)
- ✓ Store sensitive credentials in environment variables
- ✓ Use `.env.example` to document required variables
- ✓ Rotate API keys regularly
- ✓ Use different keys for development/staging/production

### ❌ DON'T
- ✗ Commit `.env`, `.env.local`, or any `.env.*.local` files
- ✗ Expose private API keys in the browser console
- ✗ Hardcode sensitive data in source files
- ✗ Use the same API keys across environments
- ✗ Share credentials in pull requests or issues
- ✗ Use credentials in version control history

## API Security Best Practices

### Google GenAI API
- Implement rate limiting to prevent abuse
- Validate all inputs before sending to the API
- Use API key restrictions (domain/IP whitelist if available)
- Monitor API usage for anomalies
- Rotate keys if compromised

### Firebase Security
- Enable Firebase Authentication
- Set up Firestore security rules
- Use Firebase App Check to verify client authenticity
- Implement database access controls
- Monitor Firebase usage in console
- Enable audit logging

## Frontend Security

### Input Validation
- Validate and sanitize all user inputs
- Use parameterized queries for any backend calls
- Implement CSP (Content Security Policy) headers

### Data Protection
- Never store sensitive data in localStorage
- Use httpOnly cookies when possible
- Encrypt sensitive data in transit (HTTPS only)
- Clear sensitive data on logout

### Dependencies
- Regular security audits: `npm audit`
- Update dependencies promptly: `npm update`
- Review dependency changelogs before updating
- Use lock files (package-lock.json) for consistency

## Development Server Security

### Vite Dev Server
- Only run on `localhost` or private networks in development
- Use `--host 0.0.0.0` only in secure environments
- Disable source maps in production builds
- Review Vite security advisories regularly

### Express Server
- Validate all incoming requests
- Use helmet.js for security headers
- Implement CORS properly
- Use HTTPS in production
- Implement rate limiting
- Add request size limits

## Deployment Security Checklist

- [ ] All environment variables configured correctly
- [ ] No secrets in source code
- [ ] Dependencies updated to latest secure versions
- [ ] Build process verified
- [ ] Security headers configured
- [ ] HTTPS/TLS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] Error handling doesn't leak sensitive info
- [ ] Logging doesn't contain sensitive data
- [ ] Database backups secured
- [ ] Access logs monitored
- [ ] Security updates monitored

## Reporting Security Issues

If you discover a security vulnerability, please email security@leadflow-ai.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**Do NOT** open a public issue for security vulnerabilities.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security](https://snyk.io/blog/10-react-security-best-practices/)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)

## Last Updated
2026-08-25 - Security dependencies updated
