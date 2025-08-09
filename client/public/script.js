// Pixel Glider - Mobile-Optimized Flappy Bird Clone
// Complete game implementation with touch controls and responsive design

class PixelGlider {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game states
        this.GAME_STATES = {
            LOADING: 'loading',
            START_SCREEN: 'start_screen',
            INSTRUCTIONS: 'instructions',
            WAITING_TO_START: 'waiting_to_start',
            PLAYING: 'playing',
            GAME_OVER: 'game_over',
            PAUSED: 'paused'
        };
        
        this.gameState = this.GAME_STATES.LOADING;
        
        // Game configuration
        this.config = {
            gravity: 0.3,           // How fast bird falls down (higher = falls faster)
            jumpPower: -5,          // How high bird jumps (more negative = higher jump)
            pipeSpeed: 2,           // How fast pipes move left (higher = faster game)
            pipeGap: 220,           // Space between top and bottom pipes (higher = easier)
            pipeWidth: 80,
            birdSize: 30,
            groundHeight: 80,
            maxPipes: 4,
            difficultyIncrement: 0.05, // How much faster pipes get per score
            maxSpeed: 4             // Maximum pipe speed
        };
        
        // Game objects
        this.bird = null;
        this.pipes = [];
        this.particles = [];
        this.clouds = [];
        
        // Game state variables
        this.score = 0;
        this.lastScore = 0;       // Previous game score
        this.highScore = this.loadHighScore();
        this.lives = 3;           // Player starts with 3 lives
        this.maxLives = 3;        // Maximum lives possible
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        
        // Audio system
        this.sounds = {
            jump: null,
            score: null,
            collision: null
        };
        this.soundEnabled = false;
        
        // Input handling
        this.inputCooldown = 0;
        this.touchStartY = 0;
        
        // Performance tracking
        this.fps = 60;
        this.fpsCounter = 0;
        this.lastSecond = 0;
        
        // AI Adaptive Difficulty System
        this.adaptiveDifficulty = {
            enabled: true,
            playerStats: {
                totalAttempts: 0,
                totalDeaths: 0,
                averageScore: 0,
                reactionTimes: [],
                survivalTimes: [],
                lastGameStartTime: 0,
                consecutiveFailures: 0,
                skillLevel: 0.5, // 0 = beginner, 1 = expert
                improvementRate: 0
            },
            baseConfig: {
                gravity: 0.3,
                jumpPower: -5,
                pipeSpeed: 2,
                pipeGap: 220
            },
            adjustmentFactors: {
                gravity: { min: 0.2, max: 0.4 },
                jumpPower: { min: -6, max: -4 },
                pipeSpeed: { min: 1.5, max: 2.8 },
                pipeGap: { min: 180, max: 260 }
            },
            analysisHistory: [],
            lastAdjustment: 0,
            adjustmentCooldown: 3000 // 3 seconds between adjustments
        };
        
        this.init();
    }
    
    clearGameData() {
        // Clear all game data for testing
        localStorage.removeItem('pixelGliderHighScore');
        localStorage.removeItem('pixelGliderLastScore');
        this.highScore = 0;
        this.lastScore = 0;
        this.adaptiveDifficulty.playerStats = {
            totalAttempts: 0,
            totalDeaths: 0,
            averageScore: 0,
            reactionTimes: [],
            survivalTimes: [],
            lastGameStartTime: 0,
            consecutiveFailures: 0,
            skillLevel: 0.5,
            improvementRate: 0,
            recentScores: [],
            recentAverageScore: 0
        };
        console.log('Game data cleared - starting fresh as new player');
    }
    
    init() {
        this.setupCanvas();
        this.setupUI();
        this.setupAudio();
        this.setupInput();
        this.initializeGameObjects();
        this.startGameLoop();
        
        // Hide loading screen and show start screen
        setTimeout(() => {
            this.hideLoading();
            this.showStartScreen();
        }, 1000);
    }
    
    setupCanvas() {
        // Set up responsive canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resizeCanvas(), 500);
        });
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate optimal canvas size maintaining 4:3 aspect ratio
        const targetRatio = 4 / 3;
        let canvasWidth = containerWidth;
        let canvasHeight = containerHeight;
        
        if (canvasWidth / canvasHeight > targetRatio) {
            canvasWidth = canvasHeight * targetRatio;
        } else {
            canvasHeight = canvasWidth / targetRatio;
        }
        
        // Set display size
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        
        // Set internal resolution for crisp graphics
        const scale = window.devicePixelRatio || 1;
        this.canvas.width = 800 * scale;
        this.canvas.height = 600 * scale;
        
        // Scale context to handle high DPI displays
        this.ctx.scale(scale, scale);
        
        // Store scaling factors for coordinate conversion
        this.scaleX = 800 / canvasWidth;
        this.scaleY = 600 / canvasHeight;
        
        console.log('Canvas resized:', { width: canvasWidth, height: canvasHeight, scale });
    }
    
    setupUI() {
        // Start button (now shows instructions)
        document.getElementById('startButton').addEventListener('click', () => {
            this.showInstructions();
        });
        
        // Play button (starts the actual game)
        document.getElementById('playButton').addEventListener('click', () => {
            this.startGame();
        });
        
        // Restart button
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Menu button
        document.getElementById('menuButton').addEventListener('click', () => {
            this.showStartScreen();
        });
        
        // Pause button
        document.getElementById('pauseButton').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
        
        // Update high score display
        document.getElementById('highScoreDisplay').textContent = this.highScore;
    }
    
    setupAudio() {
        // Audio will be enabled when user first interacts
        // For now, just set up the toggle button
        this.updateSoundToggle();
    }
    
    enableAudio() {
        if (this.soundEnabled) return;
        
        try {
            // Create simple sound effects using Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.soundEnabled = true;
            this.updateSoundToggle();
            console.log('Audio enabled');
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }
    
    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            switch (type) {
                case 'jump':
                    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.1);
                    break;
                    
                case 'score':
                    oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.2);
                    break;
                    
                case 'collision':
                    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                    break;
            }
        } catch (error) {
            console.log('Sound playback error:', error);
        }
    }
    
    toggleSound() {
        if (!this.soundEnabled) {
            this.enableAudio();
        } else {
            this.soundEnabled = false;
            if (this.audioContext) {
                this.audioContext.close();
                this.audioContext = null;
            }
        }
        this.updateSoundToggle();
    }
    
    updateSoundToggle() {
        const toggle = document.getElementById('soundToggle');
        toggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        toggle.classList.toggle('muted', !this.soundEnabled);
    }
    
    setupInput() {
        // Mouse input
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        // Touch input
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchStartY = e.touches[0].clientY;
            this.handleInput();
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleInput();
            }
            if (e.code === 'Escape') {
                e.preventDefault();
                this.togglePause();
            }
            // Secret key combination to clear data for testing (Ctrl+Shift+C)
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
                e.preventDefault();
                this.clearGameData();
                location.reload(); // Refresh to apply changes
            }
        });
        
        // Prevent default touch behaviors
        document.addEventListener('touchstart', (e) => {
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    handleInput() {
        if (this.inputCooldown > 0) return;
        
        // Enable audio on first interaction
        if (!this.soundEnabled) {
            this.enableAudio();
        }
        
        switch (this.gameState) {
            case this.GAME_STATES.START_SCREEN:
                this.showInstructions();
                break;
                
            case this.GAME_STATES.INSTRUCTIONS:
                this.waitToStart();
                break;
                
            case this.GAME_STATES.WAITING_TO_START:
                this.startGame();
                break;
                
            case this.GAME_STATES.PLAYING:
                this.bird.jump();
                this.playSound('jump');
                this.inputCooldown = 10; // Prevent multiple jumps
                break;
                
            case this.GAME_STATES.GAME_OVER:
                this.restartGame();
                break;
                
            case this.GAME_STATES.PAUSED:
                this.togglePause();
                break;
        }
    }
    
    initializeGameObjects() {
        // Initialize bird higher up for safer starting position
        this.bird = new Bird(150, 200);
        
        // Initialize background elements
        this.generateClouds();
        
        console.log('Game objects initialized');
    }
    
    generateClouds() {
        this.clouds = [];
        for (let i = 0; i < 6; i++) {
            this.clouds.push({
                x: Math.random() * 1000,
                y: Math.random() * 200 + 50,
                size: Math.random() * 40 + 20,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    waitToStart() {
        this.gameState = this.GAME_STATES.WAITING_TO_START;
        
        // Reset game objects but don't start moving yet
        this.bird.reset(150, 200);
        this.pipes = [];
        this.particles = [];
        this.lives = this.maxLives; // Reset lives to full
        
        // Generate initial pipes but they won't move yet
        this.generatePipe();
        
        // Update UI to show game is ready but waiting
        this.hideAllScreens();
        document.getElementById('gameUI').classList.remove('hidden');
        document.getElementById('currentScore').textContent = '0';
        
        console.log('Game ready - press space or touch to start');
    }
    
    startGame() {
        this.gameState = this.GAME_STATES.PLAYING;
        this.score = 0;
        this.frameCount = 0;
        // Lives should already be set from waitToStart, but ensure it's correct
        if (this.lives <= 0) {
            this.lives = this.maxLives;
        }
        
        // AI: Record game start for performance analysis
        this.recordGameStart();
        
        // Reset game objects
        this.bird.reset(150, 200);
        this.pipes = [];
        this.particles = [];
        
        // Generate initial pipes
        this.generatePipe();
        
        // Update UI
        this.hideAllScreens();
        document.getElementById('gameUI').classList.remove('hidden');
        document.getElementById('currentScore').textContent = '0';
        
        console.log('Game started');
    }
    
    restartGame() {
        this.startGame();
    }
    
    togglePause() {
        if (this.gameState === this.GAME_STATES.PLAYING) {
            this.gameState = this.GAME_STATES.PAUSED;
            document.getElementById('pauseButton').textContent = '▶️';
            this.canvas.classList.add('paused');
        } else if (this.gameState === this.GAME_STATES.PAUSED) {
            this.gameState = this.GAME_STATES.PLAYING;
            document.getElementById('pauseButton').textContent = '⏸️';
            this.canvas.classList.remove('paused');
        }
    }
    
    generatePipe() {
        if (this.pipes.length >= this.config.maxPipes) return;
        
        const gapY = Math.random() * (600 - this.config.pipeGap - this.config.groundHeight - 100) + 100;
        const currentSpeed = Math.min(this.config.pipeSpeed + (this.score * this.config.difficultyIncrement), this.config.maxSpeed);
        
        // Start first pipe further away to give player time to adjust
        const startX = this.pipes.length === 0 ? 950 : 850;
        this.pipes.push(new Pipe(startX, gapY, currentSpeed));
    }
    
    checkCollisions() {
        // Skip collision detection if bird is invincible
        if (this.bird.invincible) {
            return false;
        }
        
        // Check ground collision
        if (this.bird.y + this.bird.size >= 600 - this.config.groundHeight) {
            return true;
        }
        
        // Check ceiling collision
        if (this.bird.y <= 0) {
            return true;
        }
        
        // Check pipe collisions
        for (let pipe of this.pipes) {
            if (this.bird.x + this.bird.size > pipe.x && 
                this.bird.x < pipe.x + this.config.pipeWidth) {
                
                if (this.bird.y < pipe.gapY || 
                    this.bird.y + this.bird.size > pipe.gapY + this.config.pipeGap) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    updateScore() {
        for (let pipe of this.pipes) {
            if (!pipe.scored && pipe.x + this.config.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                document.getElementById('currentScore').textContent = this.score;
                this.playSound('score');
                
                // Create score particles
                this.createScoreParticles();
                
                // Check for new high score
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    this.saveHighScore();
                }
                
                console.log('Score:', this.score);
            }
        }
    }
    
    createScoreParticles() {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.bird.x,
                y: this.bird.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                color: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`
            });
        }
    }
    
    createCollisionParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.bird.x + this.bird.size / 2,
                y: this.bird.y + this.bird.size / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 60,
                maxLife: 60,
                color: '#FF6B6B'
            });
        }
    }
    
    gameOver() {
        this.gameState = this.GAME_STATES.GAME_OVER;
        this.playSound('collision');
        this.createCollisionParticles();
        
        // Store previous AI mode before recording game end
        const oldStats = {...this.adaptiveDifficulty.playerStats};
        const oldModeInfo = this.getDifficultyModeInfo();
        
        // AI: Record game end for performance analysis (this updates the AI mode)
        this.recordGameEnd();
        
        // Get new AI mode after recording this game
        const newModeInfo = this.getDifficultyModeInfo();
        
        // Check for new high score
        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        // Update game over screen with detailed score breakdown
        this.updateGameOverDisplay(oldModeInfo, newModeInfo, isNewRecord);
        
        // Update last score for next game and save
        this.lastScore = this.score;
        this.saveHighScore(); // Save both high score and last score
        
        // Show game over screen
        document.getElementById('gameUI').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.remove('hidden');
        
        console.log('Game Over. Final Score:', this.score);
    }
    
    updateGameOverDisplay(oldModeInfo, newModeInfo, isNewRecord) {
        // Current score and its AI mode
        document.getElementById('finalScore').textContent = this.score;
        const currentModeEl = document.getElementById('currentAiMode');
        const currentMode = this.getModeForScore(this.score);
        currentModeEl.textContent = currentMode.text;
        currentModeEl.style.color = currentMode.color;
        
        // Best score and its AI mode
        document.getElementById('newHighScore').textContent = this.highScore;
        const bestModeEl = document.getElementById('bestAiMode');
        const bestMode = this.getModeForScore(this.highScore);
        bestModeEl.textContent = bestMode.text;
        bestModeEl.style.color = bestMode.color;
        
        // Previous score and its AI mode (only show if we have a previous score)
        const lastScoreItem = document.getElementById('lastScoreItem');
        if (this.lastScore > 0) {
            lastScoreItem.classList.remove('hidden');
            document.getElementById('lastScore').textContent = this.lastScore;
            const lastModeEl = document.getElementById('lastAiMode');
            const lastMode = this.getModeForScore(this.lastScore);
            lastModeEl.textContent = lastMode.text;
            lastModeEl.style.color = lastMode.color;
        } else {
            lastScoreItem.classList.add('hidden');
        }
        
        // New record badge
        document.getElementById('newRecordBadge').classList.toggle('hidden', !isNewRecord);
        
        // AI progression message (if mode changed)
        const progressionEl = document.getElementById('aiProgression');
        const progressionTextEl = document.getElementById('progressionText');
        
        if (oldModeInfo.text !== newModeInfo.text) {
            const oldModeName = oldModeInfo.text.split(' ')[0]; // Get just the mode name (before space)
            const newModeName = newModeInfo.text.split(' ')[0]; // Get just the mode name (before space)
            
            progressionTextEl.textContent = `Level Up: ${oldModeName} → ${newModeName}`;
            progressionTextEl.style.color = newModeInfo.color;
            progressionEl.classList.remove('hidden');
        } else {
            progressionEl.classList.add('hidden');
        }
    }
    
    loseLife() {
        this.lives--;
        this.playSound('collision');
        this.createCollisionParticles();
        
        console.log('Life lost! Lives remaining:', this.lives);
        
        if (this.lives <= 0) {
            // No more lives, game over
            this.gameOver();
        } else {
            // Still have lives, respawn bird
            this.respawnBird();
        }
    }
    
    respawnBird() {
        // Reset bird position and velocity
        this.bird.reset(150, 200);
        
        // Brief invincibility period
        this.bird.invincible = true;
        this.bird.invincibilityTime = 120; // 2 seconds at 60fps
        
        // Add some visual feedback for respawn
        this.createRespawnParticles();
        
        console.log('Bird respawned with invincibility');
    }
    
    createRespawnParticles() {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.bird.x + this.bird.size / 2,
                y: this.bird.y + this.bird.size / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 40,
                maxLife: 40,
                color: '#00FF00' // Green for respawn
            });
        }
    }
    
    update(deltaTime) {
        // Update input cooldown
        if (this.inputCooldown > 0) {
            this.inputCooldown--;
        }
        
        // Handle different game states
        if (this.gameState === this.GAME_STATES.WAITING_TO_START) {
            // In waiting state, only update clouds and particles for visual effect
            // Bird stays frozen, pipes don't move
            this.updateClouds();
            this.updateParticles();
            return;
        }
        
        if (this.gameState !== this.GAME_STATES.PLAYING) return;
        
        // Update bird
        this.bird.update(deltaTime);
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].update(deltaTime);
            
            // Remove pipes that are off-screen
            if (this.pipes[i].x + this.config.pipeWidth < -50) {
                this.pipes.splice(i, 1);
            }
        }
        
        // Generate new pipes
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < 550) {
            this.generatePipe();
        }
        
        // Update particles
        this.updateParticles();
        
        // Update clouds
        this.updateClouds();
        
        // Check collisions
        if (this.checkCollisions()) {
            this.loseLife();
            return;
        }
        
        // Update score
        this.updateScore();
        
        this.frameCount++;
    }
    
    updateClouds() {
        for (let cloud of this.clouds) {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.size < 0) {
                cloud.x = 850;
                cloud.y = Math.random() * 200 + 50;
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.3; // Gravity
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#98FB98');
        gradient.addColorStop(1, '#90EE90');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 800, 600);
        
        // Render clouds
        this.renderClouds();
        
        // Render pipes
        for (let pipe of this.pipes) {
            pipe.render(this.ctx);
        }
        
        // Render ground
        this.renderGround();
        
        // Render bird
        this.bird.render(this.ctx);
        
        // Render particles
        this.renderParticles();
        
        // Render hearts (lives) in playing and waiting states
        if (this.gameState === this.GAME_STATES.PLAYING || this.gameState === this.GAME_STATES.WAITING_TO_START) {
            this.renderHearts();
        }
        
        // Render waiting message
        if (this.gameState === this.GAME_STATES.WAITING_TO_START) {
            this.renderWaitingMessage();
        }
        
        // Render debug info if needed
        if (this.gameState === this.GAME_STATES.PLAYING) {
            this.renderDebugInfo();
        }
    }
    
    renderClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (let cloud of this.clouds) {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.3, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.6, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    renderGround() {
        // Ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 600 - this.config.groundHeight, 800, this.config.groundHeight);
        
        // Grass texture
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 600 - this.config.groundHeight, 800, 20);
        
        // Ground details
        this.ctx.fillStyle = '#654321';
        for (let x = 0; x < 800; x += 40) {
            this.ctx.fillRect(x, 600 - this.config.groundHeight + 20, 20, 10);
        }
    }
    
    renderParticles() {
        for (let particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    renderHearts() {
        const heartSize = 25;
        const startX = 20;
        const startY = 20;
        const spacing = 35;
        
        for (let i = 0; i < this.maxLives; i++) {
            const x = startX + (i * spacing);
            const y = startY;
            
            if (i < this.lives) {
                // Filled heart for remaining lives
                this.ctx.fillStyle = '#FF69B4';
                this.ctx.font = `${heartSize}px Arial`;
                this.ctx.fillText('❤️', x, y + heartSize);
            } else {
                // Empty heart for lost lives
                this.ctx.fillStyle = '#666666';
                this.ctx.font = `${heartSize}px Arial`;
                this.ctx.fillText('🤍', x, y + heartSize);
            }
        }
    }
    
    renderWaitingMessage() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(0, 0, 800, 600);
        
        // Main message
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Press SPACE or Touch to Start!', 400, 280);
        
        // Smaller instruction
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Get ready to guide the bird through the pipes', 400, 320);
        
        // Animated indicator
        const pulseAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
        this.ctx.save();
        this.ctx.globalAlpha = pulseAlpha;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('▶ TAP TO PLAY ◀', 400, 380);
        this.ctx.restore();
        
        this.ctx.textAlign = 'left'; // Reset text alignment
    }
    
    renderDebugInfo() {
        // Only show in development
        if (false) { // Set to true for debugging
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(10, 10, 200, 100);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(`FPS: ${this.fps}`, 20, 30);
            this.ctx.fillText(`Pipes: ${this.pipes.length}`, 20, 50);
            this.ctx.fillText(`Particles: ${this.particles.length}`, 20, 70);
            this.ctx.fillText(`Bird Y: ${Math.round(this.bird.y)}`, 20, 90);
        }
    }
    
    startGameLoop() {
        const gameLoop = (currentTime) => {
            // Calculate delta time
            this.deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            // Update FPS counter
            this.fpsCounter++;
            if (currentTime - this.lastSecond >= 1000) {
                this.fps = this.fpsCounter;
                this.fpsCounter = 0;
                this.lastSecond = currentTime;
            }
            
            // Update and render
            this.update(this.deltaTime);
            this.render();
            
            // Continue loop
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
        console.log('Game loop started');
    }
    
    // UI Helper Methods
    hideLoading() {
        document.getElementById('loadingScreen').classList.add('hidden');
    }
    
    showStartScreen() {
        this.gameState = this.GAME_STATES.START_SCREEN;
        this.hideAllScreens();
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('highScoreDisplay').textContent = this.highScore;
    }
    
    hideAllScreens() {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('instructionsScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('gameUI').classList.add('hidden');
    }
    
    showInstructions() {
        this.gameState = this.GAME_STATES.INSTRUCTIONS;
        this.hideAllScreens();
        document.getElementById('instructionsScreen').classList.remove('hidden');
        console.log('Instructions shown');
    }
    
    showCongratsMessage() {
        // Create temporary congratulations message
        const congratsEl = document.createElement('div');
        congratsEl.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #4CAF50, #8BC34A);
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-family: 'Press Start 2P', monospace;
            font-size: clamp(0.8rem, 3vw, 1rem);
            text-shadow: 2px 2px 0px #333;
            z-index: 1000;
            animation: bounceIn 0.6s ease;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        `;
        congratsEl.innerHTML = '🎉 Game Started! Good Luck! 🍀';
        
        document.body.appendChild(congratsEl);
        
        // Remove after 2 seconds
        setTimeout(() => {
            if (congratsEl.parentNode) {
                congratsEl.parentNode.removeChild(congratsEl);
            }
        }, 2000);
    }
    
    // Storage Methods
    loadHighScore() {
        try {
            const highScore = parseInt(localStorage.getItem('pixelGliderHighScore')) || 0;
            this.lastScore = parseInt(localStorage.getItem('pixelGliderLastScore')) || 0;
            return highScore;
        } catch (error) {
            console.log('Could not load high score:', error);
            return 0;
        }
    }
    
    saveHighScore() {
        try {
            localStorage.setItem('pixelGliderHighScore', this.highScore.toString());
            localStorage.setItem('pixelGliderLastScore', this.lastScore.toString());
            console.log('Scores saved - High:', this.highScore, 'Last:', this.lastScore);
        } catch (error) {
            console.log('Could not save scores:', error);
        }
    }
    
    // AI Adaptive Difficulty Methods
    analyzePlayerPerformance() {
        if (!this.adaptiveDifficulty.enabled) return;
        
        const stats = this.adaptiveDifficulty.playerStats;
        const currentTime = Date.now();
        
        // Record survival time
        if (stats.lastGameStartTime > 0) {
            const survivalTime = currentTime - stats.lastGameStartTime;
            stats.survivalTimes.push(survivalTime);
            
            // Keep only last 10 survival times
            if (stats.survivalTimes.length > 10) {
                stats.survivalTimes.shift();
            }
        }
        
        // Calculate average survival time
        const avgSurvival = stats.survivalTimes.length > 0 
            ? stats.survivalTimes.reduce((a, b) => a + b) / stats.survivalTimes.length 
            : 0;
        
        // Update skill level based on recent performance (last 3 games)
        stats.recentScores = stats.recentScores || [];
        stats.recentScores.push(this.score);
        
        // Keep only last 3 scores for recent performance
        if (stats.recentScores.length > 3) {
            stats.recentScores.shift();
        }
        
        // Calculate recent average score
        const recentAvg = stats.recentScores.reduce((a, b) => a + b, 0) / stats.recentScores.length;
        
        // Map recent average to skill level (0-1 scale)
        // Beginner: 0-15, Easy: 15-35, Normal: 35-45, Hard: 45-65, Expert: 65-70, Ace: 70-100, Master: 100+
        let skillLevel = 0;
        if (recentAvg >= 100) {
            skillLevel = 1.0;      // Master
        } else if (recentAvg >= 70) {
            skillLevel = 0.9;      // Ace
        } else if (recentAvg >= 65) {
            skillLevel = 0.8;      // Expert
        } else if (recentAvg >= 45) {
            skillLevel = 0.7;      // Hard
        } else if (recentAvg >= 35) {
            skillLevel = 0.5;      // Normal
        } else if (recentAvg >= 15) {
            skillLevel = 0.3;      // Easy
        } else {
            skillLevel = 0.1;      // Beginner
        }
        
        stats.skillLevel = skillLevel;
        stats.recentAverageScore = recentAvg;
        
        // Track consecutive failures
        const survivalTime = stats.lastGameStartTime > 0 ? currentTime - stats.lastGameStartTime : 0;
        if (this.score === 0 && survivalTime < 3000) {
            stats.consecutiveFailures++;
        } else if (this.score > 0) {
            stats.consecutiveFailures = 0;
        }
        
        // Calculate improvement rate
        if (stats.survivalTimes.length >= 6) {
            const recent = stats.survivalTimes.slice(-3);
            const older = stats.survivalTimes.slice(0, -3);
            
            if (recent.length > 0 && older.length > 0) {
                const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
                const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
                stats.improvementRate = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
            }
        }
        
        // Store analysis
        this.adaptiveDifficulty.analysisHistory.push({
            timestamp: currentTime,
            score: this.score,
            survivalTime: avgSurvival,
            skillLevel: stats.skillLevel,
            consecutiveFailures: stats.consecutiveFailures
        });
        
        // Keep only last 20 analyses
        if (this.adaptiveDifficulty.analysisHistory.length > 20) {
            this.adaptiveDifficulty.analysisHistory.shift();
        }
        
        console.log('AI Analysis:', {
            recentAverageScore: stats.recentAverageScore?.toFixed(1) || '0.0',
            skillLevel: stats.skillLevel.toFixed(2),
            consecutiveFailures: stats.consecutiveFailures,
            improvementRate: (stats.improvementRate * 100).toFixed(1) + '%',
            recentScores: stats.recentScores || []
        });
    }
    
    adjustDifficulty() {
        if (!this.adaptiveDifficulty.enabled) return;
        
        const currentTime = Date.now();
        if (currentTime - this.adaptiveDifficulty.lastAdjustment < this.adaptiveDifficulty.adjustmentCooldown) {
            return; // Too soon to adjust again
        }
        
        const stats = this.adaptiveDifficulty.playerStats;
        const factors = this.adaptiveDifficulty.adjustmentFactors;
        const base = this.adaptiveDifficulty.baseConfig;
        
        // Determine difficulty multiplier based on skill level and performance
        let difficultyMultiplier = 1.0;
        
        // Adjust based on skill level (recent score performance)
        if (stats.skillLevel <= 0.1) {
            // Beginner (0-15 avg): Make it much easier
            difficultyMultiplier = 0.6;
            console.log('AI: Making game much easier for beginner player');
        } else if (stats.skillLevel <= 0.3) {
            // Easy (15-35 avg): Make it easier
            difficultyMultiplier = 0.8;
            console.log('AI: Making game easier for developing player');
        } else if (stats.skillLevel <= 0.5) {
            // Normal (35-45 avg): Balanced difficulty
            difficultyMultiplier = 1.0;
            console.log('AI: Balanced difficulty for normal player');
        } else if (stats.skillLevel <= 0.7) {
            // Hard (45-65 avg): Make it harder
            difficultyMultiplier = 1.2;
            console.log('AI: Making game harder for skilled player');
        } else if (stats.skillLevel <= 0.8) {
            // Expert (65-70 avg): Make it much harder
            difficultyMultiplier = 1.4;
            console.log('AI: Making game much harder for expert player');
        } else if (stats.skillLevel <= 0.9) {
            // Ace (70-100 avg): Maximum challenge
            difficultyMultiplier = 1.6;
            console.log('AI: Maximum challenge for ace player');
        } else {
            // Master (100+ avg): Extreme challenge
            difficultyMultiplier = 1.8;
            console.log('AI: Extreme challenge for master player');
        }
        
        // Emergency adjustments for struggling players
        if (stats.consecutiveFailures >= 5) {
            difficultyMultiplier *= 0.6;
            console.log('AI: Emergency difficulty reduction - player struggling');
        }
        
        // Positive reinforcement for improving players
        if (stats.improvementRate > 0.2) {
            difficultyMultiplier *= 1.1;
            console.log('AI: Slight difficulty increase - player improving');
        }
        
        // Apply adjustments
        const newGravity = this.interpolate(base.gravity, difficultyMultiplier, factors.gravity);
        const newJumpPower = this.interpolate(base.jumpPower, 1 / difficultyMultiplier, factors.jumpPower);
        const newPipeSpeed = this.interpolate(base.pipeSpeed, difficultyMultiplier, factors.pipeSpeed);
        const newPipeGap = this.interpolate(base.pipeGap, 1 / difficultyMultiplier, factors.pipeGap);
        
        // Only apply if there's a meaningful change
        const threshold = 0.05;
        if (Math.abs(this.config.gravity - newGravity) > threshold ||
            Math.abs(this.config.jumpPower - newJumpPower) > threshold ||
            Math.abs(this.config.pipeSpeed - newPipeSpeed) > threshold ||
            Math.abs(this.config.pipeGap - newPipeGap) > threshold) {
            
            this.config.gravity = newGravity;
            this.config.jumpPower = newJumpPower;
            this.config.pipeSpeed = newPipeSpeed;
            this.config.pipeGap = newPipeGap;
            
            this.adaptiveDifficulty.lastAdjustment = currentTime;
            
            console.log('AI Difficulty Adjusted:', {
                gravity: newGravity.toFixed(2),
                jumpPower: newJumpPower.toFixed(2),
                pipeSpeed: newPipeSpeed.toFixed(2),
                pipeGap: Math.round(newPipeGap),
                skillLevel: stats.skillLevel.toFixed(2)
            });
        }
    }
    
    interpolate(baseValue, multiplier, range) {
        // Interpolate between min and max based on multiplier
        const target = baseValue * multiplier;
        return Math.max(range.min, Math.min(range.max, target));
    }
    
    recordGameStart() {
        if (!this.adaptiveDifficulty.enabled) return;
        
        this.adaptiveDifficulty.playerStats.totalAttempts++;
        this.adaptiveDifficulty.playerStats.lastGameStartTime = Date.now();
        
        // Adjust difficulty before game starts (but not on first game)
        if (this.adaptiveDifficulty.playerStats.totalAttempts > 1) {
            this.adjustDifficulty();
        }
    }
    
    recordGameEnd() {
        if (!this.adaptiveDifficulty.enabled) return;
        
        this.adaptiveDifficulty.playerStats.totalDeaths++;
        this.analyzePlayerPerformance();
        
        // Update average score
        const totalGames = this.adaptiveDifficulty.playerStats.totalAttempts;
        const currentAvg = this.adaptiveDifficulty.playerStats.averageScore;
        this.adaptiveDifficulty.playerStats.averageScore = 
            ((currentAvg * (totalGames - 1)) + this.score) / totalGames;
    }
    
    getDifficultyModeInfo() {
        if (!this.adaptiveDifficulty.enabled) return { text: 'AI: Disabled', color: '#999999' };
        
        const stats = this.adaptiveDifficulty.playerStats;
        const recentAvg = stats.recentAverageScore || 0;
        
        return this.getModeForScore(recentAvg);
    }
    
    getModeForScore(score) {
        if (score >= 100) {
            return { text: 'Master 100+', color: '#8B0000' };
        } else if (score >= 70) {
            return { text: 'Ace 70-100', color: '#FF1493' };
        } else if (score >= 65) {
            return { text: 'Expert 65-70', color: '#F44336' };
        } else if (score >= 45) {
            return { text: 'Hard 45-65', color: '#FF9800' };
        } else if (score >= 35) {
            return { text: 'Normal 35-45', color: '#FFC107' };
        } else if (score >= 15) {
            return { text: 'Easy 15-35', color: '#8BC34A' };
        } else {
            return { text: 'Beginner 0-15', color: '#4CAF50' };
        }
    }
}

// Bird Class
class Bird {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.velocity = 0;
        this.rotation = 0;
        this.animationFrame = 0;
        
        // Invincibility system
        this.invincible = false;
        this.invincibilityTime = 0;
        
        // Physics constants
        this.gravity = 0.3;        // How fast bird falls (match main config)
        this.jumpPower = -5;       // How high bird jumps (match main config)
        this.maxVelocity = 6;      // Maximum falling/rising speed (higher = bird moves faster up/down)
        this.rotationSpeed = 0.1;  // How much bird tilts based on movement
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.rotation = 0;
        this.animationFrame = 0;
        this.invincible = false;
        this.invincibilityTime = 0;
    }
    
    jump() {
        this.velocity = this.jumpPower;
    }
    
    update(deltaTime) {
        // Handle invincibility timer
        if (this.invincible && this.invincibilityTime > 0) {
            this.invincibilityTime--;
            if (this.invincibilityTime <= 0) {
                this.invincible = false;
            }
        }
        
        // Apply gravity
        this.velocity += this.gravity;
        
        // Limit velocity
        if (this.velocity > this.maxVelocity) {
            this.velocity = this.maxVelocity;
        }
        
        // Update position
        this.y += this.velocity;
        
        // Update rotation based on velocity
        this.rotation = Math.max(-0.5, Math.min(0.5, this.velocity * 0.1));
        
        // Update animation
        this.animationFrame += 0.3;
    }
    
    render(ctx) {
        ctx.save();
        
        // Move to bird position
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.rotation);
        
        // Invincibility visual effect (flashing)
        if (this.invincible) {
            const flashAlpha = 0.3 + 0.7 * Math.sin(this.invincibilityTime * 0.3);
            ctx.globalAlpha = flashAlpha;
        }
        
        // Bird body (main circle)
        ctx.fillStyle = this.invincible ? '#87CEEB' : '#FFD700'; // Light blue when invincible
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird outline
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Wing (animated)
        const wingOffset = Math.sin(this.animationFrame) * 3;
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.ellipse(-this.size / 4, wingOffset, this.size / 3, this.size / 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.size / 6, -this.size / 6, this.size / 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.size / 6 + 2, -this.size / 6, this.size / 16, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(this.size / 3, 0);
        ctx.lineTo(this.size / 2 + 5, -3);
        ctx.lineTo(this.size / 2 + 5, 3);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Pipe Class
class Pipe {
    constructor(x, gapY, speed) {
        this.x = x;
        this.gapY = gapY;
        this.speed = speed;
        this.scored = false;
        this.width = 80;
        this.gapHeight = 180;
    }
    
    update(deltaTime) {
        this.x -= this.speed;
    }
    
    render(ctx) {
        const pipeWidth = this.width;
        const topHeight = this.gapY;
        const bottomY = this.gapY + this.gapHeight;
        const bottomHeight = 600 - 80 - bottomY; // Account for ground
        
        // Pipe gradient
        const gradient = ctx.createLinearGradient(this.x, 0, this.x + pipeWidth, 0);
        gradient.addColorStop(0, '#32CD32');
        gradient.addColorStop(0.5, '#228B22');
        gradient.addColorStop(1, '#006400');
        
        ctx.fillStyle = gradient;
        
        // Top pipe
        if (topHeight > 0) {
            ctx.fillRect(this.x, 0, pipeWidth, topHeight);
            
            // Top pipe cap
            ctx.fillRect(this.x - 10, topHeight - 30, pipeWidth + 20, 30);
        }
        
        // Bottom pipe
        if (bottomHeight > 0) {
            ctx.fillRect(this.x, bottomY, pipeWidth, bottomHeight);
            
            // Bottom pipe cap
            ctx.fillRect(this.x - 10, bottomY, pipeWidth + 20, 30);
        }
        
        // Pipe outline
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 2;
        
        if (topHeight > 0) {
            ctx.strokeRect(this.x, 0, pipeWidth, topHeight);
            ctx.strokeRect(this.x - 10, topHeight - 30, pipeWidth + 20, 30);
        }
        
        if (bottomHeight > 0) {
            ctx.strokeRect(this.x, bottomY, pipeWidth, bottomHeight);
            ctx.strokeRect(this.x - 10, bottomY, pipeWidth + 20, 30);
        }
        
        // Pipe highlights for 3D effect
        ctx.strokeStyle = '#90EE90';
        ctx.lineWidth = 1;
        
        if (topHeight > 0) {
            ctx.beginPath();
            ctx.moveTo(this.x + 5, 0);
            ctx.lineTo(this.x + 5, topHeight);
            ctx.stroke();
        }
        
        if (bottomHeight > 0) {
            ctx.beginPath();
            ctx.moveTo(this.x + 5, bottomY);
            ctx.lineTo(this.x + 5, bottomY + bottomHeight);
            ctx.stroke();
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Pixel Glider...');
    window.game = new PixelGlider();
});

// Prevent zoom on iOS
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
});
