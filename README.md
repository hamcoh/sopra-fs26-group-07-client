<p align="center"><img src="public/readme/banner.png" alt="Codosseum Banner" width="52%" /></p>

<div align="center">
  <img src="public/codosseum_icon.svg" alt="Logo" height="65" />
  <h1>CODOSSEUM — Client</h1>
  <p><em>Two gladiators. One challenge. Every point counts. Compete in real-time 1v1 coding duels, climb the ranks and earn your place in the arena's history.</em></p>
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



## ⚔️ About Codosseum

<img src="public/readme/gladiator_fighting.png" align="right" width="242" />

**Codosseum** is a real-time 1v1 competitive coding game where players battle head-to-head by solving programming challenges. Choose your preferred language (`Python`, `Java` or `SQLite`), select a game mode (either a playful mode or a coding-focused one) and difficulty to enter the coding arena.

Inside the arena, players use an integrated code editor to write and test their solutions against predefined test cases, with code execution and evaluation powered by [Judge0](https://judge0.com/), the external code execution API used by our app. Once ready, players can make one final submission per problem, with victory ultimately going to the player with the most points.

Beyond the core gameplay, Codosseum also includes features such as game statistics tracking, leaderboards and competitive progression to keep the challenge going.

Ready to step into the arena? [Play now](https://sopra-fs26-group-07-client.vercel.app/), choose your language, prove your skills and may the best coder win.

<br clear="all" />



## 🏛️ Project Motivation

As AI-based coding tools become increasingly powerful, it can be tempting to delegate even basic programming tasks for the sake of efficiency and convenience. While highly useful, overreliance on AI-tools can hinder the development of essential skills such as problem-solving, algorithmic thinking, and coding fundamentals. It may also lead to comprehension debt: producing code without fully understanding it (as discussed in [hasel.dev](https://hasel.dev/author/tarek/) ).

<img src="public/readme/gladiator_newgen.png" align="right" width="210" />

These concerns are especially relevant for beginners, junior developers, and computer science students who are still building their core programming foundations. Hence, with Codosseum, we aim to provide an interactive and playful way to practice coding, fostering algorithmic thinking and problem-solving skills by making learning competitive, rewarding and fun. After all, we believe these skills will continue to matter and deserve to be practiced in ways that inspire people to keep learning.

<br clear="all" />



## 🎬 GameFlow

<p align="center"><img src="public/readme/gameflow.gif" alt="GameFlow" width="80%" /></p>



## ✨ Features
<p align="center"><img src="public/readme/gladiator_coding.png" width="35%" /></p>
<div align="center">

| Feature | Description |
|---|---|
| 🔴 **Real-Time Battles** | WebSocket-based live 1v1 duels with instant state sync |
| 🏛️ **Game Lobby** | Lobby with live chat, room codes, and game configuration |
| 🛒 **Arcade Item Shop** | Buy Squid Ink, Earthquake, and Flip Screen to sabotage opponents |
| 💻 **Code Editor** | Syntax-highlighted editor with run, hint, and submit actions |
| 🌍 **Multi-Language** | Python, Java, and SQLite supported |
| 🏆 **Leaderboard** | Global rankings with win rates and stats |
| 📊 **Wrapped** | Season stats overview — wins, losses, top language, ranking |
| 👤 **Profiles** | Avatar selection, bio, password change, career statistics |
| 🎨 **Landing Page** | Live stats from the backend, animated Matrix rain effect |

</div>



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



## 🚀 Getting Started

<img src="public/readme/gladiator_thinking.png" align="right" width="210" />

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



## 🗺️ Application Routes
<p align="center"><img src="public/readme/gladiator_navigation.png" width="220" /></p>
<div align="center">

| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing page with live stats | No |
| `/login` | Login | No |
| `/register` | Registration + avatar selection | No |
| `/menu` | Main menu / dashboard | ✅ Yes |
| `/rooms` | Browse open game rooms | ✅ Yes |
| `/create-room` | Create a room with custom settings | ✅ Yes |
| `/join-room` | Join a room by 6-character code | ✅ Yes |
| `/rooms/[roomId]` | Game lobby with live chat | ✅ Yes |
| `/games/[gameSessionId]` | Live coding battle | ✅ Yes |
| `/profile` | User profile and career stats | ✅ Yes |
| `/changeavatar` | Change your gladiator avatar | ✅ Yes |
| `/changepassword` | Update your password | ✅ Yes |
| `/leaderboard` | Global leaderboard | ✅ Yes |
| `/wrapped` | Season stats overview | ✅ Yes |

</div>



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

<p align="center"><img src="public/readme/gladiator_listening.png" width="319" /></p>

<div align="center">

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

</div>



## 🗺️ Roadmap
For developers interested in contributing to Codosseum, the following features would be valuable and exciting areas for further development:

1. **Solo Game Mode**<br>
Add a mode where players can solve problems independently, allowing them to practice specific problems or programming languages, improve weaker areas, and progress at their own pace. This does not necessarily have to be implemented as a game mode. It could also take the form of a practice mode with a list of coding problems, allowing users to select problems in their preferred programming language and solve them as often as they like, without time limits or competitive pressure.

2. **Private Rooms**<br>
Extend room configuration by allowing users to create fully private rooms that can only be joined by invited players or users with the correct room code. This could also include a WebSocket-based invitation system, enabling players to send and receive live room invitations.

3. **Additional Multiplayer Game Mode (Synchronous Game Mode)**<br>
Implement a fully synchronous game mode where all players receive every problem at the same time and have a fixed time limit to solve it. The next problem is served to both players once a player submits a fully correct solution or the timer runs out.

---

## 👥 Team — Group #07

<div align="center">

| GitHub | Role |
|---|---|
| [@menthoos](https://github.com/menthoos) | Frontend |
| [@aldigi27](https://github.com/aldigi27) | Backend |
| [@hamcoh](https://github.com/hamcoh) | Backend |
| [@clstein](https://github.com/clstein) | Frontend |
| [@supermqx](https://github.com/supermqx) | Backend |

</div>



## 🙏🏼 Acknowledgment

We would like to especially thank our TA for her outstanding support throughout the semester. Her guidance, support, and dedication helped us greatly and kept us motivated throughout the development of this project.

We also extend our thanks to the entire [Software Engineering Lab](https://hasel.dev/teachings/fs26-sopra/) team for their tutorials and effort throughout the semester.

Fruther, we would also like to warmly thank the [Judge0](https://judge0.com/) team for building such a great piece of software and making it available for others to use.

Finally, many thanks to everyone who tested the application during development and provided valuable feedback along the way.



## 📄 License

<img src="public/readme/gladiator_license.png" align="right" width="210" />

This project is released under the [Apache 2.0 License](LICENSE), which permits free use, distribution, modification, and commercial use. The software is provided as-is, without warranty or liability of any kind.

<br clear="all" />
