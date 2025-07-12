/**
 * 音效管理器
 */
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.audioContext = null;
        this.initAudioContext();
        this.initSounds();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }
    
    async ensureAudioContext() {
        if (!this.audioContext) {
            this.initAudioContext();
        }
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (e) {
                console.warn('Failed to resume audio context:', e);
                return false;
            }
        }
        
        return this.audioContext && this.audioContext.state === 'running';
    }

    initSounds() {
        // 创建音效
        this.createSound('jump', 200, 0.1, 'square');
        this.createSound('score', 400, 0.2, 'sine');
        this.createSound('hit', 150, 0.3, 'sawtooth');
        this.createSound('whoosh', 100, 0.15, 'triangle');
        this.createSound('speedup', 600, 0.4, 'sine');
        this.createSound('coin', 1000, 0.2, 'triangle');
    }

    createSound(name, frequency, duration, type = 'sine') {
        this.sounds[name] = {
            frequency: frequency,
            duration: duration,
            type: type
        };
    }

    async playSound(name) {
        if (!this.enabled || !this.sounds[name]) return;
        
        const isReady = await this.ensureAudioContext();
        if (!isReady) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const sound = this.sounds[name];
            oscillator.frequency.value = sound.frequency;
            oscillator.type = sound.type;
            
            gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        } catch (e) {
            console.warn('Failed to play sound:', e);
            // 尝试重新初始化音频上下文
            this.initAudioContext();
        }
    }

    playJump() {
        this.playSound('jump');
    }

    playScore() {
        this.playSound('score');
    }

    playHit() {
        this.playSound('hit');
    }

    playWhoosh() {
        this.playSound('whoosh');
    }

    playSpeedUp() {
        this.playSound('speedup');
    }

    async playCoin() {
        // 播放金币音效，带有向上的音调变化
        if (!this.enabled) return;
        
        const isReady = await this.ensureAudioContext();
        if (!isReady) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (e) {
            console.warn('Failed to play coin sound:', e);
            // 尝试重新初始化音频上下文
            this.initAudioContext();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    // 激活音频上下文（用于首次用户交互）
    async activateAudio() {
        await this.ensureAudioContext();
    }
}

/**
 * Flappy Bird 游戏核心逻辑
 */

class FlappyBirdGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // 游戏状态
        this.gameState = 'start'; // start, playing, paused, gameOver
        this.score = 0;
        this.bestScore = localStorage.getItem('flappyBirdBestScore') || 0;
        
        // 游戏对象
        this.bird = new Bird(this.width / 4, this.height / 2);
        this.pipes = [];
        this.coins = [];
        this.particles = [];
        this.clouds = [];
        
        // 游戏设置
        this.gravity = 0.15;
        this.basePipeSpeed = 2;      // 基础管道速度
        this.pipeSpeed = 2;          // 当前管道速度
        this.maxPipeSpeed = 6;       // 最大管道速度(3倍速)
        this.speedIncreaseRate = 0.12; // 速度增加系数
        this.pipeGap = 200;
        this.pipeWidth = 60;
        this.pipeSpacing = 300;
        
        // 背景
        this.background = new Background(this.width, this.height);
        
        // 音效管理器
        this.soundManager = new SoundManager();
        
        // 计时器
        this.frameCount = 0;
        this.lastPipeTime = 0;
        
        // 初始化
        this.init();
    }
    
    init() {
        // 创建初始云朵
        for (let i = 0; i < 5; i++) {
            this.clouds.push(new Cloud(
                Math.random() * this.width,
                Math.random() * this.height / 2,
                Math.random() * 0.5 + 0.2
            ));
        }
        
        // 绑定输入事件
        this.bindEvents();
        
        // 开始游戏循环
        this.gameLoop();
    }
    
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', async (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                await this.handleInput();
            }
        });
        
        // 鼠标事件
        this.canvas.addEventListener('click', async () => {
            await this.handleInput();
        });
        
        // 触摸事件
        this.canvas.addEventListener('touchstart', async (e) => {
            e.preventDefault();
            await this.handleInput();
        });
    }
    
    async handleInput() {
        // 确保音频上下文已激活
        await this.soundManager.ensureAudioContext();
        
        switch (this.gameState) {
            case 'start':
                await this.startGame();
                break;
            case 'playing':
                this.bird.flap();
                this.soundManager.playJump();
                this.createFlappingParticles();
                break;
            case 'gameOver':
                this.restartGame();
                break;
        }
    }
    
    async startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.bird.reset(this.width / 4, this.height / 2);
        this.pipes = [];
        this.coins = [];
        this.particles = [];
        this.frameCount = 0;
        this.lastPipeTime = 0;
        
        // 重置游戏速度
        this.pipeSpeed = this.basePipeSpeed;
        
        // 确保音频上下文已激活并播放开始音效
        await this.soundManager.ensureAudioContext();
        this.soundManager.playWhoosh();
        
        // 隐藏开始界面，显示分数
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('scoreDisplay').classList.remove('hidden');
        
        // 重置分数显示
        document.querySelector('.score-number').textContent = '0';
        
        // 重置速度指示器显示
        document.getElementById('speedValue').textContent = '1.0';
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseScreen').classList.remove('hidden');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseScreen').classList.add('hidden');
        }
    }
    
    restartGame() {
        this.gameState = 'start';
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('scoreDisplay').classList.add('hidden');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // 更新最高分
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBirdBestScore', this.bestScore);
        }
        
        // 创建爆炸效果
        this.createExplosionParticles(this.bird.x, this.bird.y);
        
        // 显示游戏结束界面
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('bestScore').textContent = this.bestScore;
        
        // 显示奖牌
        this.showMedal();
    }
    
    showMedal() {
        const medalContainer = document.getElementById('medalContainer');
        medalContainer.innerHTML = '';
        
        if (this.score >= 50) {
            const medal = document.createElement('div');
            medal.className = 'medal gold';
            medal.innerHTML = '<i class="fas fa-trophy"></i>';
            medalContainer.appendChild(medal);
        } else if (this.score >= 25) {
            const medal = document.createElement('div');
            medal.className = 'medal silver';
            medal.innerHTML = '<i class="fas fa-medal"></i>';
            medalContainer.appendChild(medal);
        } else if (this.score >= 10) {
            const medal = document.createElement('div');
            medal.className = 'medal bronze';
            medal.innerHTML = '<i class="fas fa-award"></i>';
            medalContainer.appendChild(medal);
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.frameCount++;
        
        // 更新小鸟
        this.bird.update(this.gravity);
        
        // 检查小鸟是否碰到边界
        if (this.bird.y <= 0 || this.bird.y >= this.height - this.bird.radius) {
            this.soundManager.playHit();
            this.gameOver();
            return;
        }
        
        // 生成管道
        if (this.frameCount - this.lastPipeTime > this.pipeSpacing / this.pipeSpeed) {
            this.createPipe();
            this.lastPipeTime = this.frameCount;
        }
        
        // 更新管道
        this.updatePipes();
        
        // 更新金币
        this.updateCoins();
        
        // 更新粒子
        this.updateParticles();
        
        // 更新云朵
        this.updateClouds();
        

        
        // 碰撞检测
        this.checkCollisions();
    }
    
    createPipe() {
        const gapY = Math.random() * (this.height - this.pipeGap - 100) + 50;
        this.pipes.push(new Pipe(this.width, gapY, this.pipeWidth, this.pipeGap));
        
        // 30% 的几率在管道间隙中生成金币
        if (Math.random() < 0.3) {
            const coinY = gapY + this.pipeGap / 2;
            this.coins.push(new Coin(this.width + this.pipeWidth / 2, coinY));
        }
    }
    
    updatePipes() {
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.update(this.pipeSpeed);
            
            // 检查是否通过管道
            if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.soundManager.playScore();
                this.createScoreParticles();
                
                // 更新游戏速度
                this.updateGameSpeed();
                
                // 更新分数显示
                document.querySelector('.score-number').textContent = this.score;
                document.querySelector('.score-number').classList.add('bounce');
                setTimeout(() => {
                    document.querySelector('.score-number').classList.remove('bounce');
                }, 600);
            }
            
            // 移除离开屏幕的管道
            if (pipe.x + pipe.width < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }
    
    updateCoins() {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.update(this.pipeSpeed);
            
            // 检查金币是否被收集
            if (!coin.collected && coin.collidesWith(this.bird)) {
                coin.collected = true;
                this.score += 5;
                this.soundManager.playCoin();
                this.createCoinParticles(coin.x, coin.y);
                
                // 更新游戏速度
                this.updateGameSpeed();
                
                // 更新分数显示
                document.querySelector('.score-number').textContent = this.score;
                document.querySelector('.score-number').classList.add('bounce');
                setTimeout(() => {
                    document.querySelector('.score-number').classList.remove('bounce');
                }, 600);
            }
            
            // 移除离开屏幕的金币
            if (coin.x + coin.radius < 0) {
                this.coins.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateClouds() {
        for (let cloud of this.clouds) {
            cloud.update();
            
            // 重置云朵位置
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.width;
                cloud.y = Math.random() * this.height / 2;
            }
        }
    }
    
    checkCollisions() {
        // 检查与管道的碰撞
        for (let pipe of this.pipes) {
            if (this.bird.collidesWith(pipe)) {
                this.soundManager.playHit();
                this.gameOver();
                return;
            }
        }
    }
    
    updateGameSpeed() {
        // 根据分数缓慢逐步增加管道速度
        // 每1分增加一点速度，使用平滑增长曲线
        const oldSpeed = this.pipeSpeed;
        
        // 使用平方根增长曲线，让速度增加越来越缓慢
        const speedBonus = this.speedIncreaseRate * Math.sqrt(this.score);
        this.pipeSpeed = Math.min(this.basePipeSpeed + speedBonus, this.maxPipeSpeed);
        
        // 当达到特定速度里程碑时播放加速音效
        const oldSpeedMultiplier = Math.floor(oldSpeed / this.basePipeSpeed * 4); // 0.25倍速为一个级别
        const newSpeedMultiplier = Math.floor(this.pipeSpeed / this.basePipeSpeed * 4);
        if (newSpeedMultiplier > oldSpeedMultiplier && this.pipeSpeed > this.basePipeSpeed) {
            this.soundManager.playSpeedUp();
        }
        
        // 更新速度指示器显示
        const speedMultiplier = (this.pipeSpeed / this.basePipeSpeed);
        document.getElementById('speedValue').textContent = speedMultiplier.toFixed(1);
    }
    
    createFlappingParticles() {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(
                this.bird.x,
                this.bird.y,
                (Math.random() - 0.5) * 4,
                Math.random() * 2 + 1,
                'rgba(255, 255, 255, 0.8)',
                30
            ));
        }
    }
    
    createScoreParticles() {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(
                this.bird.x,
                this.bird.y,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                `hsl(${Math.random() * 60 + 30}, 100%, 50%)`,
                60
            ));
        }
    }
    
    createExplosionParticles(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(
                x,
                y,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                'rgba(255, 100, 100, 0.8)',
                100
            ));
        }
    }
    
    createCoinParticles(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(
                x,
                y,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                '#FFD700',
                80
            ));
        }
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制背景
        this.background.render(this.ctx);
        
        // 绘制云朵
        for (let cloud of this.clouds) {
            cloud.render(this.ctx);
        }
        
        // 绘制管道
        for (let pipe of this.pipes) {
            pipe.render(this.ctx);
        }
        
        // 绘制金币
        for (let coin of this.coins) {
            coin.render(this.ctx);
        }
        
        // 绘制小鸟
        this.bird.render(this.ctx);
        
        // 绘制粒子
        for (let particle of this.particles) {
            particle.render(this.ctx);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 小鸟类
class Bird {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.velocity = 0;
        this.flapStrength = -4.5;
        this.rotation = 0;
        this.maxRotation = Math.PI / 6;
        this.colors = ['#FFD700', '#FFA500', '#FF6347'];
        
        // 翅膀动画相关属性
        this.wingAnimation = 0;      // 翅膀动画帧
        this.wingSpeed = 0.3;        // 翅膀动画速度
        this.isFlapping = false;     // 是否在煽动翅膀
        this.wingAngle = 0;          // 翅膀角度
        this.wingSpread = false;     // 翅膀是否展开
    }
    
    update(gravity) {
        this.velocity += gravity;
        this.y += this.velocity;
        
        // 旋转效果
        this.rotation = Math.max(-this.maxRotation, Math.min(this.maxRotation, this.velocity * 0.1));
        
        // 更新翅膀动画状态
        if (this.velocity < 0) {
            // 向上飞时快速煽动翅膀
            this.isFlapping = true;
            this.wingSpeed = 0.5;
            this.wingSpread = false;
            this.wingAnimation += this.wingSpeed;
            this.wingAngle = Math.sin(this.wingAnimation) * Math.PI / 4;
        } else {
            // 向下滑行时翅膀展开保持不动
            this.isFlapping = false;
            this.wingSpread = true;
            this.wingAngle = -Math.PI / 8; // 展开角度
        }
    }
    
    flap() {
        this.velocity = this.flapStrength;
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.rotation = 0;
        this.wingAnimation = 0;
        this.isFlapping = false;
        this.wingAngle = 0;
        this.wingSpread = false;
    }
    
    collidesWith(pipe) {
        // 简单的圆形碰撞检测
        const birdLeft = this.x - this.radius;
        const birdRight = this.x + this.radius;
        const birdTop = this.y - this.radius;
        const birdBottom = this.y + this.radius;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipe.width;
        
        // 检查是否在管道的X范围内
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // 检查是否碰到上管道或下管道
            if (birdTop < pipe.gapY || birdBottom > pipe.gapY + pipe.gapHeight) {
                return true;
            }
        }
        
        return false;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 绘制翅膀（在身体后面）
        this.renderWings(ctx);
        
        // 绘制小鸟身体
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, this.colors[0]);
        gradient.addColorStop(0.5, this.colors[1]);
        gradient.addColorStop(1, this.colors[2]);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制小鸟眼睛
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(5, -5, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(7, -5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制小鸟嘴巴
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(this.radius - 5, 0);
        ctx.lineTo(this.radius + 5, -2);
        ctx.lineTo(this.radius + 5, 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    renderWings(ctx) {
        // 翅膀基本参数
        const wingLength = this.radius * 1.2;
        const wingWidth = this.radius * 0.8;
        
        // 绘制左翅膀
        ctx.save();
        ctx.translate(-this.radius * 0.3, 0);
        ctx.rotate(this.wingAngle);
        
        // 翅膀渐变
        const wingGradient = ctx.createLinearGradient(0, -wingWidth, 0, wingWidth);
        wingGradient.addColorStop(0, '#FF6347');
        wingGradient.addColorStop(0.5, '#FFA500');
        wingGradient.addColorStop(1, '#FF8C00');
        
        ctx.fillStyle = wingGradient;
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 2;
        
        // 绘制翅膀形状
        ctx.beginPath();
        ctx.ellipse(0, 0, wingLength, wingWidth, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 翅膀纹理线条
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-wingLength * 0.5, -wingWidth * 0.3);
        ctx.lineTo(wingLength * 0.5, -wingWidth * 0.1);
        ctx.moveTo(-wingLength * 0.3, 0);
        ctx.lineTo(wingLength * 0.7, 0);
        ctx.moveTo(-wingLength * 0.5, wingWidth * 0.3);
        ctx.lineTo(wingLength * 0.5, wingWidth * 0.1);
        ctx.stroke();
        
        ctx.restore();
        
        // 绘制右翅膀
        ctx.save();
        ctx.translate(-this.radius * 0.3, 0);
        ctx.scale(1, -1); // 垂直翻转
        ctx.rotate(this.wingAngle);
        
        ctx.fillStyle = wingGradient;
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 2;
        
        // 绘制翅膀形状
        ctx.beginPath();
        ctx.ellipse(0, 0, wingLength, wingWidth, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 翅膀纹理线条
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-wingLength * 0.5, -wingWidth * 0.3);
        ctx.lineTo(wingLength * 0.5, -wingWidth * 0.1);
        ctx.moveTo(-wingLength * 0.3, 0);
        ctx.lineTo(wingLength * 0.7, 0);
        ctx.moveTo(-wingLength * 0.5, wingWidth * 0.3);
        ctx.lineTo(wingLength * 0.5, wingWidth * 0.1);
        ctx.stroke();
        
        ctx.restore();
    }
}

// 管道类
class Pipe {
    constructor(x, gapY, width, gapHeight) {
        this.x = x;
        this.gapY = gapY;
        this.width = width;
        this.gapHeight = gapHeight;
        this.passed = false;
        this.height = 600; // 画布高度
    }
    
    update(speed) {
        this.x -= speed;
    }
    
    render(ctx) {
        // 绘制上管道
        const upperGradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
        upperGradient.addColorStop(0, '#4CAF50');
        upperGradient.addColorStop(0.5, '#45a049');
        upperGradient.addColorStop(1, '#388E3C');
        
        ctx.fillStyle = upperGradient;
        ctx.fillRect(this.x, 0, this.width, this.gapY);
        
        // 绘制下管道
        const lowerGradient = ctx.createLinearGradient(this.x, this.gapY + this.gapHeight, this.x + this.width, this.height);
        lowerGradient.addColorStop(0, '#4CAF50');
        lowerGradient.addColorStop(0.5, '#45a049');
        lowerGradient.addColorStop(1, '#388E3C');
        
        ctx.fillStyle = lowerGradient;
        ctx.fillRect(this.x, this.gapY + this.gapHeight, this.width, this.height - this.gapY - this.gapHeight);
        
        // 绘制管道边框
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, 0, this.width, this.gapY);
        ctx.strokeRect(this.x, this.gapY + this.gapHeight, this.width, this.height - this.gapY - this.gapHeight);
        
        // 绘制管道顶部
        ctx.fillStyle = '#66BB6A';
        ctx.fillRect(this.x - 5, this.gapY - 20, this.width + 10, 20);
        ctx.fillRect(this.x - 5, this.gapY + this.gapHeight, this.width + 10, 20);
        
        ctx.strokeStyle = '#2E7D32';
        ctx.strokeRect(this.x - 5, this.gapY - 20, this.width + 10, 20);
        ctx.strokeRect(this.x - 5, this.gapY + this.gapHeight, this.width + 10, 20);
    }
}

// 粒子类
class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // 重力
        this.life--;
        
        // 淡出效果
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    
    isDead() {
        return this.life <= 0;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 云朵类
class Cloud {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = Math.random() * 80 + 60;
        this.height = this.width * 0.6;
        this.alpha = Math.random() * 0.3 + 0.2;
    }
    
    update() {
        this.x -= this.speed;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = 'white';
        
        // 绘制云朵
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 4, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 4, this.y, this.width / 3, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 2, this.y, this.width / 4, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 1.5, this.y, this.width / 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 背景类
class Background {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.groundHeight = 100;
    }
    
    render(ctx) {
        // 绘制天空渐变
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.height - this.groundHeight);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#98FB98');
        
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.width, this.height - this.groundHeight);
        
        // 绘制地面
        const groundGradient = ctx.createLinearGradient(0, this.height - this.groundHeight, 0, this.height);
        groundGradient.addColorStop(0, '#8B4513');
        groundGradient.addColorStop(1, '#654321');
        
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, this.height - this.groundHeight, this.width, this.groundHeight);
        
        // 绘制草地
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, this.height - this.groundHeight, this.width, 20);
    }
}

// 金币类
class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.collected = false;
        this.rotation = 0;
        this.animationSpeed = 0.1;
        this.bobOffset = 0;
        this.bobSpeed = 0.05;
    }
    
    update(speed) {
        this.x -= speed;
        this.rotation += this.animationSpeed;
        this.bobOffset += this.bobSpeed;
    }
    
    collidesWith(bird) {
        if (this.collected) return false;
        
        const dx = this.x - bird.x;
        const dy = this.y - bird.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (this.radius + bird.radius);
    }
    
    render(ctx) {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.x, this.y + Math.sin(this.bobOffset) * 3);
        ctx.rotate(this.rotation);
        
        // 绘制金币外圈
        const outerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        outerGradient.addColorStop(0, '#FFD700');
        outerGradient.addColorStop(0.7, '#FFA500');
        outerGradient.addColorStop(1, '#FF8C00');
        
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制金币内圈
        const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 0.7);
        innerGradient.addColorStop(0, '#FFF700');
        innerGradient.addColorStop(1, '#FFD700');
        
        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制金币边框
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 绘制金币符号 "$"
        ctx.fillStyle = '#B8860B';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        
        ctx.restore();
        
        // 绘制光芒效果
        ctx.save();
        ctx.translate(this.x, this.y + Math.sin(this.bobOffset) * 3);
        ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < 8; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 / 8) * i + this.rotation * 0.5);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.radius + 5, 0);
            ctx.lineTo(this.radius + 12, 0);
            ctx.stroke();
            ctx.restore();
        }
        
        ctx.restore();
    }
}