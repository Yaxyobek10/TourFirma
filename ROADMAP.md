# CaseLink Roadmap

This roadmap shows what should be added next to make CaseLink a production-ready SaaS platform for travel agencies.

## Phase 1 - Production Foundation

Status: highest priority.

- [ ] Database migrations instead of relying only on TypeORM sync
- [ ] Seed script for first admin/owner account
- [ ] API validation cleanup and consistent error responses
- [ ] Swagger documentation review for new CaseLink modules
- [ ] Rate limiting for auth and public lead endpoints
- [ ] Centralized app config for local, staging and production
- [ ] CI checks: backend build, frontend build and lint

## Phase 2 - Team And Access Control

- [ ] Agency team members table
- [ ] Invite manager/agent by email
- [ ] Role based workspace permissions
- [ ] Owner can activate/deactivate members
- [ ] Audit log for package publish, lead status changes and payment actions

Recommended roles:

- Owner: billing, team, settings, all packages and leads
- Manager: packages, leads, reports
- Agent: own packages and assigned leads
- Viewer: read-only dashboard

## Phase 3 - CRM And Lead Management

- [ ] Lead status update from frontend
- [ ] Lead assignment to agent/manager
- [ ] Lead notes and follow-up date
- [ ] Lead source analytics: Telegram, Instagram, Facebook, direct link
- [ ] Export leads to CSV/XLSX
- [ ] Duplicate lead detection by phone/email

## Phase 4 - Package Builder Improvements

- [ ] Edit/delete/reorder package blocks
- [ ] Package templates for common destinations
- [ ] Image upload instead of only URL input
- [ ] Public page theme settings per agency
- [ ] Private/internal notes separated from public content
- [ ] Tracking links per channel and campaign

## Phase 5 - Notifications

- [ ] Telegram notification for new lead
- [ ] Email notification for new lead
- [ ] Daily summary for owner/manager
- [ ] Reminder notification for follow-ups
- [ ] Webhook support for CRM integrations

## Phase 6 - Payments And Billing

- [ ] Agency subscription plans
- [ ] Payment status dashboard
- [ ] Payme/Click production webhook verification
- [ ] Invoice/receipt generation
- [ ] Package limit enforcement by plan
- [ ] Billing page in frontend

## Phase 7 - Public Offer Conversion

- [ ] Better public lead form with preferred date, pax and comment
- [ ] WhatsApp/Telegram quick CTA
- [ ] Open Graph image generation per package
- [ ] SEO metadata per package
- [ ] Fast mobile layout and Lighthouse optimization
- [ ] Bot click filtering improvement

## Phase 8 - Deployment

- [ ] Production Docker Compose or cloud deployment config
- [ ] PostgreSQL managed database plan
- [ ] Redis managed instance or container plan
- [ ] Domain and HTTPS setup
- [ ] Environment variable checklist
- [ ] Backup and restore procedure

## Immediate Next Sprint

Recommended next sprint order:

1. Team invite and role permissions
2. Lead status update and lead assignment
3. Package block edit/delete/reorder
4. Telegram notification for new leads
5. Database migrations and seed script

These five items will turn the current MVP into a much more usable business platform.