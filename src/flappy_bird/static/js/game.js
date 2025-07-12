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
        this.particles = [];
        this.clouds = [];
        
        // 游戏设置
        this.gravity = 0.15;
        this.pipeSpeed = 2;
        this.pipeGap = 200;
        this.pipeWidth = 60;
        this.pipeSpacing = 300;
        
        // 背景
        this.background = new Background(this.width, this.height);
        
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
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleInput();
            }
        });
        
        // 鼠标事件
        this.canvas.addEventListener('click', () => {
            this.handleInput();
        });
        
        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });
    }
    
    handleInput() {
        switch (this.gameState) {
            case 'start':
                this.startGame();
                break;
            case 'playing':
                this.bird.flap();
                this.createFlappingParticles();
                break;
            case 'gameOver':
                this.restartGame();
                break;
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.bird.reset(this.width / 4, this.height / 2);
        this.pipes = [];
        this.particles = [];
        this.frameCount = 0;
        this.lastPipeTime = 0;
        
        // 隐藏开始界面，显示分数
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('scoreDisplay').classList.remove('hidden');
        
        // 重置分数显示
        document.querySelector('.score-number').textContent = '0';
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
    }
    
    updatePipes() {
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.update(this.pipeSpeed);
            
            // 检查是否通过管道
            if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.createScoreParticles();
                
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
                this.gameOver();
                return;
            }
        }
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
    }
    
    update(gravity) {
        this.velocity += gravity;
        this.y += this.velocity;
        
        // 旋转效果
        this.rotation = Math.max(-this.maxRotation, Math.min(this.maxRotation, this.velocity * 0.1));
    }
    
    flap() {
        this.velocity = this.flapStrength;
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.rotation = 0;
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