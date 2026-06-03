# Mock UI to API Index

## Framework Notes
- Next.js docs read before App Router work:
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
  - `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
  - `node_modules/next/dist/docs/01-app/02-guides/redirecting.md`
  - `node_modules/next/dist/docs/01-app/02-guides/forms.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- Dynamic route handlers and server data fetches should use uncached request behavior for API-backed UI.
- Interactive dropdowns, forms, drawers, pagination controls, and CMS edit actions remain Client Components.
- Client-side event redirects use `useRouter`; server redirects use App Router `redirect` outside mutation `try` blocks where applicable.

## API Contract Defaults
- API base: Laravel `/api/v1`, proxied through Next `/api/puncak/[...path]` when browser credentials/cookies are needed.
- Auth token: stored in the HTTP-only `puncak_session` cookie by Next auth route handlers; localStorage mirrors basic user display state where existing components require it.
- Empty state: render a clear page-local empty panel when API succeeds with no records.
- Error state: render a clear page-local error panel when API request fails; do not display stale mock data as if it came from the API.
- CMS pagination: request `per_page=15` and display total/page metadata.
- Admin role: exactly `admin`.

## Public and Account Pages
| UI / Route | Reference | Current Status | API Target | Empty State | Error State | Final Status |
|---|---|---|---|---|---|---|
| Landing `/` | `references/Landing Page.html` | Mostly API-backed through `getLandingPageData` | `GET /api/v1/landing` | Sections with no records collapse or show quiet empty copy for event/gallery/community lists | Landing section error panel; no stale API card fallback | Pending |
| Events `/events` | `references/Events.html` | API-backed list with local filter UI | `GET /api/v1/events?per_page=15&page=:page` | "No events are available yet." | "Events could not be loaded." | Pending |
| Event detail `/events/[slug]` | `references/Event Detail.html` | API-backed detail, nullable fallback behavior | `GET /api/v1/events/:slug` | 404-style not found state | "Event details could not be loaded." | Pending |
| Galleries `/galleries` | `references/Galleries.html` | API-backed list with client filters | `GET /api/v1/galleries?per_page=15&page=:page` | "No gallery photos yet." | "Gallery could not be loaded." | Pending |
| About `/about` | `references/About.html` | Static/mock `reference-data` content | Static page unless backend content endpoint is added later | Not applicable | Not applicable | Intentionally static for this pass |
| Contact `/contact` | `references/Contact.html` | API contact methods, form likely local/API | `GET /api/v1/contact-methods`, `POST /api/v1/contact` | Show alternate contact fallback text when no methods exist | "Contact options could not be loaded." | Pending |
| Account `/account` | `references/Accounts.html` | API profile/bookings with reference types | `GET /api/v1/me`, `GET /api/v1/bookings`, `GET /api/v1/me/saved-events` | Empty booking/saved-event panels per tab | "Account data could not be loaded." | Pending |

## Auth Pages
| UI / Route | Reference | Current Status | API Target | Empty State | Error State | Final Status |
|---|---|---|---|---|---|---|
| Login `/login` | `references/Login.html` | Existing basic login and Google auth | `POST /api/v1/auth/login`, `GET /api/v1/auth/google/redirect` | Not applicable | Inline credential/service errors | Pending |
| Signup `/signup` | None; derive from login visual system | Missing | `POST /api/v1/auth/register` | Not applicable | Inline validation/service errors | Pending |
| Forgot password `/forgot-password` | None; derive from login visual system | Missing | `POST /api/v1/auth/forgot-password` | Not applicable | Inline validation/service errors | Pending |
| Reset password `/reset-password` | None; derive from login visual system | Missing | `POST /api/v1/auth/reset-password` | Not applicable | Inline validation/token errors | Pending |
| Google callback `/auth/google/callback` | Existing route | Existing | `POST /api/v1/auth/google/exchange` | Not applicable | Expired exchange code error | Pending |

## Checkout Flow
| UI / Route | Reference | Current Status | API Target | Empty State | Error State | Final Status |
|---|---|---|---|---|---|---|
| Select ticket `/events/[slug]/booking` | `references/Select Ticket.html` | Uses event detail plus client state/localStorage | `GET /api/v1/events/:slug` | No tickets available panel | Event/tickets load error panel | Pending |
| Sign in to book `/events/[slug]/booking/sign-in` | `references/Sign-in to Book.html` | Existing auth step | `POST /api/v1/auth/login` | Not applicable | Inline login error | Pending |
| Confirm `/events/[slug]/booking/confirm` | `references/Confirm.html` | Client state/localStorage checkout | `POST /api/v1/bookings` | Missing selected ticket state panel | Booking creation error panel | Pending |
| Success `/events/[slug]/booking/success` | `references/Success.html` | Generated/local reference | `GET /api/v1/bookings/:reference` or booking create response | Missing booking reference state | Booking detail load error panel | Pending |

## Admin CMS
| UI / Route | Reference | Current Status | API Target | Empty State | Error State | Final Status |
|---|---|---|---|---|---|---|
| Admin dashboard `/admin` | `references/CMS/Dashboard.html` | Dynamic counts mixed with mocked inbox | `GET /api/v1/events`, `GET /api/v1/bookings`, `GET /api/v1/galleries`, future summary endpoint optional | Empty metrics/lists | Dashboard load error card | Pending |
| Bookings `/admin/bookings` | `references/CMS/Booking List.html`, `Booking Detail Drawer.html` | API rows mixed with mock details and client filtering | `GET /api/v1/bookings?per_page=15&page=:page`, `GET /api/v1/bookings/:reference`, payment status update endpoint | "No bookings yet." | "Bookings could not be loaded." | Pending |
| Events `/admin/events` | `references/CMS/Event List.html` | API rows mixed with mock fallback/client filtering | `GET /api/v1/events?per_page=15&page=:page`, `DELETE /api/v1/events/:slug` | "No events yet." | "Events could not be loaded." | Pending |
| New event `/admin/events/new` | Derive from `references/CMS/Edit Event.html` | Missing | `POST /api/v1/events` | Form starts blank | Validation/service errors | Pending |
| Edit event `/admin/events/[slug]/edit` | `references/CMS/Edit Event.html` | Existing page, local/mock save behavior | `GET /api/v1/events/:slug`, `PATCH /api/v1/events/:slug` | Event not found | Validation/service errors | Pending |
| Galleries `/admin/galleries` | `references/CMS/Galleries.html` | Upload/delete partial, caption/download mocked | `GET /api/v1/galleries?per_page=15&page=:page`, `POST /api/v1/galleries`, `PATCH /api/v1/galleries/:id`, `DELETE /api/v1/galleries/:id`, download endpoint | "No gallery photos yet." | "Gallery photos could not be loaded." | Pending |
| Communities `/admin/communities` | Sidebar mocked/disabled | Missing | `GET/POST/PATCH/DELETE /api/v1/communities` | "No communities yet." | "Communities could not be loaded." | Pending |
| Places `/admin/places` | Sidebar mocked/disabled | Missing | `GET/POST/PATCH/DELETE /api/v1/places` | "No places yet." | "Places could not be loaded." | Pending |
| Members `/admin/members` | Sidebar mocked/disabled | Missing | `GET/POST/PATCH/DELETE /api/v1/members` | "No members yet." | "Members could not be loaded." | Pending |

## Backend Endpoint Status
| Resource | Existing | Partial | Missing / Update Needed |
|---|---:|---:|---|
| Auth login/logout/user/Google | Yes | Yes | Add register, forgot password, reset password, consistent user payloads |
| Landing | Yes | No | Verify empty/error contract on frontend |
| Events | Yes | Yes | Separate frontend new/edit pages; ensure all form fields persist; CMS pagination 15 |
| Bookings | Yes | Yes | Add paginated admin index and manual payment status update |
| Galleries | Yes | Yes | Add update caption metadata and single image download |
| Communities | Public read | Yes | Add admin CRUD |
| Places | Public read | Yes | Add admin CRUD |
| Members | No | No | Add admin CRUD over users |
| Contact methods/messages | Yes | No | Wire frontend empty/error states |
| Seeders | Yes | Yes | Set demo admin credentials and ensure all demo resources/images exist |

## Removed / Hidden CMS UI
- Remove admin inbox/messages panels and sidebar group.
- Remove notification bell and global/header search from CMS.
- Hide filter/sort controls in CMS resource pages by commenting the controls in code.
- Per-resource search boxes may remain when useful.

## Implementation Status Update
- Auth: signup, forgot password, reset password, admin redirect, and profile dropdowns are implemented.
- Checkout: booking creation is API-backed and now creates pending manual-payment bookings.
- Backend CMS resources: events, bookings, galleries, communities, places, and members have admin API coverage.
- Admin CMS: inbox/global search/notifications are removed; filter/sort controls are hidden; events/bookings/galleries/directory resources use API data and 15-item pagination.
- Gallery fixes: caption edits persist through the API and single-image downloads are wired.
- Demo setup: Gmail SMTP instructions and demo admin credentials are documented.
