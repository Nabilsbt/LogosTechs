## Repo snapshot

This is an Angular 16 frontend (Bootstrap 5.3) for a microservices hospital system. Key integration points:
- Backend services configured in `src/environments/*` as `userServiceUrl` and `urgenceServiceUrl`.
- API base paths follow `/api/users` and `/api/urgences`. See `src/app/services/user.service.ts` and `src/app/services/urgence.service.ts` for concrete examples.

## What an AI should know to be productive

1. Run/build/test
   - Dev start: `npm start` (runs `ng serve` → local 4200).
   - Build: `npm run build` (or `ng build --configuration production`).
   - Tests: `npm test` (Karma/Jasmine).

2. Project layout and conventions
   - TypeScript Angular app under `src/` with `app/` containing `components/`, `services/`, `models/`, `environments/`.
   - Components use SCSS files (project schematic sets `style: scss`). Example: `src/app/components/users/user-list.component.ts`.
   - Services return `ApiResponse<T>` generics and build base URLs from `environment.<service>Url` (see `user.service.ts` and `urgence.service.ts`).
   - Template-driven forms are used (module imports `FormsModule`). Use that pattern unless a component already uses reactive forms.

3. API & integration patterns (concrete examples)
   - Base URL construction: `const baseUrl = `${environment.userServiceUrl}/api/users`;` — change environments to point to different backends.
   - Query params for actions: `triageUrgence(id, {priority, doctorId})` uses `HttpParams` and a `PUT` to `${baseUrl}/${id}/triage`.
   - Responses are wrapped in `ApiResponse<T>`; code tends to check the response object rather than raw payloads.

4. Localization / strings
   - Labels in services are French (e.g., `getPriorityLabel` returns French labels). Preserve language consistency when editing UI text.

5. Styling and UI
   - Bootstrap 5.3 + Font Awesome are used. Prefer Bootstrap classes or existing shared components for consistency (no new heavy CSS frameworks).

6. Common tasks & examples for the AI
   - Adding a new API call: add a method in `src/app/services/*service*.ts` that returns `Observable<ApiResponse<...>>` and follow existing naming and param patterns.
   - Changing environment endpoints: edit `src/environments/environment.ts` and `environment.prod.ts`.
   - Adding a component: use the project convention `component-name.component.ts/.html/.scss` and register it in `AppModule` if needed. Prefer the Angular CLI generator shape.

7. Files to inspect for context (highest signal)
   - `README.md` — architectural overview and run commands.
   - `src/app/services/urgence.service.ts` — all major API patterns (params, PUT with query params, label utilities).
   - `src/app/services/user.service.ts` — user-specific API patterns and role/label utilities.
   - `src/environments/*.ts` — where service URLs are configured.
   - `src/app/app.module.ts` — registered modules/providers (e.g., `FormsModule`, `HttpClientModule`, `DatePipe`).

8. Avoid assumptions
   - Do not change backend URLs or authentication behavior; update only environment files unless asked.
   - Keep French UI strings consistent; do not convert to English without a separate task.

If any section is unclear or you want extra examples (unit test patterns, sample component change, or a migration note), tell me which area and I’ll expand or adjust this file.
