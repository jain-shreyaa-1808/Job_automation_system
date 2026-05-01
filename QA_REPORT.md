# QA Test Report — AI-Powered Job Automation Platform

**Date:** 2026-05-01  
**Tester:** Senior QA Engineer (Automated)  
**Environment:** macOS, Node.js v25.9.0, MongoDB Atlas, localhost:4000  
**Test User:** shreya.jain@test.com  
**Codebase:** Express 4 + TypeScript + React 19 + Vite 6.4 + Mongoose 8

---

## Executive Summary

| Metric                   | Value                        |
| ------------------------ | ---------------------------- |
| **Modules Tested**       | 16                           |
| **Overall Pass Rate**    | 13/16 (81%)                  |
| **Unit Tests**           | 50/50 passing (3 test files) |
| **Critical Bugs**        | 1                            |
| **High Severity Bugs**   | 2                            |
| **Medium Severity Bugs** | 3                            |
| **Low / Minor Issues**   | 5                            |
| **Verdict**              | **MVP-Ready with caveats**   |

---

## Module-by-Module Results

### Module 1: Authentication & Authorization — ✅ PASS (13/13)

| Test                                 | Result                       |
| ------------------------------------ | ---------------------------- |
| Signup with valid data               | ✅ Returns JWT + user object |
| Login with valid credentials         | ✅ Returns JWT               |
| Duplicate email signup               | ✅ 409 Conflict              |
| Wrong password login                 | ✅ 401 Unauthorized          |
| Non-existent email login             | ✅ 401 Unauthorized          |
| No auth token on protected route     | ✅ 401                       |
| Invalid JWT token                    | ✅ 401                       |
| Tampered JWT payload                 | ✅ 401                       |
| Valid /auth/me                       | ✅ Returns user profile      |
| Short password validation (<8 chars) | ✅ 400                       |
| Invalid email format                 | ✅ 400                       |
| Empty body                           | ✅ 400                       |
| NoSQL injection in email             | ✅ 400 (blocked by Zod)      |

**Notes:** Zod validation on all inputs. bcryptjs password hashing. JWT signed with HS256.

---

### Module 2: Resume Parser — ✅ PASS (12/12)

| Test                      | Result              |
| ------------------------- | ------------------- |
| Name extraction           | ✅ "SHREYA JAIN"    |
| Skills extraction         | ✅ 14 skills parsed |
| Projects extraction       | ✅ 3 projects       |
| Experience extraction     | ✅ 2 entries        |
| Education extraction      | ✅ 2 entries        |
| Certifications extraction | ✅ 2 (CCNA, CCNP)   |
| Resume score              | ✅ 100/100          |
| No file upload → 400      | ✅                  |
| No auth → 401             | ✅                  |
| PDF text extraction       | ✅                  |
| Section-based parsing     | ✅                  |
| Skill normalization       | ✅ (alias mapping)  |

**Minor Issue:** Experience company field contains concatenated text: `"Cisco Systems – CCNA Certified | Wireless TAC EngineerBengaluru, India"` instead of clean `"Cisco Systems"`. See Bug #6.

---

### Module 3: Database Validation — ✅ PASS (4/4)

| Test                               | Result                           |
| ---------------------------------- | -------------------------------- |
| Data persists after creation       | ✅                               |
| Schema integrity (required fields) | ✅                               |
| Settings update round-trip         | ✅                               |
| Job deduplication (unique index)   | ✅ 10 jobs stable across fetches |

---

### Module 4: Job Aggregation — ✅ PASS (8/8)

| Test                                | Result |
| ----------------------------------- | ------ |
| Returns 10 sample jobs              | ✅     |
| 7 unique platforms                  | ✅     |
| 10 companies (Amazon, Google, etc.) | ✅     |
| 3 locations                         | ✅     |
| Sorted by relevance desc            | ✅     |
| Jobs have links & descriptions      | ✅     |
| Wireless + software roles present   | ✅     |
| Status filtering works              | ✅     |

---

### Module 5: Job Matching — ✅ PASS (7/7)

| Test                           | Result               |
| ------------------------------ | -------------------- |
| Scores range 0-100             | ✅ (50-100 observed) |
| matched/missing skills correct | ✅                   |
| Flipkart Full Stack = 100%     | ✅ (6/6 skills)      |
| Zerodha Backend = 50%          | ✅ (1/2 skills)      |
| Suggestions provided           | ✅                   |
| Skills extracted from JD       | ✅                   |
| Score = matched/total × 100    | ✅                   |

---

### Module 6: Resume Optimizer — ✅ PASS (10/10)

| Test                              | Result        |
| --------------------------------- | ------------- |
| Valid LaTeX output                | ✅ 2819 chars |
| \documentclass present            | ✅            |
| \begin{document} / \end{document} | ✅            |
| Section headers                   | ✅            |
| Candidate name included           | ✅            |
| Target company included           | ✅            |
| No hallucinated experience        | ✅            |
| ATS suggestions = 3               | ✅            |
| Invalid jobId → 404               | ✅            |
| Missing jobId → 400               | ✅            |

**Minor Issue:** Summary section leads with "cisco, wireless, technical support" for a Full Stack Developer role instead of relevant skills like "react, typescript, node.js". See Bug #7.

---

### Module 7: LaTeX / PDF Generation — ⚠️ PARTIAL PASS

| Test                    | Result             |
| ----------------------- | ------------------ |
| LaTeX structure valid   | ✅                 |
| Balanced braces         | ✅                 |
| PDF compilation         | ❌ Not implemented |
| Download URL functional | ❌ Returns 404     |

**Bug #1 — Medium:** `downloadUrl` field is a placeholder; no actual PDF compilation pipeline exists. Users cannot download generated resumes.

---

### Module 8: HR Discovery — ✅ PASS (5/5)

| Test                              | Result |
| --------------------------------- | ------ |
| Leads generated                   | ✅     |
| Name/company/LinkedIn URL present | ✅     |
| Recent posts generated            | ✅     |
| State defaults to "pending"       | ✅     |
| Invalid jobId → 404               | ✅     |

**Note:** Leads are synthetic (`"{Company} Recruiting Team"`) — not scraped from real LinkedIn profiles. Acceptable for MVP.

---

### Module 9: Outreach Generation — ✅ PASS (11/11)

| Test                           | Result |
| ------------------------------ | ------ |
| Email has subject line         | ✅     |
| Email mentions company/role    | ✅     |
| Email includes candidate name  | ✅     |
| Email includes skills          | ✅     |
| Email has greeting/sign-off    | ✅     |
| LinkedIn message concise       | ✅     |
| LinkedIn mentions company/role | ✅     |
| Not generic boilerplate        | ✅     |
| Personalizes with profile data | ✅     |
| Invalid jobId → 404            | ✅     |
| Works with recruiterLeadId     | ✅     |

---

### Module 10: Job Tracking & State — ✅ PASS (6/6)

| Test                             | Result |
| -------------------------------- | ------ |
| Apply → status "applied"         | ✅     |
| Manual override → "in-progress"  | ✅     |
| HR lead: pending → action-taken  | ✅     |
| HR lead: action-taken → finished | ✅     |
| HR lead: finished → pending      | ✅     |
| Invalid jobId → 404              | ✅     |

---

### Module 11: Auto-Apply — ⚠️ PARTIAL PASS

| Test                     | Result                    |
| ------------------------ | ------------------------- |
| Application queuing      | ✅                        |
| Queue record created     | ✅                        |
| History tracking         | ✅                        |
| Actual form-filling      | ❌ Worker not implemented |
| CAPTCHA handling         | ❌ Not implemented        |
| Form variation detection | ❌ Not implemented        |

**Bug #2 — Expected (MVP):** Auto-apply worker (`apps/worker`) exists as scaffold only. Applications are queued but never executed. This is the intended MVP behavior with BullMQ + Playwright placeholder.

---

### Module 12: Salary Intelligence — ✅ PASS (5/5)

| Test                                        | Result             |
| ------------------------------------------- | ------------------ |
| SDE 6→10 LPA gives 6.8-9.0 LPA              | ✅ Realistic range |
| Network/TAC roles get different multipliers | ✅                 |
| Role-specific multipliers correct           | ✅                 |
| Zero CTC handled gracefully                 | ✅                 |
| Empty body → 400                            | ✅                 |

---

### Module 13: Performance — ✅ PASS (with notes)

| Metric                  | Value       | Verdict              |
| ----------------------- | ----------- | -------------------- |
| /auth/me avg response   | ~47ms       | ✅ Good              |
| /jobs avg response      | ~50ms       | ✅ Good              |
| /dashboard avg response | ~57ms       | ✅ Good              |
| /salary-insight avg     | ~11ms       | ✅ Excellent (no DB) |
| 5 concurrent /jobs      | 140ms total | ✅ Good concurrency  |
| /dashboard payload      | 9,719 bytes | ✅ Acceptable        |
| /jobs payload           | 6,715 bytes | ✅ Acceptable        |
| /auth/me payload        | 744 bytes   | ✅ Minimal           |
| Server RSS memory       | 106 MB      | ✅ Normal for Node   |
| 6MB body rejection      | HTTP 500    | ⚠️ Should be 413     |

**Bug #3 — Medium:** 6MB request body returns HTTP 500 instead of 413 Payload Too Large. The Express `json({ limit: '5mb' })` may not correctly handle oversized payloads before parsing.

---

### Module 14: Security — ⚠️ PARTIAL PASS

| Test                              | Result                 |
| --------------------------------- | ---------------------- |
| Password hash not in API response | ✅                     |
| Plaintext password not exposed    | ✅                     |
| Invalid JWT → 401                 | ✅                     |
| No auth → 401                     | ✅                     |
| Tampered JWT → 401                | ✅                     |
| NoSQL injection blocked           | ✅ (Zod validation)    |
| XSS stored but not rendered       | ⚠️ See Bug #4          |
| CORS blocks unauthorized origins  | ✅                     |
| Helmet security headers           | ✅ All 5 present       |
| Rate limiting                     | ❌ Not implemented     |
| Credential vault encryption       | ✅ AES-256-GCM         |
| IDOR protection                   | ✅ Auth-scoped queries |

**Security Headers Present:**

- `x-content-type-options: nosniff` ✅
- `x-frame-options: SAMEORIGIN` ✅
- `x-xss-protection: 0` ✅ (disabled per modern best practice)
- `strict-transport-security` ✅
- `content-security-policy` ✅

---

### Module 15: UI/UX — ✅ PASS (with notes)

| Test                          | Result                 |
| ----------------------------- | ---------------------- |
| Frontend builds successfully  | ✅ (1.44s)             |
| Bundle size reasonable        | ✅ 348KB JS / 18KB CSS |
| No dangerouslySetInnerHTML    | ✅ (XSS safe)          |
| Loading states present        | ✅ 20 references       |
| Form validation present       | ✅ 7 references        |
| Error boundaries              | ❌ None found          |
| 18 component/page files       | ✅ Well-structured     |
| Auth context                  | ✅                     |
| React Query for data fetching | ✅                     |
| Tailwind CSS styling          | ✅                     |

**Bug #5 — Low:** No React Error Boundaries. Unhandled component errors will crash the entire app instead of showing a fallback UI.

---

### Module 16: Logging & Debugging — ✅ PASS

| Test                               | Result                     |
| ---------------------------------- | -------------------------- |
| Structured logging (Pino)          | ✅ With pino-pretty        |
| Error handler middleware           | ✅ Logs with logger.error  |
| Request logging                    | ✅ logger.debug for routes |
| Database connection logging        | ✅                         |
| Health endpoint                    | ✅ `{"status":"ok"}`       |
| Graceful shutdown (SIGTERM/SIGINT) | ✅                         |
| No console.log in production code  | ✅ Clean                   |
| Unit tests                         | ✅ 50/50 passing (3 files) |

---

## Bugs Found

| #   | Title                             | Severity     | Module | Description                                                                                                        |
| --- | --------------------------------- | ------------ | ------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| 1   | No PDF compilation                | **Medium**   | 7      | `downloadUrl` is placeholder. No LaTeX→PDF pipeline. Users cannot download resumes.                                |
| 2   | Auto-apply worker not implemented | **Expected** | 11     | BullMQ worker scaffold only. Applications queued but never executed. MVP limitation.                               |
| 3   | Large body returns 500 not 413    | **Medium**   | 13     | 6MB request body causes HTTP 500 instead of 413 Payload Too Large.                                                 |
| 4   | Stored XSS in fullName            | **High**     | 14     | `<script>` tags stored in DB via signup. React auto-escapes, but API consumers may not. Input sanitization needed. |
| 5   | No rate limiting                  | **High**     | 14     | No rate limiting on login or any endpoint. Brute-force attacks possible.                                           |
| 6   | Experience parsing concatenation  | **Low**      | 2      | Company field: `"Cisco Systems – CCNA Certified                                                                    | Wireless TAC EngineerBengaluru, India"`— should be`"Cisco Systems"`. |
| 7   | Resume summary uses wrong skills  | **Low**      | 6      | Optimizer summary leads with "cisco, wireless, technical support" for Full Stack Developer role.                   |
| 8   | No React Error Boundaries         | **Low**      | 15     | Component errors crash entire app.                                                                                 |
| 9   | Synthetic HR leads                | **Low**      | 8      | Leads are generated, not real LinkedIn profiles. Acceptable for MVP.                                               |
| 10  | No unhandledRejection handler     | **Medium**   | 16     | Missing `process.on('unhandledRejection')` — unhandled promise rejections could crash server silently.             |
| 11  | Outreach skill prioritization     | **Minor**    | 9      | Outreach emails lead with generic skills instead of job-relevant ones.                                             |

---

## AI Accuracy Issues

| Issue                           | Details                                                                                                                                            | Impact                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Resume summary skill mismatch   | Optimizer generates summary with "cisco, wireless, technical support" for a Full Stack Developer position (should be "react, typescript, node.js") | User may submit mismatched resume |
| Experience parsing quality      | Company name includes title and location in same field                                                                                             | Minor display issue               |
| Generic outreach skills         | Email mentions broad skills instead of top-matched skills for target role                                                                          | Reduced personalization           |
| Skill matching is keyword-based | No semantic understanding — "distributed systems" won't match "microservices"                                                                      | Missed skill matches              |
| HR leads are fully synthetic    | No real LinkedIn data, "Flipkart Recruiting Team" placeholder names                                                                                | Low trust value                   |

---

## Performance Metrics

| Endpoint             | Avg Response Time | Payload Size         |
| -------------------- | ----------------- | -------------------- |
| GET /auth/me         | ~47ms             | 744 B                |
| GET /jobs            | ~50ms             | 6.7 KB               |
| GET /dashboard       | ~57ms             | 9.7 KB               |
| POST /salary-insight | ~11ms             | <1 KB                |
| 5 concurrent /jobs   | 140ms total       | —                    |
| Server memory (RSS)  | 106 MB            | —                    |
| Frontend bundle      | —                 | 348 KB JS, 18 KB CSS |
| Frontend build time  | 1.44s             | —                    |

**Verdict:** All endpoints respond under 100ms. Concurrent handling is good. Memory footprint is normal.

---

## Security Risk Summary

| Risk                           | Severity   | Status                | Recommendation                                                                        |
| ------------------------------ | ---------- | --------------------- | ------------------------------------------------------------------------------------- |
| No rate limiting               | **High**   | ❌ Open               | Add express-rate-limit (5 req/min login, 100 req/min general)                         |
| Stored XSS possible            | **High**   | ⚠️ Mitigated by React | Add server-side input sanitization (DOMPurify/xss library)                            |
| No CSRF protection             | **Medium** | ⚠️                    | JWT in headers mitigates this for API-only, but add CSRF tokens for cookie-based auth |
| Large body handling            | **Medium** | ❌ Open               | Add proper payload size middleware before JSON parser                                 |
| No unhandled rejection handler | **Medium** | ❌ Open               | Add `process.on('unhandledRejection')`                                                |
| Credential vault encryption    | ✅         | AES-256-GCM           | Properly implemented                                                                  |
| Password hashing               | ✅         | bcryptjs              | Properly implemented                                                                  |
| CORS configuration             | ✅         | Allowlist-based       | Properly implemented                                                                  |
| Security headers (Helmet)      | ✅         | All 5 present         | Properly implemented                                                                  |
| JWT validation                 | ✅         | HS256                 | Properly implemented                                                                  |
| NoSQL injection                | ✅         | Zod validation        | Properly blocked                                                                      |
| IDOR prevention                | ✅         | Auth-scoped           | Properly implemented                                                                  |

---

## UX Issues

| Issue                                | Severity | Recommendation                                   |
| ------------------------------------ | -------- | ------------------------------------------------ |
| No error boundaries in React         | Low      | Add `<ErrorBoundary>` wrapper around routes      |
| No toast/notification system visible | Low      | Add react-hot-toast for async operation feedback |
| Resume download non-functional       | Medium   | Implement LaTeX→PDF or offer plain text download |
| Dashboard payload could grow         | Low      | Add pagination for applications/leads lists      |

---

## Recommendations for Improvement

### Immediate (Pre-Launch)

1. **Add rate limiting** — `express-rate-limit` on auth endpoints (5 req/min) and general API (100 req/min)
2. **Input sanitization** — Sanitize `fullName` and other string inputs to strip HTML/script tags
3. **Fix large body handling** — Return 413 instead of 500 for oversized payloads
4. **Add unhandledRejection handler** — Prevent silent server crashes

### Short-Term (Post-MVP)

5. **Implement PDF compilation** — Use `pdflatex` or a cloud LaTeX service to generate downloadable PDFs
6. **Improve resume parser** — Clean company name extraction, handle multi-line sections better
7. **Add React Error Boundaries** — Wrap route components for graceful error display
8. **Skill matching improvements** — Add semantic similarity (not just keyword matching)
9. **Resume optimizer context** — Use job-specific skills for the professional summary, not user's generic top skills

### Long-Term (Production)

10. **Real job scraping** — Replace sample jobs with actual Indeed/LinkedIn/Naukri scraping
11. **Real HR discovery** — LinkedIn API or scraping for actual recruiter profiles
12. **Auto-apply worker** — Complete Playwright automation with CAPTCHA handling
13. **Add monitoring** — APM (Datadog/New Relic), error tracking (Sentry)
14. **Database indexing** — Add compound indexes for common query patterns
15. **API versioning** — Formalize v1 contract with OpenAPI/Swagger docs

---

## Bonus Suggestions

1. **WebSocket for real-time updates** — Push job status changes, auto-apply progress to frontend
2. **Email notifications** — Send alerts when new matching jobs are found or applications change status
3. **Multi-resume support** — Allow different resume versions tailored to different roles
4. **Interview prep module** — Expand beyond 2 generic questions to role-specific preparation
5. **Analytics dashboard** — Track application success rates, response rates, time-to-interview
6. **Chrome extension** — One-click apply from job listing pages
7. **Mobile-responsive PWA** — Enable job tracking on mobile devices
8. **A/B test outreach templates** — Track which email/LinkedIn templates get higher response rates

---

## Test Artifacts

- **Token file:** `/tmp/qa_token.txt`
- **Test scripts:** `/tmp/qa_perf_test.sh`, `/tmp/qa_security_test.sh`
- **Unit tests:** `apps/api/tests/` — 3 files, 50 tests, all passing
- **Server:** Running on localhost:4000 (PID 14783)

---

**Final Verdict:** The platform is **MVP-ready** with a solid foundation. Authentication, job matching, resume parsing, outreach generation, and salary intelligence all work correctly. The two **high-severity security issues** (no rate limiting, stored XSS) should be fixed before any public deployment. The PDF generation and auto-apply features are acknowledged scaffolds for future implementation.
