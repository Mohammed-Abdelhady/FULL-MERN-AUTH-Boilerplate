# SMTP Setup Guide (Nodemailer)

This guide explains how to set up Nodemailer for sending emails (registration verification, password reset, etc.).

## Overview

The application uses Nodemailer, a flexible email library for Node.js that supports multiple SMTP providers:

- **Gmail**: Free tier available, easy setup
- **Outlook/Office 365**: Microsoft email service
- **Custom SMTP**: Your own mail server
- **Other providers**: Mailgun, SendGrid, AWS SES, etc.

**Email Types**:

- Registration: 6-digit activation codes
- Password Reset: 6-digit reset codes
- Notifications: Account updates, security alerts

---

## Option 1: Gmail SMTP (Recommended for Development)

Gmail is the easiest option for development and testing.

### Prerequisites

- Gmail account
- Google App Password (required for SMTP access)

### Step 1: Enable 2-Factor Authentication

Gmail requires 2FA to use App Passwords.

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Navigate to **2-Step Verification**
3. Click **Get Started**
4. Follow the setup wizard:
   - Verify phone number
   - Choose verification method (SMS, authenticator app, etc.)
   - Enable 2-Step Verification

### Step 2: Create App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app:
   - **Select app**: Mail
   - **Select device**: Other (Custom name)
   - **Name**: `Auth Boilerplate` or your app name
3. Click **Generate**
4. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
5. Store securely (you won't see it again)

**Important**: Remove spaces when using the password.

### Step 3: Configure Environment Variables

Add to `backend/.env`:

```bash
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxxxxxxxxxxxxxx  # App Password (no spaces)

# Email sender
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Auth Boilerplate
```

### Gmail Limitations

- **Daily Limit**: 500 emails/day (2000/day for Google Workspace)
- **Rate Limit**: 100 emails/hour
- **Recipients**: Max 500 recipients per email

**For production**: Use a dedicated email service instead of Gmail.

---

## Option 2: Outlook/Office 365 SMTP

Microsoft email service with good deliverability.

### Step 1: Enable SMTP Authentication

1. Log in to [Outlook.com](https://outlook.com)
2. Go to **Settings** → **View all Outlook settings**
3. Navigate to **Mail** → **Sync email**
4. Ensure **SMTP** is enabled

### Step 2: Configure Environment Variables

Add to `backend/.env`:

```bash
# Outlook SMTP Configuration
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password

# Email sender
EMAIL_FROM=your-email@outlook.com
EMAIL_FROM_NAME=Auth Boilerplate
```

**For Office 365 (Business)**:

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
```

### Outlook Limitations

- **Daily Limit**: 300 emails/day (free), 10,000/day (business)
- **Recipients**: Max 500 recipients per email

---

## Option 3: Custom SMTP Server

Use your own mail server or hosting provider's SMTP.

### Common Providers

**cPanel Hosting**:

```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

**Namecheap Private Email**:

```bash
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
```

**GoDaddy Email**:

```bash
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=465
SMTP_SECURE=true
```

**Hostinger**:

```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
```

### Configuration

Add to `backend/.env`:

```bash
# Custom SMTP Configuration
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587          # Use 465 for SSL, 587 for TLS
SMTP_SECURE=false      # true for port 465, false for other ports
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password

# Email sender
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Auth Boilerplate
```

### Find Your SMTP Settings

Contact your hosting provider or check:

- cPanel: **Email Accounts** → **Connect Devices**
- Plesk: **Mail** → **Mail Settings**
- Provider documentation

---

## Option 4: Dedicated Email Services

For production, use a dedicated transactional email service.

### Mailgun

**Pros**: Generous free tier (5,000 emails/month), good deliverability

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASS=your-mailgun-password

EMAIL_FROM=noreply@yourdomain.com
```

**Setup**: [Mailgun Documentation](https://documentation.mailgun.com/en/latest/quickstart.html)

### SendGrid

**Pros**: 100 emails/day free, excellent deliverability

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

EMAIL_FROM=noreply@yourdomain.com
```

**Setup**: [SendGrid SMTP Integration](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)

### AWS SES (Amazon Simple Email Service)

**Pros**: Very cheap ($0.10 per 1,000 emails), scalable

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-smtp-username
SMTP_PASS=your-aws-smtp-password

EMAIL_FROM=noreply@yourdomain.com
```

**Setup**: [AWS SES SMTP Setup](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)

### Postmark

**Pros**: Excellent deliverability, 100 emails/month free

```bash
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=your-server-api-token
SMTP_PASS=your-server-api-token

EMAIL_FROM=noreply@yourdomain.com
```

**Setup**: [Postmark SMTP](https://postmarkapp.com/developer/user-guide/send-email-with-smtp)

---

## Environment Variables Reference

### Required Variables

| Variable      | Description                           | Example                  |
| ------------- | ------------------------------------- | ------------------------ |
| `SMTP_HOST`   | SMTP server hostname                  | `smtp.gmail.com`         |
| `SMTP_PORT`   | SMTP port (587 for TLS, 465 for SSL)  | `587`                    |
| `SMTP_SECURE` | Use SSL (true for 465, false for 587) | `false`                  |
| `SMTP_USER`   | SMTP username (usually email)         | `your-email@gmail.com`   |
| `SMTP_PASS`   | SMTP password or API key              | `xxxxxxxxxxxxxxxx`       |
| `EMAIL_FROM`  | Sender email address                  | `noreply@yourdomain.com` |

### Optional Variables

| Variable          | Description                          | Default            |
| ----------------- | ------------------------------------ | ------------------ |
| `EMAIL_FROM_NAME` | Display name for sender              | `Auth Boilerplate` |
| `SMTP_TLS_REJECT` | Reject unauthorized TLS certificates | `true`             |

---

## Backend Implementation

### Install Nodemailer

```bash
cd backend
npm install nodemailer
npm install -D @types/nodemailer
```

### Mail Service Example

Create `backend/src/mail/mail.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendActivationCode(email: string, code: string, name: string) {
    const mailOptions = {
      from: `"${this.configService.get('EMAIL_FROM_NAME')}" <${this.configService.get('EMAIL_FROM')}>`,
      to: email,
      subject: 'Verify Your Email - Activation Code',
      html: `
        <h2>Welcome ${name}!</h2>
        <p>Your activation code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; font-weight: bold;">${code}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `Welcome ${name}! Your activation code is: ${code}. This code will expire in 15 minutes.`,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordReset(email: string, code: string, name: string) {
    const mailOptions = {
      from: `"${this.configService.get('EMAIL_FROM_NAME')}" <${this.configService.get('EMAIL_FROM')}>`,
      to: email,
      subject: 'Password Reset Code',
      html: `
        <h2>Hello ${name}</h2>
        <p>You requested to reset your password. Use this code:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; font-weight: bold;">${code}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      `,
      text: `Hello ${name}. Your password reset code is: ${code}. This code will expire in 15 minutes.`,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async verifyConnection() {
    return this.transporter.verify();
  }
}
```

### Verify Configuration on Startup

Add to `backend/src/mail/mail.module.ts`:

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule implements OnModuleInit {
  constructor(private mailService: MailService) {}

  async onModuleInit() {
    try {
      await this.mailService.verifyConnection();
      console.log('✅ SMTP connection verified');
    } catch (error) {
      console.error('❌ SMTP connection failed:', error.message);
    }
  }
}
```

---

## Testing Email Sending

### Test Connection

```bash
cd backend
npm run start:dev
```

Look for console output:

- ✅ `SMTP connection verified` - Configuration is correct
- ❌ `SMTP connection failed` - Check credentials and settings

### Send Test Email

Create a test endpoint:

```typescript
@Get('test-email')
async testEmail() {
  await this.mailService.sendActivationCode(
    'test@example.com',
    '123456',
    'Test User'
  );
  return { message: 'Test email sent' };
}
```

Visit: `http://localhost:3000/api/test-email`

### Using cURL

```bash
curl http://localhost:3000/api/test-email
```

---

## Troubleshooting

### Error: "Invalid login: 535 Authentication failed"

**Gmail**:

- Use App Password, not regular password
- Enable 2FA first
- Remove spaces from App Password

**Other providers**:

- Verify username/password are correct
- Check if SMTP is enabled in account settings

### Error: "Connection timeout"

**Cause**: Firewall blocking SMTP port or wrong host.

**Solution**:

- Check `SMTP_HOST` is correct
- Try port 587 (TLS) or 465 (SSL)
- Check firewall/antivirus settings
- Some networks block port 25, 465, 587

**Test connection**:

```bash
telnet smtp.gmail.com 587
# Should connect successfully
```

### Error: "self signed certificate in certificate chain"

**Cause**: Self-signed SSL certificate.

**Solution**:

```bash
# Add to .env (development only!)
SMTP_TLS_REJECT=false
```

**Backend**:

```typescript
nodemailer.createTransport({
  // ...
  tls: {
    rejectUnauthorized: process.env.SMTP_TLS_REJECT !== 'false',
  },
});
```

### Error: "Greeting never received"

**Cause**: Wrong SMTP port or SSL/TLS configuration.

**Solution**:

- Port 587 → `SMTP_SECURE=false` (TLS/STARTTLS)
- Port 465 → `SMTP_SECURE=true` (SSL)
- Never use port 25 for client applications

### Error: "Message rejected: Email address is not verified"

**AWS SES Only**:

- In sandbox mode, both sender and recipient must be verified
- Request production access to send to any email
- [Verify email addresses](https://console.aws.amazon.com/ses/)

### Emails Going to Spam

**Solutions**:

1. **Authenticate your domain**: Set up SPF, DKIM, DMARC records
2. **Use a dedicated email service**: Gmail/Outlook flag bulk emails
3. **Avoid spam triggers**:
   - Don't use all caps in subject
   - Include plain text version
   - Add unsubscribe link
4. **Build sender reputation**: Start with low volume, increase gradually
5. **Use dedicated domain**: Don't send from gmail.com/outlook.com for production

---

## Email Best Practices

### HTML Email Templates

Create reusable templates:

```typescript
// templates/activation-email.html
function getActivationTemplate(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .code { font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #007bff; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome ${name}!</h2>
          <p>Thank you for registering. Please verify your email with this code:</p>
          <div class="code">${code}</div>
          <p>This code expires in 15 minutes.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;
}
```

### Always Include Plain Text

```typescript
{
  html: htmlContent,
  text: stripHtml(htmlContent), // Fallback for email clients that don't support HTML
}
```

### Rate Limiting

Prevent abuse:

```typescript
@Injectable()
export class MailService {
  private emailQueue = new Map<string, number>();

  async checkRateLimit(email: string) {
    const now = Date.now();
    const lastSent = this.emailQueue.get(email) || 0;

    if (now - lastSent < 60000) {
      // 1 minute cooldown
      throw new Error('Please wait before requesting another email');
    }

    this.emailQueue.set(email, now);
  }
}
```

### Error Handling

```typescript
try {
  await this.mailService.sendActivationCode(email, code, name);
} catch (error) {
  // Log error but don't expose details to user
  console.error('Email sending failed:', error);

  // Still return success to prevent email enumeration
  return { success: true };
}
```

---

## Production Recommendations

### Don't Use Gmail/Outlook

For production applications:

- ❌ Gmail: Daily limits, spam issues, not designed for bulk
- ❌ Outlook: Same issues as Gmail
- ✅ Use dedicated service: Mailgun, SendGrid, AWS SES, Postmark

### Set Up Domain Authentication

**SPF Record** (TXT record):

```
v=spf1 include:_spf.google.com ~all
```

**DKIM**: Provider-specific (check their documentation)

**DMARC Record** (TXT record):

```
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

### Monitor Deliverability

- Track bounce rates
- Monitor spam complaints
- Check blacklist status: [MXToolbox](https://mxtoolbox.com/blacklists.aspx)
- Review email logs regularly

### Use Environment-Specific Configs

```typescript
// Development: Use Ethereal (fake SMTP)
if (process.env.NODE_ENV === 'development') {
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}
```

**Ethereal**: Preview emails without sending: [ethereal.email](https://ethereal.email/)

---

## Alternative: Mailtrap (Development)

For development/testing without sending real emails:

```bash
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

**Benefits**:

- Catch all emails in one inbox
- Test email rendering
- Check spam score
- No risk of sending to real addresses

**Setup**: [Mailtrap](https://mailtrap.io/)

---

## Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Email Authentication (SPF, DKIM, DMARC)](https://www.cloudflare.com/learning/dns/dns-records/dns-spf-record/)
- [Email Deliverability Best Practices](https://sendgrid.com/blog/email-best-practices/)

---

## Support

For SMTP issues:

- [Nodemailer GitHub](https://github.com/nodemailer/nodemailer/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/nodemailer)
- Check your email provider's SMTP documentation
