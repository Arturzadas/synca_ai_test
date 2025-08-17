# Pokémon Battle Royale Dashboard

A real-time multiplayer **Pokémon voting battle** built with **React, Chakra UI, and PeerJS**. Players can connect via Peer-to-Peer (P2P), vote for their favorite Pokémon, chat, and see live results.

**Live Demo:** [https://synca-ai-test.vercel.app/](https://synca-ai-test.vercel.app/)

---

## 🚀 Features

- 🎮 **Host & Join** battles using PeerJS (no centralized server required)
- 🗳️ **Vote** for one of two randomly generated Pokémon
- 💬 **Chat system** for players to communicate in real-time
- 📊 **Live results dialog** showing vote breakdowns
- 🔄 **Host can regenerate Pokémon** for new battles
- 📋 **Copy Host ID** to easily share with others
- 🏆 Declares a **winner** or a tie automatically once all players have voted

---

## 🛠️ Tech Stack

- **React + TypeScript**
- **Chakra UI** – UI components & styling
- **PeerJS** – Peer-to-Peer connections
- **PokéAPI** – Pokémon data fetching

---

## 📦 Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/your-username/pokemon-battle-royale.git
cd pokemon-battle-royale
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## 🎮 How to Play

### 1. Host a Game

- Click **"Become Host"**
- Share your **Host ID** with friends
- Wait for peers to connect

### 2. Join a Game

- Enter the **Host ID** in the "Connect to Host ID" field
- Click **Connect**

### 3. Battle Flow

1. Two random Pokémon are displayed
2. Each player votes once
3. When all players have voted:

   - The winner (or tie) is declared
   - Results can be viewed in detail

4. The host can click **New Battle** to restart with new Pokémon

---

## 📂 Project Structure

```
src/
 ├── components/
 │    ├── PokeDash.tsx       # Main dashboard
 │    ├── PokeCard.tsx       # Pokémon card display
 │    ├── Chat.tsx           # Chat box
 │    ├── StatsDialog.tsx    # Results modal
 │    └── styles.ts          # Chakra style configs
 ├── helpers/
 │    └── helper.ts          # fetchPokemon function
 ├── types/
 │    └── pokemon.ts         # Type definitions
 ├── App.css
 └── main.tsx
```

---

## ⚡ Roadmap

- ✅ Basic host/peer connection & voting
- ✅ Live chat system
- ✅ Results modal with winner
- 🔲 Support more than 2 Pokémon per round
- 🔲 Persist history of battles
- 🔲 Leaderboards
