<p align="center"><img src="public/banner.png" alt="Codosseum Banner" width="52%" /></p>

<div align="center">
  <h1>
    <img src="public/codosseum_icon.svg" alt="Logo" height="52" style="vertical-align: middle;" />
    &nbsp;CODOSSEUM — Client
  </h1>
  <p><em>Two gladiators. One challenge. The fastest, most elegant code wins.</em></p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Ant%20Design-6-4361EE?style=for-the-badge&logo=antdesign&logoColor=white" />
    <img src="https://img.shields.io/badge/WebSocket-STOMP-EC4899?style=for-the-badge" />
  </p>
  <p>
    <a href="https://github.com/hamcoh/sopra-fs26-group-07-client">
      <img src="https://img.shields.io/badge/Client%20Repo-GitHub-1A1A2E?style=flat-square&logo=github" />
    </a>
    &nbsp;
    <a href="https://github.com/hamcoh/sopra-fs26-group-07-server">
      <img src="https://img.shields.io/badge/Server%20Repo-GitHub-1A1A2E?style=flat-square&logo=github" />
    </a>
    &nbsp;
    <img src="https://img.shields.io/badge/Group-%2307-4361EE?style=flat-square" />
    &nbsp;
    <img src="https://img.shields.io/badge/SoPra-FS26-EC4899?style=flat-square" />
  </p>
</div>

---

## ⚔️ About the Project

**Codosseum** is a real-time 1v1 competitive coding platform where two players go head-to-head solving programming challenges against the clock. Choose your language, enter the arena, and may the best coder win.

The platform supports two game modes:

- **⚡ Sprint Classic** — Race to solve all problems within 15 minutes. Most points wins.
- **🎮 Sprint Arcade** — Everything in Sprint Classic, plus an item shop. Earn coins by solving problems and spend them on sabotage items to disrupt your opponent.

---

## ✨ Features

<table border="0" cellspacing="0" cellpadding="6">
<tr>
<td valign="middle">
<table>
<tr><th>Feature</th><th>Description</th></tr>
<tr><td>🔴 <strong>Real-Time Battles</strong></td><td>WebSocket-based live 1v1 duels with instant state sync</td></tr>
<tr><td>🏛️ <strong>Game Lobby</strong></td><td>Lobby with live chat, room codes, and game configuration</td></tr>
<tr><td>🛒 <strong>Arcade Item Shop</strong></td><td>Buy Squid Ink, Earthquake, and Flip Screen to sabotage opponents</td></tr>
<tr><td>💻 <strong>Code Editor</strong></td><td>Syntax-highlighted editor with run, hint, and submit actions</td></tr>
<tr><td>🌍 <strong>Multi-Language</strong></td><td>Python, Java, and SQLite supported</td></tr>
<tr><td>🏆 <strong>Leaderboard</strong></td><td>Global rankings with win rates and stats</td></tr>
<tr><td>📊 <strong>Wrapped</strong></td><td>Season stats overview — wins, losses, top language, ranking</td></tr>
<tr><td>👤 <strong>Profiles</strong></td><td>Avatar selection, bio, password change, career statistics</td></tr>
<tr><td>🎨 <strong>Landing Page</strong></td><td>Live stats from the backend, animated Matrix rain effect</td></tr>
</table>
</td>
<td valign="middle" align="right" width="221">
<img src="public/gladiators_impressed.png" width="221" />
</td>
</tr>
</table>

---

## 🛠️ Tech Stack

```text
Framework      Next.js 15 (App Router) + Turbopack
Language       TypeScript 5
UI Library     Ant Design 6
Code Editor    CodeMirror via @uiw/react-codemirror
               └─ Language packs: Python · Java · SQL
Real-Time      STOMP over SockJS (@stomp/stompjs + sockjs-client)
Fonts          Inter (UI) · JetBrains Mono (code / accents)
```

---

## 🚀 Getting Started

<img src="public/gladiator_thinking.png" align="right" width="210" />

### Prerequisites

- **Node.js** v18 or higher
- The [Codosseum backend server](https://github.com/hamcoh/sopra-fs26-group-07-server) running locally or deployed

### Installation

```bash
git clone https://github.com/hamcoh/sopra-fs26-group-07-client.git
cd sopra-fs26-group-07-client
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Required for production deployments — omit for local development
# Local dev automatically targets http://localhost:8080
NEXT_PUBLIC_PROD_API_URL=https://your-backend-url.com
```

> In development mode the app always points to `http://localhost:8080`. No env file is needed for local development.

### Running Locally

```bash
# Start the development server (with Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Production build
npm run build
npm run start
```

<br clear="all" />

---

## 🗺️ Application Routes

<table border="0" cellspacing="0" cellpadding="6">
<tr>
<td valign="middle">
<table>
<tr><th>Route</th><th>Page</th><th>Auth Required</th></tr>
<tr><td><code>/</code></td><td>Landing page with live stats</td><td>No</td></tr>
<tr><td><code>/login</code></td><td>Login</td><td>No</td></tr>
<tr><td><code>/register</code></td><td>Registration + avatar selection</td><td>No</td></tr>
<tr><td><code>/menu</code></td><td>Main menu / dashboard</td><td>✅ Yes</td></tr>
<tr><td><code>/rooms</code></td><td>Browse open game rooms</td><td>✅ Yes</td></tr>
<tr><td><code>/create-room</code></td><td>Create a room with custom settings</td><td>✅ Yes</td></tr>
<tr><td><code>/join-room</code></td><td>Join a room by 6-character code</td><td>✅ Yes</td></tr>
<tr><td><code>/rooms/[roomId]</code></td><td>Game lobby with live chat</td><td>✅ Yes</td></tr>
<tr><td><code>/games/[gameSessionId]</code></td><td>Live coding battle</td><td>✅ Yes</td></tr>
<tr><td><code>/profile</code></td><td>User profile and career stats</td><td>✅ Yes</td></tr>
<tr><td><code>/changeavatar</code></td><td>Change your gladiator avatar</td><td>✅ Yes</td></tr>
<tr><td><code>/changepassword</code></td><td>Update your password</td><td>✅ Yes</td></tr>
<tr><td><code>/leaderboard</code></td><td>Global leaderboard</td><td>✅ Yes</td></tr>
<tr><td><code>/wrapped</code></td><td>Season stats overview</td><td>✅ Yes</td></tr>
</table>
</td>
<td valign="middle" align="right" width="267">
<img src="public/gladiator_navigation.png" width="267" />
</td>
</tr>
</table>

---

## 📁 Project Structure

```
app/
├── (pages)/                  # All Next.js App Router pages
│   ├── page.tsx              # Landing page
│   ├── login/
│   ├── register/
│   ├── menu/
│   ├── rooms/
│   │   └── [roomId]/         # Game lobby
│   ├── create-room/
│   ├── join-room/
│   ├── games/
│   │   └── [gameSessionId]/  # Live game + hooks + components
│   ├── profile/
│   ├── changeavatar/
│   ├── changepassword/
│   ├── leaderboard/
│   └── wrapped/
│
├── components/               # Shared UI components
│   ├── CodosseumAvatar.tsx   # Avatar renderer (19 avatars)
│   ├── CodosseumLogo.tsx
│   ├── LandingIllustrations.tsx
│   ├── LoadingScreen.tsx
│   ├── MatrixCanvas.tsx      # Animated Matrix rain effect
│   ├── ProfileButton.tsx     # Top-right user menu
│   ├── SkipButton.tsx
│   ├── profile/              # Profile sub-components
│   └── register/             # Avatar selection component
│
├── hooks/                    # Custom React hooks
│   ├── useLocalStorage.tsx   # Persistent state with localStorage
│   ├── useAuth.ts            # Login / logout logic
│   ├── useUserProfile.ts     # Fetch and manage user profile
│   └── useApi.ts
│
├── styles/                   # CSS modules + global styles
│   └── landing.css           # Landing page global styles
│
└── utils/                    # Utility functions
    ├── domain.ts             # API base URL resolver
    ├── environment.ts        # Dev / prod detection
    └── uuid.ts
```

---

## 🔌 WebSocket Architecture

Real-time communication is handled via **STOMP over SockJS**.

| Destination | Direction | Purpose |
|---|---|---|
| `/app/room/{roomId}/join` | Client → Server | Notify host a player joined |
| `/topic/room/{roomId}` | Server → Client | Room state updates (join/leave/close) |
| `/user/queue/game-start` | Server → Client | Game start signal + session data |
| `/topic/game/{id}/end` | Server → Client | Game over notification |
| `/app/room/{roomId}/send` | Client → Server | Lobby chat message |
| `/topic/chat/room/{roomId}` | Server → Client | Lobby chat broadcast |
| `/app/game/{id}/buy-item` | Client → Server | Purchase sabotage item |
| `/topic/game/{id}/sabotage` | Server → Client | Sabotage event (Arcade mode) |

---

## 👥 Team — Group #07

| GitHub | Role |
|---|---|
| [@menthoos](https://github.com/menthoos) | Frontend |
| [@aldigi27](https://github.com/aldigi27) | Backend & Database |
| [@hamcoh](https://github.com/hamcoh) | Backend |
| [@clstein](https://github.com/clstein) | Frontend |
| [@supermqx](https://github.com/supermqx) | Backend & Judge Engine |

---
