-- Seed Sample Static Pages
-- These provide example content for testing the catch-all routing system
-- Replace 'YOUR_USER_ID' with an actual user ID from your users table

PRAGMA foreign_keys = ON;

-- Insert sample pages
-- Note: You'll need to replace 'YOUR_USER_ID' with a real user ID from your database

INSERT OR IGNORE INTO pages (
    id,
    author_id,
    title,
    slug,
    content_md,
    content_html,
    excerpt,
    status,
    template,
    published_at,
    created_at,
    updated_at
) VALUES
-- About Page
(
    '00000000000000000000000000000001',
    'YOUR_USER_ID',
    'About EdgePress',
    'about',
    '# About EdgePress

EdgePress is a modern, serverless blog platform built for the edge. It combines the best of traditional CMS features with the performance and scalability of edge computing.

## Key Features

- **Edge-First Architecture**: Deployed on Cloudflare''s global network for ultra-fast response times
- **Modern Stack**: Built with SvelteKit, TypeScript, and Tailwind CSS
- **Flexible Content**: Markdown editing with live preview and syntax highlighting
- **Media Management**: Integrated Cloudflare Images for optimized delivery
- **Full-Text Search**: Fast search powered by SQLite FTS5
- **AI-Powered**: Integrated with Cloudflare AI for features like auto-summarization

## Technology

EdgePress leverages Cloudflare''s edge platform:
- **D1**: SQLite database at the edge
- **KV**: Global key-value storage for caching
- **Workers AI**: On-demand AI capabilities
- **Vectorize**: Vector database for semantic search
- **Images**: Optimized image delivery

## Open Source

EdgePress is open source and available on GitHub. Contributions are welcome!

## Contact

Have questions or want to get in touch? Visit our [contact page](/contact).',
    '<h1>About EdgePress</h1>
<p>EdgePress is a modern, serverless blog platform built for the edge. It combines the best of traditional CMS features with the performance and scalability of edge computing.</p>
<h2>Key Features</h2>
<ul>
<li><strong>Edge-First Architecture</strong>: Deployed on Cloudflare''s global network for ultra-fast response times</li>
<li><strong>Modern Stack</strong>: Built with SvelteKit, TypeScript, and Tailwind CSS</li>
<li><strong>Flexible Content</strong>: Markdown editing with live preview and syntax highlighting</li>
<li><strong>Media Management</strong>: Integrated Cloudflare Images for optimized delivery</li>
<li><strong>Full-Text Search</strong>: Fast search powered by SQLite FTS5</li>
<li><strong>AI-Powered</strong>: Integrated with Cloudflare AI for features like auto-summarization</li>
</ul>
<h2>Technology</h2>
<p>EdgePress leverages Cloudflare''s edge platform:</p>
<ul>
<li><strong>D1</strong>: SQLite database at the edge</li>
<li><strong>KV</strong>: Global key-value storage for caching</li>
<li><strong>Workers AI</strong>: On-demand AI capabilities</li>
<li><strong>Vectorize</strong>: Vector database for semantic search</li>
<li><strong>Images</strong>: Optimized image delivery</li>
</ul>
<h2>Open Source</h2>
<p>EdgePress is open source and available on GitHub. Contributions are welcome!</p>
<h2>Contact</h2>
<p>Have questions or want to get in touch? Visit our <a href="/contact">contact page</a>.</p>',
    'A modern, serverless blog platform built for the edge with SvelteKit and Cloudflare.',
    'published',
    'page.njk',
    datetime('now'),
    datetime('now'),
    datetime('now')
),
-- Privacy Policy Page
(
    '00000000000000000000000000000002',
    'YOUR_USER_ID',
    'Privacy Policy',
    'privacy',
    '# Privacy Policy

**Last Updated:** December 2, 2025

## Introduction

This Privacy Policy describes how EdgePress ("we", "our", or "us") collects, uses, and protects your information when you visit our website.

## Information We Collect

### Automatically Collected Information

When you visit our site, we automatically collect certain information:
- **Usage Data**: Pages visited, time spent, referrer information
- **Technical Data**: IP address, browser type, device information
- **Performance Metrics**: Page load times, error logs

### Information You Provide

We collect information you voluntarily provide:
- **Contact Forms**: Name, email, message content
- **Newsletter**: Email address (if you subscribe)
- **Comments**: Name, email, comment content (if enabled)

## How We Use Your Information

We use collected information to:
- Provide and maintain our service
- Improve user experience
- Send newsletters (if subscribed)
- Respond to inquiries
- Analyze usage patterns
- Detect and prevent abuse

## Data Storage

- **Location**: Data is stored on Cloudflare''s global network
- **Security**: Industry-standard encryption and security practices
- **Retention**: Logs retained for 30 days, contact data until deletion requested

## Third-Party Services

We use the following third-party services:
- **Cloudflare**: Hosting, CDN, security
- **Analytics**: Anonymous usage statistics

## Your Rights

You have the right to:
- Access your personal data
- Request data deletion
- Opt-out of newsletters
- Object to data processing

## Cookies

We use essential cookies for:
- Session management
- Authentication
- Preference storage

## Contact

For privacy-related questions, contact us through our [contact page](/contact).

## Changes

We may update this policy. Check this page periodically for changes.',
    '<h1>Privacy Policy</h1>
<p><strong>Last Updated:</strong> December 2, 2025</p>
<h2>Introduction</h2>
<p>This Privacy Policy describes how EdgePress ("we", "our", or "us") collects, uses, and protects your information when you visit our website.</p>
<h2>Information We Collect</h2>
<h3>Automatically Collected Information</h3>
<p>When you visit our site, we automatically collect certain information:</p>
<ul>
<li><strong>Usage Data</strong>: Pages visited, time spent, referrer information</li>
<li><strong>Technical Data</strong>: IP address, browser type, device information</li>
<li><strong>Performance Metrics</strong>: Page load times, error logs</li>
</ul>
<h3>Information You Provide</h3>
<p>We collect information you voluntarily provide:</p>
<ul>
<li><strong>Contact Forms</strong>: Name, email, message content</li>
<li><strong>Newsletter</strong>: Email address (if you subscribe)</li>
<li><strong>Comments</strong>: Name, email, comment content (if enabled)</li>
</ul>
<h2>How We Use Your Information</h2>
<p>We use collected information to:</p>
<ul>
<li>Provide and maintain our service</li>
<li>Improve user experience</li>
<li>Send newsletters (if subscribed)</li>
<li>Respond to inquiries</li>
<li>Analyze usage patterns</li>
<li>Detect and prevent abuse</li>
</ul>
<h2>Data Storage</h2>
<ul>
<li><strong>Location</strong>: Data is stored on Cloudflare''s global network</li>
<li><strong>Security</strong>: Industry-standard encryption and security practices</li>
<li><strong>Retention</strong>: Logs retained for 30 days, contact data until deletion requested</li>
</ul>
<h2>Third-Party Services</h2>
<p>We use the following third-party services:</p>
<ul>
<li><strong>Cloudflare</strong>: Hosting, CDN, security</li>
<li><strong>Analytics</strong>: Anonymous usage statistics</li>
</ul>
<h2>Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access your personal data</li>
<li>Request data deletion</li>
<li>Opt-out of newsletters</li>
<li>Object to data processing</li>
</ul>
<h2>Cookies</h2>
<p>We use essential cookies for:</p>
<ul>
<li>Session management</li>
<li>Authentication</li>
<li>Preference storage</li>
</ul>
<h2>Contact</h2>
<p>For privacy-related questions, contact us through our <a href="/contact">contact page</a>.</p>
<h2>Changes</h2>
<p>We may update this policy. Check this page periodically for changes.</p>',
    'Our privacy policy explains how we collect, use, and protect your information.',
    'published',
    'page.njk',
    datetime('now'),
    datetime('now'),
    datetime('now')
),
-- Terms of Service Page
(
    '00000000000000000000000000000003',
    'YOUR_USER_ID',
    'Terms of Service',
    'terms',
    '# Terms of Service

**Last Updated:** December 2, 2025

## Acceptance of Terms

By accessing and using EdgePress, you accept and agree to be bound by these Terms of Service.

## Use of Service

### Permitted Use

You may use EdgePress for:
- Reading and accessing public content
- Subscribing to newsletters
- Contacting us through provided forms

### Prohibited Use

You may not:
- Attempt to gain unauthorized access
- Interfere with service operation
- Submit malicious code or content
- Scrape or harvest data systematically
- Violate any applicable laws

## Content

### Our Content

All content on this site is protected by copyright and other intellectual property rights. You may:
- View and read content for personal use
- Share links to content
- Quote brief excerpts with attribution

You may not:
- Copy substantial portions without permission
- Republish content on other platforms
- Claim our content as your own

### User-Submitted Content

If you submit content (comments, contact forms):
- You grant us a license to use and display it
- You represent that you have rights to submit it
- We may moderate or remove inappropriate content

## Disclaimers

### As-Is Service

EdgePress is provided "as is" without warranties of any kind.

### No Guarantees

We do not guarantee:
- Uninterrupted service availability
- Error-free operation
- Completeness or accuracy of content

## Limitation of Liability

We are not liable for:
- Direct, indirect, or consequential damages
- Loss of data or profits
- Service interruptions

## Changes to Terms

We may modify these terms at any time. Continued use constitutes acceptance of modified terms.

## Governing Law

These terms are governed by applicable laws.

## Contact

Questions about these terms? Contact us through our [contact page](/contact).',
    '<h1>Terms of Service</h1>
<p><strong>Last Updated:</strong> December 2, 2025</p>
<h2>Acceptance of Terms</h2>
<p>By accessing and using EdgePress, you accept and agree to be bound by these Terms of Service.</p>
<h2>Use of Service</h2>
<h3>Permitted Use</h3>
<p>You may use EdgePress for:</p>
<ul>
<li>Reading and accessing public content</li>
<li>Subscribing to newsletters</li>
<li>Contacting us through provided forms</li>
</ul>
<h3>Prohibited Use</h3>
<p>You may not:</p>
<ul>
<li>Attempt to gain unauthorized access</li>
<li>Interfere with service operation</li>
<li>Submit malicious code or content</li>
<li>Scrape or harvest data systematically</li>
<li>Violate any applicable laws</li>
</ul>
<h2>Content</h2>
<h3>Our Content</h3>
<p>All content on this site is protected by copyright and other intellectual property rights. You may:</p>
<ul>
<li>View and read content for personal use</li>
<li>Share links to content</li>
<li>Quote brief excerpts with attribution</li>
</ul>
<p>You may not:</p>
<ul>
<li>Copy substantial portions without permission</li>
<li>Republish content on other platforms</li>
<li>Claim our content as your own</li>
</ul>
<h3>User-Submitted Content</h3>
<p>If you submit content (comments, contact forms):</p>
<ul>
<li>You grant us a license to use and display it</li>
<li>You represent that you have rights to submit it</li>
<li>We may moderate or remove inappropriate content</li>
</ul>
<h2>Disclaimers</h2>
<h3>As-Is Service</h3>
<p>EdgePress is provided "as is" without warranties of any kind.</p>
<h3>No Guarantees</h3>
<p>We do not guarantee:</p>
<ul>
<li>Uninterrupted service availability</li>
<li>Error-free operation</li>
<li>Completeness or accuracy of content</li>
</ul>
<h2>Limitation of Liability</h2>
<p>We are not liable for:</p>
<ul>
<li>Direct, indirect, or consequential damages</li>
<li>Loss of data or profits</li>
<li>Service interruptions</li>
</ul>
<h2>Changes to Terms</h2>
<p>We may modify these terms at any time. Continued use constitutes acceptance of modified terms.</p>
<h2>Governing Law</h2>
<p>These terms are governed by applicable laws.</p>
<h2>Contact</h2>
<p>Questions about these terms? Contact us through our <a href="/contact">contact page</a>.</p>',
    'Terms of service for using EdgePress.',
    'published',
    'page.njk',
    datetime('now'),
    datetime('now'),
    datetime('now')
);

-- Note: Before running this migration, you MUST replace 'YOUR_USER_ID' with an actual user ID from your users table.
-- You can find your user ID by running: SELECT id FROM users LIMIT 1;
