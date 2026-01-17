# Documentation Index

Complete documentation for setting up and deploying the Full-Stack Authentication Boilerplate.

## Quick Links

- [Main README](../README.md) - Project overview and quick start
- [CLAUDE.md](../CLAUDE.md) - AI assistant guidelines and project conventions

---

## Setup Guides

Step-by-step instructions for configuring external services required by the application.

### Email Service (Required)

- **[SMTP Setup (Nodemailer)](./setup-smtp.md)**
  - Choose provider (Gmail, Outlook, custom SMTP, etc.)
  - Configure SMTP credentials
  - Set up Nodemailer transporter
  - Test email sending
  - **Estimated time**: 10-30 minutes (varies by provider)

### Social Authentication (Optional)

- **[Google OAuth Setup](./setup-google-oauth.md)**
  - Create Google Cloud project
  - Enable Google+ API
  - Configure OAuth consent screen
  - Generate client credentials
  - **Estimated time**: 20-30 minutes

- **[Facebook OAuth Setup](./setup-facebook-oauth.md)**
  - Create Facebook Developer account
  - Register Facebook app
  - Configure Facebook Login
  - Set up permissions
  - **Estimated time**: 20-30 minutes

- **[GitHub OAuth Setup](./setup-github-oauth.md)**
  - Register OAuth app
  - Configure callback URLs
  - Handle private emails
  - Request user permissions
  - **Estimated time**: 10-15 minutes

---

## Development Guides

### Code Quality

- **[Code Quality Standards](./code-quality.md)**
  - Pre-commit hooks (Husky)
  - ESLint and Prettier configuration
  - TypeScript strict mode
  - Conventional commits
  - Testing guidelines

### Deployment

- **[Deployment Guide](./deployment.md)**
  - Docker development setup
  - Docker production setup
  - Vercel deployment
  - Environment configuration
  - SSL/HTTPS setup

- **[Production Setup](./PRODUCTION-SETUP.md)**
  - Complete production checklist
  - Security hardening
  - Performance optimization
  - Monitoring and logging

---

## Backend Documentation

- **[Authentication Flow](../backend/docs/authentication-flow.md)**
  - Registration with email verification
  - Login with email/password
  - OAuth social login (Google, Facebook, GitHub)
  - Session management
  - Logout and token invalidation

- **[User, Roles & Permissions](../backend/docs/user-roles-permissions.md)**
  - User model and schema
  - Role hierarchy (USER, SUPPORT, MANAGER, ADMIN)
  - Role-based access control (RBAC)
  - Permission system
  - Guard implementation

---

## Architecture

### Project Structure

```
/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── user/        # User management
│   │   ├── mail/        # Email service
│   │   └── ...
│   └── test/            # E2E tests
│
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   ├── components/  # UI components
│   │   ├── modules/     # Feature modules
│   │   └── ...
│   └── tests/           # Frontend tests
│
├── docs/                # Documentation (you are here)
│   ├── setup-*.md       # Setup guides
│   ├── deployment.md    # Deployment instructions
│   └── ...
│
├── openspec/            # Spec-driven development
│   ├── specs/           # Capability specifications
│   └── changes/         # Proposed changes
│
└── old-code/            # Legacy code (reference only)
```

### Tech Stack

**Backend**:

- NestJS 11 (Node.js framework)
- TypeScript 5.7
- MongoDB with Mongoose
- JWT authentication
- Nodemailer (email with SMTP)
- Passport.js (OAuth)

**Frontend**:

- Next.js 16 (React framework)
- TypeScript 5.x
- Tailwind CSS 4
- Redux Toolkit (state management)
- React Hook Form + Zod (forms)
- next-intl (i18n)

---

## Common Workflows

### Adding a New OAuth Provider

1. Create setup guide in `docs/setup-[provider]-oauth.md`
2. Add OAuth strategy in `backend/src/auth/strategies/`
3. Update `backend/src/auth/auth.controller.ts` with new endpoint
4. Add frontend button in `frontend/src/modules/auth/components/LoginForm.tsx`
5. Update environment variable documentation

### Adding a New Email Template

1. Create template in SendGrid dashboard
2. Add template ID to `backend/.env`
3. Create email service method in `backend/src/mail/mail.service.ts`
4. Add i18n translations for email content
5. Test with test user accounts

### Adding a New API Endpoint

1. Define requirement in OpenSpec (`openspec/specs/`)
2. Create DTO in `backend/src/[module]/dto/`
3. Add controller method in `backend/src/[module]/[module].controller.ts`
4. Implement service logic in `backend/src/[module]/[module].service.ts`
5. Add E2E tests in `backend/test/`
6. Update Swagger documentation

---

## Troubleshooting

### Email Not Sending

1. Verify SMTP credentials in `backend/.env`
2. Check SMTP host, port, and secure settings
3. Test SMTP connection with `telnet` command
4. Review backend logs for SMTP errors
5. Check spam folder on recipient email
6. See [SMTP Setup Guide](./setup-smtp.md#troubleshooting)

### OAuth Login Failing

1. Verify client ID and secret in `.env` files
2. Check redirect URIs match exactly (including protocol and port)
3. Ensure OAuth app is published/live (not in development mode)
4. Clear browser cookies and try again
5. See provider-specific troubleshooting guides

### Database Connection Error

1. Check MongoDB is running: `docker ps | grep mongo`
2. Verify `MONGO_URI` in `backend/.env`
3. Test connection: `mongosh <MONGO_URI>`
4. Check firewall/network settings
5. Review MongoDB logs for errors

### Build/Type Errors

1. Run type check: `tsc --noEmit`
2. Clear build cache: `rm -rf .next/ dist/`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Check for conflicting package versions
5. Review [Code Quality Guide](./code-quality.md#troubleshooting)

---

## Getting Help

### Documentation

- Check this documentation index
- Review specific setup guides
- Read inline code comments
- Check OpenSpec specifications

### Community

- [GitHub Issues](https://github.com/your-username/FULL-MERN-AUTH-Boilerplate/issues)
- [Stack Overflow](https://stackoverflow.com/) (tag: `nestjs`, `nextjs`, `oauth`)

### External Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [OAuth 2.0 Specification](https://oauth.net/2/)

---

## Contributing

1. Read [Code Quality Standards](./code-quality.md)
2. Follow [Conventional Commits](https://www.conventionalcommits.org/)
3. Write tests for new features
4. Update documentation
5. Submit pull request targeting `master` branch

---

## License

[MIT License](../LICENSE)

---

Last Updated: 2026-01-17
