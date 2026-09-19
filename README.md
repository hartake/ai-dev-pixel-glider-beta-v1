# Pixel Glider

A production-ready mobile-optimized Flappy Bird clone featuring an innovative AI-driven adaptive difficulty system that personalizes the gaming experience in real-time.

## Screenshots

| Main Menu | How To Play |
| :---: | :---: |
| <a href="https://github.com/user-attachments/assets/4d403ac5-bb3a-4538-b12b-4ee2a5a3d7fa" target="_blank"><img src="https://github.com/user-attachments/assets/4d403ac5-bb3a-4538-b12b-4ee2a5a3d7fa" width="360" alt="Start Screen" /></a> | <a href="https://github.com/user-attachments/assets/bbb89dc2-7b85-498e-b08a-1decbf77cc93" target="_blank"><img src="https://github.com/user-attachments/assets/bbb89dc2-7b85-498e-b08a-1decbf77cc93" width="360" alt="Gameplay Preview" /></a> |
| **In-Game Adaptive AI Difficulty** | **Game Over / Stats** |
| <a href="https://github.com/user-attachments/assets/7b9cbf0c-d987-4257-b31b-80cb3cb09612" target="_blank"> <img src="https://github.com/user-attachments/assets/e0ce742e-9e6e-4ed2-b4bd-6750f1d90b9f" width="360" alt="Game Over Screen" /></a> | <a href="https://github.com/user-attachments/assets/e0ce742e-9e6e-4ed2-b4bd-6750f1d90b9f" target="_blank"> <img src="https://github.com/user-attachments/assets/7b9cbf0c-d987-4257-b31b-80cb3cb09612" width="360" alt="Difficulty Settings" /> </a> |

## Overview

Pixel Glider combines classic Flappy Bird gameplay with modern AI technology to create a dynamically adjusting game that responds to your skill level. The game analyzes your recent performance and automatically adjusts difficulty parameters to provide an optimal challenge that keeps you engaged without becoming frustrating.

## Key Features

- **AI Adaptive Difficulty**: Intelligent system that analyzes your last 3 games and adjusts challenge level automatically
- **Mobile-Optimized**: Responsive design that works perfectly on phones, tablets, and desktop
- **Smooth 60fps Gameplay**: High-performance HTML5 Canvas rendering
- **3-Lives System**: Heart-based life system with invincibility frames after taking damage
- **Progressive Scoring**: Real-time AI mode tracking with 7 difficulty levels
- **Touch Controls**: Intuitive tap-to-play mechanics optimized for mobile devices
- **Audio System**: Web Audio API integration with toggle controls
- **Tutorial System**: Built-in instructions for new players

## AI Difficulty Levels

The game features 7 adaptive difficulty modes based on your recent performance:

- **Beginner (0-15)**: Slower pipes, larger gaps, reduced gravity
- **Easy (15-35)**: Slightly increased challenge
- **Normal (35-45)**: Balanced gameplay
- **Hard (45-65)**: Faster pipes, smaller gaps
- **Expert (65-70)**: Advanced challenge level
- **Ace (70-100)**: Expert-level difficulty
- **Master (100+)**: Maximum challenge for skilled players

The AI analyzes your survival time, score patterns, and improvement rate to provide immediate difficulty adjustments that enhance your gaming experience.

## Tech Stack

### Frontend
- **HTML5 Canvas**: High-performance 2D rendering for smooth 60fps gameplay
- **Vanilla JavaScript**: Lightweight game engine for optimal performance
- **React 18**: Modern UI components and state management
- **Tailwind CSS**: Utility-first styling with mobile-first design
- **Zustand**: Lightweight state management for game phases
- **Radix UI**: Accessible component primitives

### Backend
- **Express.js**: RESTful API server with TypeScript
- **PostgreSQL**: Database with Neon serverless hosting
- **Drizzle ORM**: Type-safe database operations
- **TSX**: TypeScript execution for development

### Build System
- **Vite**: Modern build tool with hot module replacement
- **ESBuild**: Production server bundling
- **TypeScript**: Full type safety across the stack

## How to Play

### Basic Controls
- **Desktop**: Press Spacebar or Up Arrow to make the bird jump
- **Mobile**: Tap anywhere on the screen to jump
- **Pause**: Press Escape key (desktop only)

### Gameplay Instructions

1. **Start**: Click "Start Game" to view instructions, then "Play" to begin
2. **Objective**: Guide the bird through pipes without hitting them or the ground
3. **Lives**: You have 3 lives (hearts) - losing all lives ends the game
4. **Scoring**: Earn points by successfully passing through pipes
5. **AI Adaptation**: The game automatically adjusts difficulty based on your performance

### Game Mechanics

- **Jump Physics**: Each tap/press gives the bird upward momentum
- **Gravity**: Bird naturally falls when not jumping
- **Collision**: Bird loses a life when hitting pipes or ground
- **Invincibility**: Brief protective period after losing a life
- **Score Tracking**: Current score, best score, and previous score display
- **Progress Display**: Real-time AI difficulty mode shown during gameplay

### Tips for Success

- Practice consistent timing between jumps
- Watch for AI difficulty adjustments between games
- Use the 3-lives system to learn pipe patterns
- Pay attention to your recent score average for mode progression
- The game gets easier if you're struggling and harder if you're improving

## Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use provided Neon serverless)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Database Setup
The project includes Drizzle ORM configuration for PostgreSQL. Set your `DATABASE_URL` environment variable for database connection.

### Build for Production
```bash
npm run build
```

## Architecture

Pixel Glider uses a hybrid architecture combining:

- **Canvas Game Engine**: Pure JavaScript for performance-critical gameplay
- **React UI Overlay**: Modern component system for menus and interface
- **Dual Build System**: Separate client and server builds with proper module resolution
- **Mobile-First Design**: Responsive scaling and touch optimization

This approach provides the performance benefits of Canvas rendering while leveraging React's ecosystem for rich user interface components.

## Browser Compatibility

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers with touch support

## License

MIT License - feel free to use this project as a learning resource or starting point for your own games.
