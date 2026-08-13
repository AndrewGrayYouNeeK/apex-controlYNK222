# YOUNEEK APEX CONTROL

Air Traffic Control simulator built with React and Vite. Guide aircraft to safe landings, manage departures, handle emergencies, and climb the career ladder from Ground Observer to Apex Controller.

## Features

- **Radar scope** with live aircraft tracking, conflict alerts, and weather
- **Voice commands** via Web Speech API (Chrome recommended) plus text command fallback
- **Tutorial mode** with step-by-step guided training at Wittman Regional (KOSH)
- **Career mode** with ranked missions, XP progression, and unlockable challenges
- **Emergency drills** for worst-case scenario practice
- **Procedural audio** — synthesized SFX and ambient music, no external audio files

## Getting Started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## How to Play

1. Choose **Free Play**, **Career Mode**, or **Emergency Drills** from the main menu.
2. Select an airport and difficulty level.
3. **Select** an aircraft on the radar or flight strip panel.
4. Issue commands by voice (mic button or Space) or text:
   - `turn left heading 270`
   - `descend and maintain 3000`
   - `cleared ILS approach`
5. Keep aircraft separated — flashing conflict lines mean danger.
6. Handle emergencies first. Three critical separation losses ends your shift.

## Tech Stack

- React 18 + Vite 6
- Tailwind CSS + Radix UI
- Framer Motion
- Web Audio API (procedural sound)
- Web Speech API (voice recognition + TTS readbacks)

## Career Progress

XP is earned from safe landings, departures, and completed career missions. Progress is saved to `localStorage` under the key `atc_career`.
