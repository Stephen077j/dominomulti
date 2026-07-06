<div align="center">

# 🧮 CalcProSte

**A scientific mathematics toolkit for mobile** — an advanced calculator plus algebra, analysis,
curve plotting, geometry and statistics tools, in a neon-styled Expo app.

![Expo](https://img.shields.io/badge/Expo-Router-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![math.js](https://img.shields.io/badge/engine-math.js-orange)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## Overview

**CalcProSte** turns a phone into a pocket maths workstation. Built on **Expo Router** with a
**math.js** computation engine, it groups a scientific calculator and several specialized modules
behind a tabbed interface — designed with a distinctive neon UI, haptics and a light/dark theme.

> Built by a Mathematics Master's graduate — the feature set mirrors real coursework
> (linear algebra, analysis, statistics).

## ✨ Modules

| Tab | What it does |
|---|---|
| **Calculator** | Scientific calculator with DEG/RAD/GRAD angle modes and history |
| **Algèbre** | Quadratic equations, linear systems, matrices, complex numbers, vectors |
| **Analyse** | Function analysis |
| **Courbes** | Curve / function plotting |
| **Géométrie** | Geometry tools |
| **Stats** | Statistics |
| **Outils** | Additional math utilities |

Extras: calculation **history** (context-based), a **license** gate, angle-mode switching,
haptic feedback and an animated star-field UI.

## 🛠️ Tech stack

Expo · Expo Router · React Native · TypeScript · **math.js** · expo-haptics ·
expo-linear-gradient · expo-secure-store · expo-crypto.

## 📁 Structure

```
dominomulti/            # (app name: CalcProSte)
├── app/
│   ├── (tabs)/         # index (calculator), algebre, analyse, courbes, geo, stats, outils
│   ├── _layout.tsx
│   └── licence.tsx
├── components/         # NeonButton, StarField, SectionTab…
├── context/            # CalcHistoryContext, LicenseContext
├── hooks/              # useColors…
├── constants/
└── server/             # static landing page (serve.js)
```

## 🚀 Getting started

```bash
npm install
npm run dev        # start Expo (scan the QR code with Expo Go)
npm run typecheck  # TypeScript check
npm run build      # export
```

## 🗺️ Roadmap

- [ ] Rename the repository to `calcproste` (the current name no longer reflects the app)
- [ ] Graphing improvements (zoom / pan / multiple curves)
- [ ] Step-by-step solutions for algebra
- [ ] Unit tests for the math modules
- [ ] Publish to the app stores

## 📄 License

MIT © Joel Stephen
