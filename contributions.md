# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - 23.03.2026 to 29.03.2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@supermqx**      | 25.3.2026   | https://github.com/hamcoh/sopra-fs26-group-07-server/commit/ba0a5e0 | Finalized the backend data model for hamcoh/sopra-fs26-group-07-server#98 by refining the `Submission` / `ExecutionResult` persistence model and automating `submittedAt`. | Establishes the persistence foundation for run-code and final-submission features and supports later execution handling and result feedback. |
| **@supermqx** | 26.3.2026| https://github.com/hamcoh/sopra-fs26-group-07-server/pull/128/changes/7e4aa2da280fd281c424a592250b1cfc5583a453 | Implement backend handling for predefined test cases (#102)| Relevant because we can now store problems and testcases in the database. Also the repositories have been created  and laid the groundwork so JPA can use CRUD ops. s.t JPA can do e.g findTestCaseById etc.  Fixed to make sure it corresponds to REST specifications|
| **@hamcoh** | 26.03.2026   | https://github.com/hamcoh/sopra-fs26-group-07-server/commit/3cf7030ced9b2bb6b1b9ffc634e8b6c131b7aa9a | Finalized the complete logic for Creating a Game Room, including Endpoint, Method, Database tables and tests | This contribution is relevant because lobby creation is a core backend feature that enables users to start new game sessions. It establishes the foundation for room-based gameplay and ensures the feature is reliable through persistence and test coverage. |
|      **@hamcoh**              | 25.03.2026   | https://github.com/hamcoh/sopra-fs26-group-07-server/commit/92de2708495e9581112b885e4349ff66c783f825 | Implemented password change logic in the backend, including validation and automatic session invalidation after the logout and endpoint| This is important for security, as it ensures that sessions are closes immediately after a password change and enforces a consistent authentication lifecycle. |
| **[@aldigi27](https://github.com/aldigi27)** | 25.03.2026   | https://github.com/hamcoh/sopra-fs26-group-07-server/commit/9d16cdcff6bb166b6b24f89e7f834b84170afb29 (Note: task split across multiple commits) | Implemented the register and login endpoints and logic. Included several tests to validate both mechanisms. | Robust and testsed authentication endpoints are critical for user registration and secure access to protected resources. |
| **[@aldigi27](https://github.com/aldigi27)** | 27.03.2026   | https://github.com/hamcoh/sopra-fs26-group-07-server/commit/5b5397e1d11ed5f8170e20485275b3f1c5e022f3 (Note: my contribution is in the preceding commit; the following commit reflects a colleague's merge of my pull request into main: https://github.com/hamcoh/sopra-fs26-group-07-server/commit/dacccc00e0b1615916c1da557cfc3ec27c622754) | Implemented backend endpoint to serve the global leaderboard, ranking players by total points achieved.| A global leaderboard drives player engagement and competition by giving users a clear view of their standing across all games. |
| **[@aldigi27](https://github.com/aldigi27)** | 27.03.2026   | https://github.com/hamcoh/sopra-fs26-group-07-server/commit/1cdf0bba4763b10a036fbe7041f5b92dfae72e0b (Note: task split across multiple commits) | Extend user entity with game stats tracking fields. | Game stats fields are essential for tracking player progression and enabling a personalized game experience. |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@menthoos](https://github.com/menthoos)** | 27.03.2026   | https://github.com/hamcoh/sopra-fs26-group-07-client/commit/be9e41772b32318dec10ad5f134e7a259363f498 | Created a login page and a register page and implemented the handling of the login and register process with the according requests to backend and storage of relevant data the localstorage. Also made adjustments to the provided client template to match with our UI mockups / structure of our webapp. | Login and register are essential for players so that they can create or log into their accounts to play the game. |
| **[@menthoos](https://github.com/menthoos)** | 27.03.2026   | https://github.com/hamcoh/sopra-fs26-group-07-client/commit/db8186382a783e62daa214e92886e228dc908332 | Created the menu page that is shown after successful login / registration. Also created the UI / pages for creating a room and joining a room (without any handling of creating / joining room process yet) | The menu page is important for the players to navigate through the webapp. Creating a room or being able to join a friends room is essential to be able to play the game. |
| **[@menthoos](https://github.com/menthoos)** | 28.03.2026   | https://github.com/hamcoh/sopra-fs26-group-07-client/commit/95ff494047354724ac6208055357fb81a6d39c2c | Created the leaderboard page that shows a list of all registered players sorted by amount of points | The leaderboard page is important because it lets users see who else is registered on the webapp and allows for comparison between players. A user can also view another user's profile by clicking on him in the leaderboard. |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 2 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 3 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 4 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 5 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 6 - [Begin Date] to [End Date]

_Continue with the same table format as above._
