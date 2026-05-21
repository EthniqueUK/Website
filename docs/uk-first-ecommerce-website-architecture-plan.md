# UK-First Ecommerce Website Architecture Plan

## 1. Project Goal

Build a new ecommerce website project similar to the current architecture, implemented incrementally and component by component.

The project should:

- Launch first in the UK.
- Keep provisions for future markets, especially India.
- Exclude POS completely.
- Retain the existing online order workflow behavior.
- Focus on the public Website in this project foundation.
- Defer the Admin Portal to future iterations.
- Use this document as the guiding architecture plan for Claude Code and Codex in future implementation sessions.

The project must not be generated as one large build. Each session should focus on one bounded route, component, schema change, workflow, or feature.

## 2. Core Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Storage
- Resend
- Stripe

## 3. Website Architecture Overview

The initial project architecture should include:

- Public website for browsing products, categories, cart, checkout, and order confirmation.
- Supabase database as the primary data store.
- Supabase Storage for product images and other uploaded assets.
- Market-aware catalog model that supports UK-first launch and future expansion.
- Online checkout and order workflow retained from the existing ecommerce behavior.
- Email notifications through Resend for admin alerts and customer confirmations.

Initial website areas:

- Public layout and navigation
- Category and catalog pages
- Product detail pages
- Cart
- Checkout
- Order confirmation
- Market-aware catalog access
- Online order creation
- Email notifications

The Admin Portal is intentionally not part of this project foundation. It should be created in future iterations after the public Website foundation and online order workflow are established.

## 4. Important Rules for Claude Code and Codex

Claude Code and Codex must follow these rules when implementing future phases:

- Do not build the whole project in one go.
- Work one component, route, schema, or feature at a time.
- Before each phase, inspect the existing code and confirm the local pattern.
- Keep implementation aligned with this architecture file.
- Avoid POS code, POS routes, SumUp integrations, and POS data concepts.
- Preserve online order workflow behavior.
- Keep this foundation focused on the public Website.
- Defer Admin Portal implementation unless a future task explicitly asks for it.
- Keep each change small enough to review, test, and continue from in a later session.
- Prefer existing project conventions over introducing new patterns.
- Document any intentional architecture deviation before implementing it.

## 5. Phased Website Build Plan

### Phase 1: Project Foundation

- Confirm project structure, routing approach, styling setup, and environment variable pattern.
- Establish shared layout primitives and app-wide conventions.
- Confirm Supabase client setup.
- Confirm image upload and optimization patterns.
- Avoid implementing business workflows in this phase.

### Phase 2: Supabase Schema and Market Model

- Define the core ecommerce schema needed by the Website.
- Add market support with a UK default.
- Add future support for India without making India active at launch.
- Use market-aware product pricing and availability.
- Prefer `markets` and `product_market_data` for market-specific details.
- Avoid POS tables, POS source fields, POS payment concepts, or device concepts.

### Phase 3: Public Layout and Navigation

- Build the public site shell.
- Add header, footer, navigation, market-aware display conventions, and responsive layout.
- Default public experience should target the UK market.
- Keep navigation focused on ecommerce browsing and checkout.

### Phase 4: Catalog and Category Pages

- Build category listing and product listing pages.
- Query products using the active market.
- Show UK pricing in GBP by default.
- Keep category and product components reusable for future market expansion.

### Phase 5: Product Detail and Cart

- Build product detail pages.
- Add cart behavior for online orders.
- Store item snapshots needed for checkout.
- Keep cart behavior independent of POS concepts.

### Phase 6: Checkout and Order Creation

- Build checkout flow.
- Collect customer details.
- Create online orders.
- Create order item snapshots.
- Integrate payment via Stripe.
- Decrement stock only after the appropriate successful payment or order state.
- Preserve the existing online order workflow behavior.

### Phase 7: Email Templates and Customer Notifications

- Build Resend email templates.
- Send admin order notification emails.
- Send customer confirmation emails.
- Add invoice-related output if required by the online workflow.
- Support cancellation or fulfillment messaging only when those Website-facing workflows are introduced.

### Phase 8: Website QA, Build, and Deployment Readiness

- Run TypeScript checks.
- Run lint checks.
- Run the production build.
- Confirm no POS routes or POS concepts exist.
- Confirm UK market works by default.
- Confirm checkout creates correct online orders.
- Confirm environment variables and deployment notes are complete.

### Future Iteration: Admin Portal

The Admin Portal should be planned and created separately after the public Website foundation is stable.

Future Admin Portal work may include:

- Admin authentication
- Dashboard shell
- Product and category management
- Order management
- Fulfillment and cancellation tools
- Admin-facing email and invoice workflows

The future Admin Portal must still avoid POS routes, POS dashboards, SumUp integrations, and POS data concepts.

## 6. Order Workflow

The online order workflow should remain:

1. Customer adds products to cart.
2. Customer proceeds from cart to checkout.
3. Customer enters required customer details.
4. Checkout creates the order record.
5. Checkout creates order item snapshots.
6. Customer pays via Stripe.
7. Stock is decremented at the correct confirmed stage.
8. Admin receives an order notification email.
9. Customer receives a confirmation email.

The workflow is online-only. Do not introduce POS checkout behavior, POS payment states, SumUp behavior, or device-based payment assumptions.

## 7. Market Strategy

Default launch market:

- Market: UK
- Currency: GBP

Future planned market:

- Market: India
- Currency: INR

Market rules:

- Use a `markets` model for market configuration.
- Use `product_market_data` for market-specific product fields.
- Do not hardcode UK in places that should later support another market.
- It is acceptable for UK to be the default market.
- Keep currency, pricing, availability, and visibility market-aware.
- Design future India support without forcing India-specific UI into the initial UK launch.

## 8. What Not To Build

Do not build:

- POS dashboard
- POS checkout
- SumUp integration
- POS payment testing
- POS device testing
- POS source filters in admin orders
- POS-specific schema
- POS-specific reports
- POS-specific routes
- POS-specific navigation
- Admin Portal routes in this initial Website foundation

## 9. Validation Checklist

Use this checklist before considering an implementation phase complete:

- TypeScript passes.
- Lint passes.
- Build passes.
- No POS routes exist.
- No POS dashboard exists.
- No SumUp integration exists.
- UK market works by default.
- GBP pricing works by default.
- Checkout creates correct online orders.
- Order item snapshots are created correctly.
- Stock decrement behavior is correct.
- Admin order notification email is sent.
- Customer confirmation email is sent.
- Future market expansion remains possible without major rewrites.
- Admin Portal work remains deferred unless explicitly requested in a future iteration.
