# DevPath Phase 4 Backend Audit and Frontend Specification

**Backend milestone:** `v0.4.3`  
**Commit:** `1bd6a52 feat: complete AI career intelligence engine`  
**Verified backend baseline:** 106 tests passing  
**Document purpose:** Product audit and implementation-ready frontend requirements based on the repository as implemented.

## 1. Project overview

DevPath is a career-development platform that turns a user's target role, profile, current skills, skill gaps, roadmap, and learning progress into a personalized execution path. The backend supports account onboarding, career-state management, deterministic career intelligence, and several Gemini-backed AI experiences behind a shared provider abstraction.

### Current backend capabilities

- Email/password signup and login with bearer JWT authentication.
- User-owned profile, career goal, skills, roadmap, progress, recommendations, and coach conversations.
- Public role discovery, role requirements, and skill learning resources.
- Skill-gap analysis, roadmap generation, progress aggregation, and dashboard summaries.
- AI career analysis, career coach chat, roadmap optimization, weekly planning, and interview preparation.
- Shared AI context construction and a provider-neutral `AIProvider` interface backed by Gemini.

### Completed phase summary

| Phase | Delivered capability |
|---|---|
| Phase 1 — Authentication foundation | User signup, login, password hashing, JWT issuance, authenticated-user dependency, and protected user-owned routes. |
| Phase 2 — Career intelligence foundation | Profiles, target roles, career goals, user skills, role skill requirements, skill gaps, resources, roadmap generation, and progress. |
| Phase 3 — Personalization engine | Priority-scored recommendations, consolidated dashboard data, and stale-intelligence invalidation behavior. |
| Phase 4 — AI intelligence layer | Shared AI context, Gemini provider integration, career coach, career analysis, adaptive roadmap optimization, weekly learning planner, and interview coach. |

### Backend architecture relevant to the frontend

Protected requests resolve a user from `Authorization: Bearer <JWT>`. Deterministic features use routers and domain services. AI features preserve the following boundary:

```text
Authenticated request
  -> feature router
  -> build_ai_context()
  -> feature service
  -> AIProvider
  -> GeminiProvider
  -> validated Pydantic response
```

AI endpoints return `502 Bad Gateway` when a provider response fails or cannot be validated. The frontend should display a retryable, user-safe error and must not assume an AI result was saved.

## 2. Complete feature audit

### 2.1 Authentication and protected routes

**Purpose.** Create accounts, authenticate users, and isolate all user-owned career data.

**Backend files.** `backend/app/routers/auth.py`, `backend/app/auth/security.py`, `backend/app/auth/dependencies.py`, `backend/app/models/user.py`, `backend/app/schemas/user.py`.

**Endpoints.**

- `POST /auth/signup`
- `POST /auth/login`

**Inputs.** Signup accepts `name`, valid `email`, and an 8–72 character `password`. Login accepts `email` and `password`.

**Outputs.** Signup returns `{id, name, email}`. Login returns `{access_token, token_type: "bearer"}`. Tokens expire after 30 minutes.

**Frontend usage.** Build signup and login forms, persist the access token in the selected client auth strategy, attach it to protected requests, and redirect a `401` response to login. Signup does not log the user in automatically; the frontend must call login after signup or send the user to the login screen.

**Implemented limitations.** There is no refresh-token endpoint, logout endpoint, password recovery, email verification, or `GET /me` user-account endpoint. Client-side logout can only discard the token.

### 2.2 User profile management

**Purpose.** Store learning and education preferences used by personalization and AI context.

**Backend files.** `backend/app/routers/profile.py`, `backend/app/services/profile.py`, `backend/app/models/profile.py`, `backend/app/schemas/profile.py`.

**Endpoints.** `POST /api/v1/profile`, `GET /api/v1/profile/me`, `PUT /api/v1/profile/me`.

**Inputs.** Optional fields: `education`, `degree`, `graduation_year` (1900–2200), `experience_level`, `preferred_domain`, `learning_style`, `weekly_learning_hours` (1–168), and `target_timeline`.

**Output.** `{id, user_id, education, degree, graduation_year, experience_level, preferred_domain, learning_style, weekly_learning_hours, target_timeline, updated_at}`.

**Frontend usage.** Use a profile onboarding/edit form. A `404` from `GET /me` means the profile has not been created; a `400` from create means one already exists. There is no profile delete endpoint.

### 2.3 Career goals

**Purpose.** Define the authenticated user's target role and planning preferences.

**Backend files.** `backend/app/routers/career_goals.py`, `backend/app/services/career_goals.py`, `backend/app/models/career_goal.py`, `backend/app/schemas/career_goals.py`, `backend/app/services/intelligence_state.py`.

**Endpoints.** `POST /api/v1/career-goals`, `GET /api/v1/career-goals/me`, `PUT /api/v1/career-goals/me`, `DELETE /api/v1/career-goals/me`.

**Inputs.** Create accepts `target_role_id` plus optional `experience_level`, `timeline`, and `preferences`. Update accepts at least one of those fields.

**Output.** `{id, target_role_id, target_role, experience_level, timeline, preferences}`. Delete returns `204`.

**Frontend usage.** Populate role selection from the roles API, then create or edit the user's single active goal. Changing the goal can invalidate prior roadmap/recommendation intelligence; refresh dependent dashboard data afterward.

### 2.4 Role discovery and role requirements

**Purpose.** Expose career roles and the skills required for each role.

**Backend files.** `backend/app/routers/roles.py`, `backend/app/models/role.py`, `backend/app/models/role_skill.py`, `backend/app/models/skill.py`.

**Endpoints.** `GET /api/v1/roles`, `GET /api/v1/roles/{role_id}`, `GET /api/v1/roles/{role_id}/skills`.

**Authentication.** These endpoints are public in the current implementation.

**Outputs.** Role objects contain `{id, title, description, created_at}`. Role skills return `{role, skills: [{name, importance, difficulty}]}`.

**Frontend usage.** Use role lists for career-goal selection and role detail pages. Use required skills to explain role expectations before the user commits to a goal.

### 2.5 User skills

**Purpose.** Track the authenticated user's current skill level and learning status.

**Backend files.** `backend/app/routers/user_skills.py`, `backend/app/services/user_skills.py`, `backend/app/models/user_skill.py`, `backend/app/schemas/user_skills.py`.

**Endpoints.** `POST /api/v1/user-skills`, `GET /api/v1/user-skills`, `PUT /api/v1/user-skills/{skill_id}`, `DELETE /api/v1/user-skills/{skill_id}`.

**Inputs.** Create accepts `{skill_id, level, status}`. Levels are `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, or `EXPERT`. Statuses are `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, or `MASTERED`. Update accepts at least one non-null `level` or `status`.

**Output.** `{id, skill_id, skill, level, status}`. Delete returns `204`.

**Frontend usage.** Build a skill inventory with level/status selectors, editing, and removal. The backend prevents duplicate user-skill records.

**Implemented limitation.** There is no registered general `GET /api/v1/skills` catalog endpoint. The frontend cannot discover every skill from a dedicated API; it can only obtain named skills through role requirements, roadmap/user-skill responses, and skill-resource lookup when an ID is already known.

### 2.6 Skill-gap analysis

**Purpose.** Compare the user's skills with a target role and persist the latest gap analysis.

**Backend files.** `backend/app/routers/skill_gap.py`, `backend/app/services/skill_gap.py`, `backend/app/models/skill_gap.py`.

**Endpoints.** `POST /api/v1/skill-gap/analyze`, `GET /api/v1/skill-gap/latest`.

**Input.** Analyze accepts `{role_id}`.

**Output.** `{id, user_id, role_id, role, overall_score, missing_skills, generated_at}`, where each missing skill contains `{id, name, importance, difficulty, priority_score, priority}`.

**Frontend usage.** Render readiness, missing-skill priorities, and explanations after goal or skill changes. `GET /latest` returns `404` until an analysis has been saved.

### 2.7 Learning resources

**Purpose.** Return seeded learning resources associated with a known skill.

**Backend files.** `backend/app/routers/resources.py`, `backend/app/models/learning_resource.py`, `backend/app/models/skill.py`.

**Endpoint.** `GET /api/v1/skills/{skill_id}/resources` (public).

**Output.** `{skill, resources: [{title, provider, type, difficulty, rating}]}` sorted by rating and title.

**Frontend usage.** Add resource drawers/cards to skill-gap and roadmap-step views.

**Implemented limitation.** Resource responses contain no URL field, so the frontend can display metadata but cannot link users directly to a resource from this API.

### 2.8 Roadmap generation and retrieval

**Purpose.** Generate an ordered learning roadmap for a role from the user's missing skills and return the active roadmap.

**Backend files.** `backend/app/routers/roadmap.py`, `backend/app/services/roadmap_generator.py`, `backend/app/models/roadmap.py`, `backend/app/models/roadmap_step.py`.

**Endpoints.** `POST /api/v1/roadmap/generate`, `GET /api/v1/roadmap/current`.

**Input.** Generate accepts `{role_id}`.

**Output.** `{id, title, role_id, role, duration, steps}`, with ordered step objects `{id, skill_id, skill, title, description, order, week_number, estimated_hours}`.

**Frontend usage.** Display a timeline grouped by `week_number`, estimated effort, and skill. Generation makes previous roadmaps inactive and returns the new active roadmap. The response does not embed progress status; combine it with progress APIs.

### 2.9 Progress tracking

**Purpose.** Record roadmap-step status and calculate roadmap completion.

**Backend files.** `backend/app/routers/progress.py`, `backend/app/services/progress.py`, `backend/app/models/progress.py`, `backend/app/schemas/progress.py`.

**Endpoints.** `PUT /api/v1/progress/{step_id}`, `GET /api/v1/progress/me`, `GET /api/v1/progress/roadmap/{roadmap_id}`.

**Input.** Update accepts `{status}`, where status is `not_started`, `in_progress`, or `completed`.

**Outputs.** Step progress is `{id, step_id, roadmap_id, step, status, completed_at}`. Roadmap aggregation is `{roadmap_id, completed_steps, total_steps, completion_percentage}`.

**Frontend usage.** Provide roadmap step controls/checklists and refresh dashboard/roadmap aggregates after updates. User ownership is enforced by the backend.

### 2.10 Personalization recommendations

**Purpose.** Generate and persist priority-scored recommendations from profile urgency and missing skills.

**Backend files.** `backend/app/routers/personalization.py`, `backend/app/services/personalization.py`, `backend/app/models/personalization.py`, `backend/app/schemas/personalization.py`.

**Endpoints.** `POST /api/v1/personalization/analyze`, `GET /api/v1/personalization/recommendations`, `GET /api/v1/personalization/recommendations/{recommendation_id}`.

**Output.** Recommendation objects contain `{id, user_id, recommendation_type, title, description, reason, priority_score, priority_level, created_at}`. Priority level is `LOW`, `MEDIUM`, or `HIGH`.

**Frontend usage.** Generate recommendations after profile/goal/skill setup, display ranked cards, and provide a detail view explaining the reason.

**Implemented limitation.** There is no accept, dismiss, complete, or delete action for a recommendation.

### 2.11 Dashboard aggregation

**Purpose.** Provide a single authenticated overview of the user's career state.

**Backend files.** `backend/app/routers/dashboard.py`, `backend/app/services/dashboard.py`, `backend/app/schemas/dashboard.py`.

**Endpoint.** `GET /api/v1/dashboard`.

**Output.**

```json
{
  "career_profile": {
    "target_role": "string",
    "experience_level": "string",
    "readiness_score": 0
  },
  "skill_overview": {
    "total_skills": 0,
    "completed": 0,
    "in_progress": 0,
    "missing": 0
  },
  "strengths": [{"skill": "string", "level": "BEGINNER"}],
  "skill_gaps": [{"skill": "string", "priority": "string"}],
  "roadmap_progress": {
    "current_phase": null,
    "completion_percentage": 0,
    "completed_steps": 0,
    "total_steps": 0
  },
  "ai_recommendations": ["string"]
}
```

**Frontend usage.** This is the primary dashboard read API. It requires a target career role and returns `404` if one is not configured; route such users back into onboarding.

### 2.12 Conversation storage

**Purpose.** Persist and retrieve user-owned conversation histories used by the AI coach.

**Backend files.** `backend/app/routers/conversations.py`, `backend/app/services/conversation.py`, `backend/app/models/conversation.py`, `backend/app/models/message.py`, `backend/app/schemas/conversation.py`.

**Endpoints.** `POST /api/v1/conversations`, `GET /api/v1/conversations`, `GET /api/v1/conversations/{conversation_id}`, `POST /api/v1/conversations/{conversation_id}/messages`.

**Inputs.** Conversation create accepts `{title}`. Message create accepts `{role, content}`, with roles `system`, `user`, or `assistant`.

**Outputs.** Conversation summaries contain `{id, title, created_at, updated_at}`. Detail adds `messages`, each containing `{id, conversation_id, role, content, created_at}`.

**Frontend usage.** Build the coach conversation list, new-chat action, transcript restoration, and ownership-safe deep links.

### 2.13 AI Career Coach

**Purpose.** Generate a context-aware coaching reply in an existing conversation and persist the interaction.

**Backend files.** `backend/app/routers/coach.py`, `backend/app/services/ai_career_coach.py`, `backend/app/services/ai_context.py`, `backend/app/schemas/coach.py`, `backend/app/ai/prompts/career_coach.py`, `backend/app/ai/base.py`, `backend/app/ai/providers/gemini_provider.py`.

**Endpoint.** `POST /api/v1/coach/chat`.

**Input.** `{conversation_id, message}`.

**Output.** `{conversation_id, response}`. The service includes user context/history and persists user and assistant messages.

**Frontend usage.** Submit chat messages, optimistically show the user message if desired, then render the returned assistant response and refresh conversation history. Handle `404` for an inaccessible conversation and `502` as retryable AI failure.

### 2.14 AI Career Analysis

**Purpose.** Generate a structured assessment of career readiness, strengths, weaknesses, priorities, and next actions.

**Backend files.** `backend/app/routers/intelligence.py`, `backend/app/services/ai_intelligence.py`, `backend/app/services/ai_context.py`, `backend/app/schemas/intelligence.py`, `backend/app/ai/prompts/intelligence.py`.

**Endpoint.** `POST /api/v1/intelligence/analyze`.

**Input.** `{focus?: string}`; focus is optional and limited to 500 characters.

**Output.** `{career_stage, readiness_score, strengths: [{area, explanation}], weaknesses, skill_priorities: [{skill, priority, reason}], next_actions}`.

**Frontend usage.** Render an analysis dashboard with score, strengths, weaknesses, prioritized skills, and actions. Results are generated on demand and are not persisted by this endpoint.

### 2.15 Adaptive Roadmap Optimizer

**Purpose.** Evaluate the current authenticated context and recommend changes to the learning roadmap.

**Backend files.** `backend/app/routers/adaptive.py`, `backend/app/services/roadmap_optimizer.py`, `backend/app/services/ai_context.py`, `backend/app/schemas/adaptive_ai.py`, `backend/app/ai/prompts/adaptive.py`.

**Endpoint.** `POST /api/v1/adaptive/roadmap-optimize` (no request body).

**Output.** `{roadmap_status, completed_strengths, recommended_changes: [{action, item, reason}], next_focus, confidence_score}`.

**Frontend usage.** Place an “Optimize roadmap” action on the roadmap page and render proposed changes separately from the active roadmap.

**Implemented limitation.** Recommendations are not automatically applied or persisted, and there is no accept-change endpoint.

### 2.16 AI Weekly Learning Planner

**Purpose.** Turn current career context into a realistic seven-day learning plan.

**Backend files.** `backend/app/routers/planner.py`, `backend/app/services/weekly_planner.py`, `backend/app/services/ai_context.py`, `backend/app/schemas/weekly_planner.py`, `backend/app/ai/prompts/planner.py`.

**Endpoint.** `POST /api/v1/planner/weekly-plan` (no request body).

**Output.** `{week_number, focus_area, summary, tasks, expected_outcomes, confidence_score}`. Each task contains `{title, description, estimated_hours, priority, skill_focus}`, with priority `High`, `Medium`, or `Low`.

**Frontend usage.** Render a weekly focus header, effort total, prioritized task cards, and expected outcomes.

**Implemented limitation.** Plans and task completion are not persisted. The existing progress API tracks roadmap steps only, not generated weekly tasks.

### 2.17 AI Interview Coach

**Purpose.** Generate role- and skill-aware interview preparation material.

**Backend files.** `backend/app/routers/interview.py`, `backend/app/services/interview_coach.py`, `backend/app/services/ai_context.py`, `backend/app/schemas/interview.py`, `backend/app/ai/prompts/interview.py`.

**Endpoint.** `POST /api/v1/interview/prepare` (no request body).

**Output.** `{target_role, preparation_summary, questions, focus_areas, confidence_score}`. Each question contains `{question, category, difficulty, evaluation_points}`, with difficulty `Easy`, `Medium`, or `Hard`.

**Frontend usage.** Render preparation summary/focus chips and expandable question cards with evaluation rubrics.

**Implemented limitation.** Interview plans, answers, scoring, practice sessions, and history are not persisted.

### 2.18 Service status

**Purpose.** Basic service discovery and health checks.

**Backend files.** `backend/app/main.py`.

**Endpoints.** `GET /` returns `{message}`; `GET /health` returns `{status, service}`. Both are public.

## 3. Complete API inventory

“Bearer” means `Authorization: Bearer <access_token>` is required.

| Endpoint | Method | Authentication | Purpose | Frontend screen |
|---|---:|---|---|---|
| `/` | GET | Public | API service message | Operational only |
| `/health` | GET | Public | Health status | Deployment monitoring |
| `/auth/signup` | POST | Public | Create account | Signup |
| `/auth/login` | POST | Public | Issue JWT | Login |
| `/api/v1/profile` | POST | Bearer | Create profile | Onboarding/Profile |
| `/api/v1/profile/me` | GET | Bearer | Retrieve profile | Onboarding/Profile |
| `/api/v1/profile/me` | PUT | Bearer | Update profile | Profile settings |
| `/api/v1/career-goals` | POST | Bearer | Create target career goal | Goal onboarding |
| `/api/v1/career-goals/me` | GET | Bearer | Retrieve active goal | Dashboard/Goal settings |
| `/api/v1/career-goals/me` | PUT | Bearer | Update active goal | Goal settings |
| `/api/v1/career-goals/me` | DELETE | Bearer | Delete active goal | Goal settings |
| `/api/v1/roles` | GET | Public | List career roles | Goal selection/Role catalog |
| `/api/v1/roles/{role_id}` | GET | Public | Retrieve role | Role detail |
| `/api/v1/roles/{role_id}/skills` | GET | Public | List role requirements | Role detail/Skill comparison |
| `/api/v1/user-skills` | POST | Bearer | Add user skill | Skill inventory |
| `/api/v1/user-skills` | GET | Bearer | List user skills | Skill inventory |
| `/api/v1/user-skills/{skill_id}` | PUT | Bearer | Update level/status | Skill inventory |
| `/api/v1/user-skills/{skill_id}` | DELETE | Bearer | Remove user skill | Skill inventory |
| `/api/v1/skill-gap/analyze` | POST | Bearer | Generate/save gap analysis | Skill-gap analysis |
| `/api/v1/skill-gap/latest` | GET | Bearer | Retrieve latest saved gap | Dashboard/Skill gaps |
| `/api/v1/skills/{skill_id}/resources` | GET | Public | List learning resources | Skill/Roadmap detail |
| `/api/v1/roadmap/generate` | POST | Bearer | Generate active roadmap | Roadmap setup |
| `/api/v1/roadmap/current` | GET | Bearer | Retrieve active roadmap | Roadmap |
| `/api/v1/progress/{step_id}` | PUT | Bearer | Update roadmap-step status | Roadmap |
| `/api/v1/progress/me` | GET | Bearer | List all user progress | Roadmap/Progress history |
| `/api/v1/progress/roadmap/{roadmap_id}` | GET | Bearer | Calculate roadmap completion | Roadmap/Dashboard |
| `/api/v1/personalization/analyze` | POST | Bearer | Generate/save recommendations | Recommendations |
| `/api/v1/personalization/recommendations` | GET | Bearer | List active recommendations | Dashboard/Recommendations |
| `/api/v1/personalization/recommendations/{recommendation_id}` | GET | Bearer | Retrieve recommendation detail | Recommendation detail |
| `/api/v1/dashboard` | GET | Bearer | Aggregate current career state | Dashboard |
| `/api/v1/conversations` | POST | Bearer | Create coach conversation | AI Coach |
| `/api/v1/conversations` | GET | Bearer | List coach conversations | AI Coach history |
| `/api/v1/conversations/{conversation_id}` | GET | Bearer | Retrieve transcript | AI Coach |
| `/api/v1/conversations/{conversation_id}/messages` | POST | Bearer | Add a message directly | Conversation tooling |
| `/api/v1/coach/chat` | POST | Bearer | Generate/persist AI coach reply | AI Coach |
| `/api/v1/intelligence/analyze` | POST | Bearer | Generate career analysis | Career Intelligence |
| `/api/v1/adaptive/roadmap-optimize` | POST | Bearer | Generate roadmap recommendations | Roadmap |
| `/api/v1/planner/weekly-plan` | POST | Bearer | Generate weekly plan | Weekly Planner |
| `/api/v1/interview/prepare` | POST | Bearer | Generate interview preparation | Interview Coach |

## 4. Frontend screen requirements

### 4.1 Landing page

**Purpose.** Explain DevPath’s target-role-to-action-plan value and direct users to signup/login.

**Data.** No product API is required. Optionally use `/health` only for operational status, not normal page rendering.

### 4.2 Authentication

**Screens.** Signup and login.

**Requirements.** Validated email/password inputs, signup password length feedback, API error states, token storage, bearer-request client, session-expiry handling, and protected-route guards.

### 4.3 Onboarding wizard

**Steps.** Profile setup → role exploration → career goal → current skill inventory → gap analysis → roadmap generation → optional recommendations.

**Requirements.** Resume safely when profile or goal endpoints return existing data. Explain that role/skill changes affect downstream intelligence. Dashboard access should remain guarded until a target role exists.

### 4.4 User dashboard

**Display.** Target role, experience level, readiness score, skill counts, top strengths, priority skill gaps, current roadmap phase/completion, and active recommendation titles.

**Primary API.** `GET /api/v1/dashboard`.

**States.** Loading skeleton, onboarding-required `404`, empty roadmap progress, no recommendations, expired session, and retry.

### 4.5 Profile and career settings

**Display/edit.** Education, degree, graduation year, experience, preferred domain, learning style, weekly capacity, timeline, target role, and goal preferences.

**Caution.** After career-goal changes, invalidate cached dashboard, skill-gap, roadmap, recommendations, and generated AI views.

### 4.6 Role catalog and detail

**Display.** Search/filter locally over returned roles, role description, required skills, importance, and difficulty. No backend search parameters are implemented.

### 4.7 Skill inventory and gap analysis

**Display.** User skills with level/status controls; readiness score; prioritized missing skills; resource metadata for selected skills.

**Caution.** The UI needs a product decision for adding skills not discoverable through role requirements because a complete skill catalog endpoint is absent.

### 4.8 Roadmap page

**Display.** Roadmap header, duration, ordered/week-grouped steps, estimated hours, skill, description, step status, aggregate completion, and optimizer recommendations.

**Interactions.** Generate roadmap, change each step status, fetch resources by `skill_id`, request optimization, and refresh progress/dashboard after mutation.

**Constraint.** AI optimization is advisory only; do not label recommendations as applied.

### 4.9 Career Intelligence dashboard

**Display.** Optional focus input, career stage, readiness score, strength explanations, weaknesses, prioritized skills/reasons, and next actions.

**Behavior.** Generate on user action, show a potentially longer AI loading state, and offer retry on `502`. Results are session/UI state unless the frontend chooses local persistence.

### 4.10 Recommendations

**Display.** Priority badge/score, title, description, reason, type, and created date. Support generation and detail navigation.

**Constraint.** Do not show accept/dismiss controls as functional; the backend does not support those mutations.

### 4.11 Weekly Planner

**Display.** Week number, focus area, summary, total estimated hours computed client-side, task cards grouped or sorted by priority, skill focus, expected outcomes, and confidence score.

**Constraint.** A task checklist can be visual-only within the current session, but must not imply server persistence. There is no weekly-plan history.

### 4.12 AI Career Coach

**Display.** Conversation sidebar, create-conversation dialog, transcript, role-aware message bubbles, composer, send/loading/error states, and scroll behavior.

**Behavior.** Create a conversation before the first AI chat, then call `/coach/chat`; restore transcripts from the conversation detail endpoint.

### 4.13 Interview Coach

**Display.** Target role, preparation summary, confidence, focus-area chips, and question cards filterable locally by category/difficulty. Each card should reveal evaluation points.

**Constraint.** Answer capture, evaluation, scoring, and session history are not implemented server-side.

### 4.14 Account/settings shell

**Display.** Profile and career-goal settings plus client-side logout. Password/account management is future work.

## 5. Frontend component map

### Application foundation

- `PublicLayout`, `AuthenticatedLayout`, `Navbar`, `Sidebar`, `MobileNavigation`
- `AuthGuard`, `OnboardingGuard`, `PageHeader`, `Breadcrumbs`
- Central API client with bearer injection, typed errors, `401` handling, and request cancellation
- Query cache keys grouped by profile, goal, dashboard, skills, gap, roadmap, progress, recommendations, conversations, and generated AI results

### Shared feedback and data display

- `LoadingSkeleton`, `EmptyState`, `ErrorState`, `RetryButton`, `ConfirmDialog`
- `MetricCard`, `ProgressBar`, `ConfidenceBadge`, `PriorityBadge`, `StatusBadge`
- `SectionCard`, `DetailList`, `ChipList`, `Timestamp`, `ScoreGauge`

### Career intelligence components

- `CareerGoalCard`, `RoleSelector`, `RoleRequirementList`
- `ProfileForm`, `CareerGoalForm`, `SkillInventoryTable`, `SkillLevelSelect`, `SkillStatusSelect`
- `SkillGapCard`, `SkillBadge`, `ResourceList`, `RecommendationCard`
- `ReadinessScoreCard`, `StrengthCard`, `WeaknessList`, `NextActionsList`

### Roadmap and execution components

- `RoadmapTimeline`, `RoadmapWeekGroup`, `RoadmapStepCard`, `StepStatusControl`
- `RoadmapProgressSummary`, `OptimizationChangeCard`, `ExpectedOutcomeList`
- `WeeklyPlanHeader`, `WeeklyTaskCard`, `EstimatedHoursSummary`

### AI interaction components

- `AIActionButton`, `AIGenerationState`, `AIErrorBanner`
- `ConversationList`, `ConversationHeader`, `MessageBubble`, `ChatComposer`
- `InterviewQuestionCard`, `DifficultyBadge`, `EvaluationPointList`

## 6. User journey flows

### Flow 1 — New user

```text
Landing
  -> Signup
  -> Login (signup does not issue a token)
  -> Create profile
  -> Browse/select role
  -> Create career goal
  -> Add current skills
  -> Run skill-gap analysis
  -> Generate roadmap
  -> Generate recommendations (optional)
  -> Dashboard
```

Failure/empty-state routing must be based on real API responses: missing profile, goal, gap, and roadmap commonly return `404` and represent onboarding state rather than a fatal application error.

### Flow 2 — Returning user execution

```text
Login
  -> Dashboard
  -> Roadmap or Weekly Planner
  -> Update roadmap-step progress
  -> Refresh roadmap progress and dashboard
```

Weekly tasks cannot currently be saved as completed; durable completion must use roadmap steps.

### Flow 3 — Career intelligence review

```text
Dashboard
  -> Career Intelligence
  -> Optional analysis focus
  -> Generate AI analysis
  -> Review strengths, weaknesses, priorities, next actions
  -> Navigate to skills or roadmap
```

### Flow 4 — AI coaching

```text
Dashboard
  -> AI Coach
  -> Select existing conversation or create one
  -> Load transcript
  -> Send message through coach endpoint
  -> Receive and persist AI reply
```

### Flow 5 — Roadmap optimization

```text
Roadmap
  -> Review progress
  -> Request AI optimization
  -> Review proposed changes and rationale
  -> Manually act on relevant recommendations
```

No backend operation applies an optimization automatically.

### Flow 6 — Interview preparation

```text
Dashboard
  -> Interview Coach
  -> Generate preparation
  -> Review focus areas
  -> Expand questions and evaluation points
  -> Practice outside persisted backend state
```

## 7. Frontend data requirements

| Screen | Required API calls | Mutations/actions | Cache/invalidation notes |
|---|---|---|---|
| Landing | None | None | Static content. |
| Signup | None initially | `POST /auth/signup` | Redirect to login after success. |
| Login | None initially | `POST /auth/login` | Store token; initialize protected app state. |
| Profile onboarding/settings | `GET /api/v1/profile/me` | `POST /api/v1/profile`, `PUT /api/v1/profile/me` | Invalidate dashboard and generated AI state after update. |
| Goal onboarding/settings | `GET /api/v1/roles`, `GET /api/v1/career-goals/me`; optionally role detail/skills | Create/update/delete career goal | Invalidate goal, dashboard, gap, roadmap, recommendations, and AI views. |
| Role catalog/detail | Roles list, role detail, role skills | None | Public and suitable for longer caching. |
| Skill inventory | `GET /api/v1/user-skills`; role skills for candidate IDs | Add/update/delete user skill | Invalidate user skills, dashboard, gap, roadmap-derived AI views. |
| Skill-gap analysis | `GET /api/v1/skill-gap/latest`; role requirements | `POST /api/v1/skill-gap/analyze` | Refresh dashboard and recommendations after analysis. |
| Resource panel | `GET /api/v1/skills/{skill_id}/resources` | None | Cache per skill ID. |
| Dashboard | `GET /api/v1/dashboard` | None | `404` routes to goal onboarding. |
| Roadmap | `GET /api/v1/roadmap/current`, `GET /api/v1/progress/me`, `GET /api/v1/progress/roadmap/{id}` | Generate roadmap; update step progress; request optimizer | Refresh dashboard/progress after generation or status mutation. Optimizer output is ephemeral. |
| Recommendations | `GET /api/v1/personalization/recommendations`; optional detail | Generate via `/personalization/analyze` | Generation replaces active recommendation set; refresh dashboard. |
| Career Intelligence | Context is server-built; no prerequisite fetch required | `POST /api/v1/intelligence/analyze` | Result is not persisted; retain in component/query state only. |
| Weekly Planner | Context is server-built; no prerequisite fetch required | `POST /api/v1/planner/weekly-plan` | Plan is not persisted. Regeneration may produce a different result. |
| AI Coach | `GET /api/v1/conversations`, conversation detail | Create conversation; `POST /api/v1/coach/chat` | Refresh selected transcript and conversation ordering after chat. |
| Interview Coach | Context is server-built; no prerequisite fetch required | `POST /api/v1/interview/prepare` | Result is not persisted. |

### Cross-cutting frontend data rules

- Treat all protected data as user-scoped; clear caches on logout or token failure.
- The backend constructs AI context. Do not send profile, goal, skills, or roadmap data in AI requests unless the endpoint schema explicitly asks for it.
- Handle `401` globally, `404` contextually as missing setup/content, `409` as a conflict, validation errors as form feedback, and AI `502` errors as retryable generation failures.
- Do not infer that an AI response was saved unless documented above.

## 8. Missing frontend features and backend gaps

### Implemented backend capabilities that still need UI support

- Full onboarding for profile, goal, skills, skill gap, and roadmap generation.
- Roadmap-step progress updates and completion visualization.
- Recommendation generation, ranking, and detail explanations.
- Conversation creation, history browsing, and coach chat.
- Career analysis, roadmap optimization, weekly planner, and interview coach result views.
- Role requirements and learning-resource metadata within career/roadmap screens.

### UI concepts that cannot yet be fully backed by APIs

- **General skill picker:** no skill catalog/search endpoint exists.
- **Clickable learning resources:** response objects have no destination URL.
- **Apply roadmap optimization:** optimizer output is advisory; no apply/persist endpoint exists.
- **Weekly task completion/history:** weekly plans are not stored and tasks have no identifiers/status API.
- **Interview practice history/scoring:** no answer, evaluation, attempt, or history API exists.
- **Persisted career-analysis history:** analysis is generated but not stored.
- **Recommendation acceptance/dismissal:** only generation and reads exist.
- **Account session management:** no refresh, logout/revocation, password recovery, email verification, or account deletion.
- **User identity fetch:** no authenticated account `GET /me` endpoint exists outside profile data.
- **Notifications, streaks, portfolio/project tracking, and analytics:** no corresponding models/endpoints exist.

The frontend must not ship controls that imply these operations are durable without either a backend addition or explicit local-only labeling.

## 9. Future product improvements

The following are recommendations, not current backend capabilities:

1. Add a paginated/searchable skill catalog and include resource URLs.
2. Add refresh-token/session revocation and account recovery flows.
3. Persist AI analyses, roadmap optimizations, weekly plans, and interview sessions with generated timestamps and history.
4. Add optimization accept/reject operations with auditable roadmap revisions.
5. Add weekly task status, carry-over, scheduling, and roadmap-step linkage.
6. Add interview answer capture, rubric-based AI evaluation, scoring trends, and practice modes.
7. Add recommendation lifecycle states: accepted, dismissed, completed, and expired.
8. Add portfolio/project evidence connected to skills and roadmap outcomes.
9. Add learning streaks, reminders, notification preferences, and calendar integration.
10. Add progress-report and analytics APIs for readiness trends, effort, completion velocity, and skill growth.
11. Add frontend-oriented pagination/filtering to conversations, roles, recommendations, and progress history as data volume grows.
12. Add accessibility, telemetry, feature flags, rate-limit feedback, and AI-generation observability before production scale.

## 10. Final frontend build plan

### Phase 5.1 — Foundation and authentication

- Establish the frontend framework and TypeScript conventions.
- Configure environment-aware API base URL and generated/manual API types.
- Implement API client, bearer injection, error normalization, and query caching.
- Build signup, login, token expiry handling, protected routes, and client logout.
- Build responsive authenticated layout, navigation, feedback states, and design tokens.
- Add route-level error boundaries and accessibility baseline.

**Exit criterion:** A user can sign up, log in, enter protected routes, and recover cleanly from an expired token.

### Phase 5.2 — Onboarding and dashboard

- Build profile, role selection, career-goal, and user-skill onboarding.
- Add skill-gap analysis, roadmap generation, and recommendation generation steps.
- Build dashboard cards from the aggregate endpoint.
- Implement missing-setup routing for `404` responses.

**Exit criterion:** A new user can reach a populated dashboard using only implemented APIs.

### Phase 5.3 — Career intelligence and roadmap execution

- Build role detail, skill inventory, gap analysis, resource metadata, and recommendation views.
- Build roadmap timeline, progress status controls, and progress aggregation.
- Build AI Career Analysis and Adaptive Roadmap Optimizer views.
- Clearly label optimizer results as recommendations rather than applied changes.

**Exit criterion:** A user can understand gaps, follow a roadmap, update durable progress, and request AI analysis/optimization.

### Phase 5.4 — Planner, Career Coach, and Interview Coach

- Build weekly-plan generation and task presentation with non-persistence disclosure.
- Build conversation list, transcript, and AI chat interactions.
- Build interview preparation with difficulty/category filters and evaluation-point disclosure.
- Standardize AI loading, timeout, retry, and `502` states.

**Exit criterion:** All Phase 4 AI capabilities have complete, honest UI representations.

### Phase 5.5 — Quality, testing, and deployment

- Add responsive and accessibility review across all journeys.
- Add unit, component, integration, and end-to-end tests for onboarding and returning-user flows.
- Add API contract tests against the FastAPI OpenAPI document.
- Add error monitoring, product analytics, performance budgets, and security review.
- Validate empty, loading, error, partial-setup, and expired-session states.
- Deploy frontend with environment configuration and backend CORS/origin validation.

**Exit criterion:** Critical journeys pass automated tests and production readiness checks without presenting unsupported backend behavior.

## Appendix A — Frontend contract cautions

- API prefixes are not uniform: authentication uses `/auth`, most application routes embed `/api/v1`, and adaptive/planner/interview routers receive `/api/v1` during registration. Use the exact paths in the inventory.
- Role and resource endpoints are currently public; all user-owned endpoints require bearer authentication.
- Signup returns a user, not a token.
- JWT lifetime is 30 minutes and there is no refresh flow.
- Dashboard requires a configured career goal.
- Roadmap responses omit progress status; join by `step_id` with progress data.
- AI endpoints may return a validated `502` even when the upstream provider returned text, because schema validation is enforced.
- Weekly plans, interview preparation, career analysis, and roadmap optimization are generated responses, not persisted entities.
- The coach is the exception among AI experiences: it uses persisted conversations/messages.

## Appendix B — Source-of-truth files audited

- Application registration: `backend/app/main.py`
- Routers: `backend/app/routers/`
- Request/response schemas: `backend/app/schemas/` plus router-local schemas in roles, roadmap, resources, and skill-gap routers
- Domain and AI services: `backend/app/services/`
- Authentication: `backend/app/auth/`
- AI provider/prompts: `backend/app/ai/`
- Persistence models: `backend/app/models/`
- Behavioral verification: `backend/tests/` (106 passing tests at the audited milestone)
