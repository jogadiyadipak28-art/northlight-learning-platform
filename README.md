<div align="center">

# Northlight Atelier

### Learn by looking. Make work that makes people look twice.

An immersive learning platform for photography, film, sound, writing, and visual storytelling. Browse focused courses, practice at your own pace, and pick up right where you left off.

[![React](https://img.shields.io/badge/React-19-149eca?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)

</div>

---

## What you can do

- **Find your next course** with search, category and level filters, sorting, and course cards.
- **Explore a syllabus** and instructor details before starting a course.
- **Learn in focused lessons** with playback controls, captions, timestamped notes, and a synchronized transcript.
- **Check what you’ve learned** with interactive quizzes, instant feedback, and retakes.
- **Keep your momentum** with a progress dashboard, completion rings, a study streak calendar, and a continue learning row.
- **Celebrate milestones** with printable course certificates.
- **Keep your progress** across page reloads with browser storage.

## A quick look

Northlight pairs a calm, dark study-hall atmosphere with warm course photography, an interactive hero scene, and a portrait testimonial reel. The layout adapts for desktop and mobile screens.

## Run locally

**Requirements:** Node.js 20.19+ or 22.12+ and npm.

```bash
git clone https://github.com/jogadiyadipak28-art/northlight-learning-platform.git
cd northlight-learning-platform
npm install
npm run dev
```

Vite prints the local address after the development server starts.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |

## Built with

- React and TypeScript
- Vite
- React Router
- CSS, with responsive layouts and reduced-motion support
- Local browser storage for learner progress

## Project structure

```text
src/
├── components/   Shared player, quiz, calendar, and course UI
├── context/      Learner progress state
├── data/         Course and lesson content
├── lib/          Progress persistence and formatting helpers
└── pages/        Home, catalog, course, lesson, quiz, dashboard, certificate
```

## Scope

This project is a front-end learning experience. It does not include payment processing or video hosting. Course progress is saved in the current browser.

---

<div align="center">

Made for curious learners · **Northlight Atelier**

</div>
