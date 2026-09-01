# The Gentleman's Chair

A production-ready barbershop booking experience for a premium Dubai grooming house. The application covers the complete customer journey: discovering services and barbers, booking a valid appointment, receiving confirmation, managing future visits, and reviewing completed services.

## Live demo  https://ahmadkali1.github.io/online-barber/

The verified production URL is supplied with the project handoff. The same application can be run locally with the commands below.

## Highlights

- Premium responsive interface with subtle motion and perspective-based depth
- Complete service → barber → date → time → chair → details → summary flow
- Dynamic 30-minute appointment intervals with full-duration validation
- Independent barber and chair conflict detection
- Automatic assignment for “Any Available Barber”
- Guest booking with confirmation-number retrieval
- Persistent appointments, profiles, preferences, and reviews
- Atomic rescheduling that preserves the original slot until replacement succeeds
- Two-hour cancellation and rescheduling policy
- Simulated local authentication without password persistence
- Review eligibility tied to completed bookings
- Accessible dialogs, drawer navigation, forms, focus states, and reduced-motion support
- Loading, error, empty, success, invalid-ID, and not-found states

## Technology

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Zustand
- React Hook Form
- Zod
- date-fns
- Lucide React
- Radix UI primitives

## Getting started

Requirements:

- Node.js 22 or newer
- npm 10 or newer

Install dependencies:

```bash
npm install
```

Start development:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run the domain tests:

```bash
npm test
```

Run the strict TypeScript check:

```bash
npm run lint
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage and shop overview |
| `/services` | Filterable service catalogue |
| `/services/:serviceId` | Service details and compatible barbers |
| `/barbers` | Barber directory |
| `/barbers/:barberId` | Barber biography, schedule, and services |
| `/book/service` | Booking step 1 |
| `/book/barber` | Booking step 2 |
| `/book/date` | Booking step 3 |
| `/book/time` | Booking step 4 |
| `/book/chair` | Booking step 5 |
| `/book/details` | Booking step 6 |
| `/book/summary` | Booking step 7 and final submission |
| `/booking/confirmation/:bookingId` | Booking confirmation |
| `/reviews` | Verified review overview and filters |
| `/login` | Simulated local sign-in |
| `/register` | Local demo-account registration |
| `/forgot-password` | Simulated recovery flow |
| `/reset-password` | Simulated password reset |
| `/account` | Protected profile and preferences |
| `/my-bookings` | Account history or guest lookup |
| `/my-bookings/:bookingId` | Booking details and actions |

Unknown routes and invalid entity IDs show a friendly not-found view.

## Booking architecture

Domain types live in `src/types/domain.ts`. Data access is isolated in `src/services/storage.ts`, state transitions are managed in `src/store/app-store.ts`, and booking rules live in `src/utils/booking.ts`.

The user interface never performs direct storage writes. This separation allows the local repository to be replaced by a hosted service without redesigning the booking screens.

### Persistence

The browser repository uses a versioned `localStorage` record for confirmed bookings, reviews, and the customer profile. The active sign-in identity is stored in `sessionStorage`. Missing or malformed records are discarded safely and replaced with valid demo data.

### Availability

Business hours are centralised in `src/config/business.ts`:

- Monday–Thursday: 10:00–22:00
- Friday: 14:00–22:00
- Saturday: 10:00–22:00
- Sunday: closed

Appointments are offered in 30-minute start intervals. A slot is available only when the complete service duration fits inside business hours and remains free for both the chosen barber and a physical chair.

### Conflict detection

The application uses true interval overlap detection:

```ts
newStart < existingEnd && newEnd > existingStart
```

The rule is evaluated independently for barber and chair reservations. Cancelled and rescheduled records do not block new appointments.

### Any available barber

When the customer chooses Any Available Barber, the availability service:

1. Filters barbers by supported service.
2. Checks the selected working day.
3. Rejects overlapping active appointments.
4. Assigns a real barber before the booking can be confirmed.

### Atomic rescheduling

Rescheduling keeps the original appointment confirmed while the replacement is validated. The new barber and chair are reserved first; only then is the original record marked as rescheduled. Failed replacement attempts leave the original appointment unchanged.

### Pricing

Price calculations are centralised in `calculatePrice`. Services at AED 200 or above receive the configured package saving, and every summary uses the same result.

## Authentication demo

Authentication is intentionally local and suitable for a frontend demonstration:

- Password fields are validated but never persisted.
- Registration stores only the profile and preferences.
- Sign-in checks the locally registered email identity.
- A seeded account is available with `demo@gentlemanschair.example` and any non-empty demo password.
- `/account` redirects signed-out visitors to sign-in and preserves the intended destination.

## Demo data

The catalogue contains nine services, five barbers, six chairs, ten verified reviews, and relative-date example bookings. Example dates are generated from the current day so the appointment-management flow remains usable.

For a guest-booking lookup, use:

- Confirmation: `GC-DEMO24`
- Email: `demo@gentlemanschair.example`

## Application states

The service catalogue exposes deterministic state previews through the query string:

- `/services?demoState=loading`
- `/services?demoState=error`
- `/services?demoState=empty`

The booking flow includes unavailable, fully booked, invalid selection, and stale-slot recovery states. Storage failures, invalid IDs, and route failures have dedicated fallbacks.

## Accessibility

- Semantic landmarks and logical heading order
- Skip link and visible keyboard focus
- Explicit form labels and inline validation errors
- Accessible sheet, dialog, alert-dialog, tabs, and live feedback
- Text and icon status cues instead of colour alone
- Keyboard-operable selection cards and time slots
- Responsive touch targets
- `prefers-reduced-motion` support

## Project structure

```text
src/
  app/            Application router and route loading
  components/     Product components and application shell
  config/         Business hours and shop configuration
  data/           Services, barbers, chairs, and reviews
  services/       Versioned browser repository
  store/          Zustand state and domain transitions
  types/          Domain contracts
  utils/          Availability, conflict, pricing, and date logic
  views/          Route-level screens
components/ui/    Accessible interface primitives
tests/            Booking-domain tests
```

## Testing

The test suite verifies:

- Both leading-edge and trailing-edge appointment overlap
- Full-duration slot reservation
- Independent chair conflicts
- Qualified-barber assignment
- Failed replacement protection for atomic rescheduling

The production command also runs TypeScript before bundling.

## Deployment

### Vercel

Import the repository and use the default Vite settings. `vercel.json` rewrites client-side routes to `index.html`.

### Netlify

Import the repository. `netlify.toml` sets `npm run build`, publishes `dist`, and configures the SPA fallback. `public/_redirects` provides the same fallback.

## Known limitations

- Data is device-local and is not shared between browsers.
- Authentication, recovery emails, reminders, and payments are simulated.
- Availability is suitable for a portfolio demonstration; a production rollout should replace the repository with a transactional backend.
- Demo imagery is loaded remotely and therefore requires an internet connection.
