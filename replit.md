# Pixel Glider - Mobile Flappy Bird Clone

## Overview

Pixel Glider is a production-ready mobile-optimized Flappy Bird clone built with HTML5 Canvas and vanilla JavaScript for the game engine, with a React-based interface overlay. The project combines a full-stack architecture with Express.js backend, PostgreSQL database support via Drizzle ORM, and a responsive frontend that adapts to both desktop and mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Hybrid Frontend Architecture
The application uses a unique dual-frontend approach:
- **Canvas Game Engine**: Pure HTML5 Canvas with vanilla JavaScript for the core Flappy Bird gameplay
- **React UI Overlay**: Modern React components with Tailwind CSS for menus, controls, and interface elements
- **Mobile-First Design**: Responsive canvas that scales to any screen size with touch-optimized controls

**Rationale**: This hybrid approach provides the performance benefits of Canvas for smooth 60fps gameplay while leveraging React's component system for rich UI elements. The separation allows the game logic to run independently of React's rendering cycle.

### Backend Architecture
- **Express.js Server**: RESTful API server with middleware for request logging and error handling
- **TypeScript**: Full type safety across frontend and backend
- **Modular Structure**: Clean separation between routes, storage, and server configuration

**Rationale**: Express provides a lightweight, flexible foundation for API development. TypeScript ensures type safety across the entire stack, reducing runtime errors and improving developer experience.

### Build System
- **Vite**: Modern build tool for fast development and optimized production builds
- **ESBuild**: Used for server-side bundling in production
- **Dual Build Process**: Separate builds for client and server with proper module resolution

## Key Components

### Game Engine (`client/script.js`)
- **PixelGlider Class**: Main game controller managing states, physics, and rendering
- **Game States**: Loading, start screen, playing, game over, and paused states
- **Physics System**: Gravity-based bird movement with collision detection
- **AI Adaptive Difficulty**: Real-time performance analysis and automatic difficulty adjustment
- **Rendering Pipeline**: 60fps canvas rendering with particle effects and animations
- **Audio System**: Web Audio API integration with sound management

### React UI System
- **Game State Management**: Zustand stores for game phase and audio control
- **UI Components**: Radix UI primitives with custom styling via Tailwind CSS
- **Interface Overlay**: Non-intrusive UI that works alongside the canvas game
- **Mobile Optimization**: Touch-friendly controls and responsive design

### Database Layer
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Schema Definition**: User management system (extensible for leaderboards)
- **Migration System**: Automated database schema management

## Data Flow

1. **Game Initialization**: Canvas game loads independently, React UI mounts as overlay
2. **State Synchronization**: Zustand stores bridge game state between Canvas and React
3. **User Input**: Touch/click events handled by Canvas, UI controls managed by React
4. **Audio Management**: React components control audio state, Canvas game respects mute settings
5. **Score Persistence**: Local storage for high scores (database ready for global leaderboards)

## External Dependencies

### Frontend Libraries
- **React Ecosystem**: React 18 with modern hooks and context
- **UI Framework**: Radix UI for accessible components, Tailwind CSS for styling
- **State Management**: Zustand for lightweight, TypeScript-friendly state management
- **Animations**: Class Variance Authority for component variants

### Backend Dependencies
- **Database**: PostgreSQL via Neon serverless with connection pooling
- **ORM**: Drizzle ORM with TypeScript integration
- **Development**: TSX for TypeScript execution, Vite plugins for enhanced DX

### Audio Support
- **Web Audio API**: Browser-native audio processing
- **Audio Assets**: Placeholder structure for game sounds (jump, score, collision)

## Deployment Strategy

### Development Environment
- **Hot Module Replacement**: Vite HMR for instant frontend updates
- **TypeScript Watching**: Real-time type checking during development
- **Runtime Error Handling**: Replit-specific error overlay for debugging

### Production Build
- **Client Build**: Vite optimizes React components and assets into `dist/public`
- **Server Build**: ESBuild bundles Express server with external package handling
- **Static Asset Serving**: Production server serves built client files
- **Environment Configuration**: DATABASE_URL required for PostgreSQL connection

### Mobile Optimization
- **Progressive Web App**: Viewport meta tags and mobile-specific CSS
- **Touch Events**: Comprehensive touch event handling with gesture prevention
- **Performance**: Battery-efficient rendering and optimized asset loading
- **Cross-Platform**: Works on iOS, Android, and desktop browsers

### Scalability Considerations
- **Database Ready**: Drizzle schema supports user management and can be extended for leaderboards
- **API Structure**: Modular route system ready for game statistics and user features  
- **State Management**: Zustand stores can easily accommodate multiplayer features
- **Asset Pipeline**: Vite configuration supports various asset types for future enhancements

The architecture prioritizes performance, mobile experience, and maintainability while providing a solid foundation for feature expansion.