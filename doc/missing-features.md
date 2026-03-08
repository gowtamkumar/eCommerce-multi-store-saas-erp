# 🚀 Missing Features Report (Gap Analysis)

Based on a comparison between the planned features in `doc/Featured.md` and the current implementation detailed in `doc/application-feature.md`, here are the features that are **NOT yet applied** to the application.

---

### 🧱 PHASE 1 – MVP Gaps

**1. Landing Page Builder**
*   **Missing Status:** The application currently relies on a WYSIWYG editor (Tiptap) for pages, but lacks a true structural page builder.
*   **What needs to be added:** 
    *   Pre-built templates (2-3 initial themes).
    *   Hero section & customizable product sections.
    *   No-code color and font selection for tenants.
    *   Call-to-Action (CTA) button settings.

**2. Custom Domain Management (Self-Serve)**
*   **Missing Status:** Missing automated/self-serve domain mapping.
*   **What needs to be added:** 
    *   Interface for tenants to add their "Custom Domain".
    *   Automated DNS instructions (A record / CNAME guidance).
    *   Domain Verification Status (Pending / Verified / Active).

---

### 🚀 PHASE 2 – Growth Features Gaps

**3. Advanced Customization**
*   **Missing Status:** Storefront templates are hardcoded.
*   **What needs to be added:** 
    *   Section reordering via drag-and-drop.
    *   Custom CSS (Safe Mode).
    *   Multiple distinct themes to choose from.

**4. Marketing Tool Integrations**
*   **Missing Status:** Currently lacking native SEO & pixel integrations.
*   **What needs to be added:**
    *   Meta (Facebook) Pixel injection.
    *   Google Analytics setup.
    *   Custom SEO title & meta descriptions per product/page.
    *   Custom Open Graph (OG) Images for social sharing.

---

### 💳 PHASE 3 – Monetization Gaps

**5. Granular Usage Tracking**
*   **Missing Status:** Basic subscription plans exist, but granular limits might not be enforced.
*   **What needs to be added:**
    *   Hard tracking of "Page Views" and "Bandwidth".
    *   Blocking access / upgrading plans when specific limits are reached.

---

### 🔐 PHASE 4 – Enterprise & Scale Gaps

**6. Advanced Scaling Features**
*   **Missing Status:** These complex features are entirely missing from the codebase.
*   **What needs to be added:**
    *   **Multi-language:** Ability to support localization.
    *   **Staff Roles (Team Members):** Granular permissions for the store owner's staff.
    *   **Security:** Two-Factor Authentication (2FA) and IP allowlist for admin portals.
    *   **Performance:** CDN image optimization and caching toggles.

---

### 🎯 Summary Recommendation

The application has largely fulfilled the **Phase 1 MVP**, with the notable exceptions of a true **Landing Page Builder / Theme Selector** and **Custom Domain Mapping**. The majority of missing features fall into Phase 2 (Growth) and Phase 4 (Enterprise).
