/**
 * 主界面控制和游戏初始化
 */

let game;
let isFullscreen = false;
let soundEnabled = true;

document.addEventListener('DOMContentLoaded', function() {
    // 初始化游戏
    initGame();
    
    // 绑定按钮事件
    bindUIEvents();
    
    // 加载游戏统计
    loadGameStats();
    
    // 初始化模态框
    initModals();
});

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // 创建游戏实例
    game = new FlappyBirdGame(canvas);
    
    // 尝试预激活音频上下文（需要用户交互后才能完全激活）
    if (game.soundManager) {
        game.soundManager.ensureAudioContext().catch(console.warn);
    }
    
    // 初始化显示
    updateBestScore();
    
    // 确保初始状态正确
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('scoreDisplay').classList.add('hidden');
}

function bindUIEvents() {
    // 开始游戏按钮
    document.getElementById('startBtn').addEventListener('click', async function() {
        if (game && game.soundManager) {
            await game.soundManager.activateAudio();
        }
        await game.startGame();
    });
    
    // 排行榜按钮
    document.getElementById('leaderboardBtn').addEventListener('click', function() {
        showLeaderboard();
    });
    
    // 重新开始按钮
    document.getElementById('restartBtn').addEventListener('click', function() {
        game.restartGame();
    });
    
    // 保存分数按钮
    document.getElementById('saveScoreBtn').addEventListener('click', function() {
        showSaveScoreModal();
    });
    
    // 暂停按钮
    document.getElementById('pauseBtn').addEventListener('click', function() {
        game.pauseGame();
    });
    
    // 继续游戏按钮
    document.getElementById('resumeBtn').addEventListener('click', function() {
        game.resumeGame();
    });
    
    // 返回主菜单按钮
    document.getElementById('mainMenuBtn').addEventListener('click', function() {
        game.restartGame();
    });
    
    // 音效开关按钮
    document.getElementById('soundBtn').addEventListener('click', async function() {
        if (game && game.soundManager) {
            await game.soundManager.activateAudio();
        }
        toggleSound();
    });
    
    // 全屏按钮
    document.getElementById('fullscreenBtn').addEventListener('click', function() {
        toggleFullscreen();
    });
    
    // 确认保存分数按钮
    document.getElementById('confirmSaveBtn').addEventListener('click', function() {
        saveScore();
    });
    
    // 阻止默认的触摸滚动
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // 阻止默认的空格键滚动
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            e.preventDefault();
        }
    });
}

function updateBestScore() {
    const bestScore = localStorage.getItem('flappyBirdBestScore') || 0;
    document.getElementById('bestScore').textContent = bestScore;
}

async function loadGameStats() {
    try {
        const response = await fetch('/api/game-stats');
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            document.getElementById('totalGames').textContent = stats.total_games;
            document.getElementById('highestScore').textContent = stats.highest_score;
            document.getElementById('averageScore').textContent = stats.average_score;
        }
    } catch (error) {
        console.error('加载游戏统计失败:', error);
    }
}

async function showLeaderboard() {
    const modal = new bootstrap.Modal(document.getElementById('leaderboardModal'));
    modal.show();
    
    // 显示加载状态
    document.getElementById('leaderboardLoading').style.display = 'block';
    document.getElementById('leaderboardList').style.display = 'none';
    
    try {
        const response = await fetch('/api/highscores');
        const result = await response.json();
        
        if (result.success) {
            displayLeaderboard(result.data);
        } else {
            showError('加载排行榜失败');
        }
    } catch (error) {
        console.error('加载排行榜失败:', error);
        showError('网络错误，请稍后重试');
    } finally {
        document.getElementById('leaderboardLoading').style.display = 'none';
    }
}

function displayLeaderboard(scores) {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    leaderboardList.style.display = 'block';
    
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<div class="text-center p-4 text-muted">暂无排行记录</div>';
        return;
    }
    
    scores.forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'top1';
        else if (rank === 2) rankClass = 'top2';
        else if (rank === 3) rankClass = 'top3';
        
        item.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${rank}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${score.player}</div>
                <div class="leaderboard-date">${score.date}</div>
            </div>
            <div class="leaderboard-score">${score.score}</div>
        `;
        
        leaderboardList.appendChild(item);
    });
}

function showSaveScoreModal() {
    const modal = new bootstrap.Modal(document.getElementById('saveScoreModal'));
    document.getElementById('scoreToSave').textContent = game.score;
    document.getElementById('playerName').value = '';
    modal.show();
}

async function saveScore() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('请输入玩家姓名');
        return;
    }
    
    const confirmBtn = document.getElementById('confirmSaveBtn');
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
    confirmBtn.disabled = true;
    
    try {
        const response = await fetch('/api/highscores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                score: game.score,
                player: playerName
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('saveScoreModal'));
            modal.hide();
            
            // 显示成功消息
            showSuccess('分数保存成功！');
            
            // 更新游戏统计
            loadGameStats();
        } else {
            showError(result.error || '保存分数失败');
        }
    } catch (error) {
        console.error('保存分数失败:', error);
        showError('网络错误，请稍后重试');
    } finally {
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;
    }
}

function toggleSound() {
    // 切换游戏音效状态
    if (game && game.soundManager) {
        soundEnabled = game.soundManager.toggle();
    } else {
        soundEnabled = !soundEnabled;
    }
    
    const soundBtn = document.getElementById('soundBtn');
    const icon = soundBtn.querySelector('i');
    
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
        soundBtn.title = '音效开启';
    } else {
        icon.className = 'fas fa-volume-mute';
        soundBtn.title = '音效关闭';
    }
    
    localStorage.setItem('flappyBirdSoundEnabled', soundEnabled);
}

function toggleFullscreen() {
    const container = document.querySelector('.container-fluid');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const icon = fullscreenBtn.querySelector('i');
    
    if (!isFullscreen) {
        // 进入全屏
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
        
        container.classList.add('fullscreen-mode');
        icon.className = 'fas fa-compress';
        fullscreenBtn.title = '退出全屏';
        isFullscreen = true;
    } else {
        // 退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        container.classList.remove('fullscreen-mode');
        icon.className = 'fas fa-expand';
        fullscreenBtn.title = '全屏';
        isFullscreen = false;
    }
}

function initModals() {
    // 监听全屏变化事件
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    // 加载音效设置
    const savedSoundEnabled = localStorage.getItem('flappyBirdSoundEnabled');
    if (savedSoundEnabled !== null) {
        soundEnabled = savedSoundEnabled === 'true';
        // 设置游戏音效状态
        if (game && game.soundManager) {
            game.soundManager.enabled = soundEnabled;
        }
        // 更新UI
        const soundBtn = document.getElementById('soundBtn');
        const icon = soundBtn.querySelector('i');
        if (soundEnabled) {
            icon.className = 'fas fa-volume-up';
            soundBtn.title = '音效开启';
        } else {
            icon.className = 'fas fa-volume-mute';
            soundBtn.title = '音效关闭';
        }
    }
    
    // 保存分数表单提交
    document.getElementById('saveScoreForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveScore();
    });
    
    // 添加一次性用户交互监听器来激活音频
    const activateAudioOnFirstInteraction = async () => {
        if (game && game.soundManager) {
            await game.soundManager.activateAudio();
        }
        // 移除监听器
        document.removeEventListener('click', activateAudioOnFirstInteraction);
        document.removeEventListener('keydown', activateAudioOnFirstInteraction);
        document.removeEventListener('touchstart', activateAudioOnFirstInteraction);
    };
    
    document.addEventListener('click', activateAudioOnFirstInteraction);
    document.addEventListener('keydown', activateAudioOnFirstInteraction);
    document.addEventListener('touchstart', activateAudioOnFirstInteraction);
}

function handleFullscreenChange() {
    const container = document.querySelector('.container-fluid');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const icon = fullscreenBtn.querySelector('i');
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        container.classList.remove('fullscreen-mode');
        icon.className = 'fas fa-expand';
        fullscreenBtn.title = '全屏';
        isFullscreen = false;
    }
}

function showError(message) {
    // 可以使用 Toast 通知或者 Alert
    alert('错误: ' + message);
}

function showSuccess(message) {
    // 可以使用 Toast 通知或者 Alert
    alert('成功: ' + message);
}

// 工具函数
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('zh-CN');
}

// 防止页面刷新时的确认对话框
window.addEventListener('beforeunload', function(e) {
    if (game && game.gameState === 'playing') {
        e.preventDefault();
        e.returnValue = '';
        return '游戏正在进行中，确定要离开吗？';
    }
});

// 处理页面可见性变化
document.addEventListener('visibilitychange', function() {
    if (game) {
        if (game.gameState === 'playing' && document.hidden) {
            game.pauseGame();
        } else if (!document.hidden && game.soundManager) {
            // 页面重新可见时，尝试恢复音频上下文
            game.soundManager.ensureAudioContext();
        }
    }
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    if (game) {
        switch(e.key) {
            case 'p':
            case 'P':
                if (game.gameState === 'playing') {
                    game.pauseGame();
                } else if (game.gameState === 'paused') {
                    game.resumeGame();
                }
                break;
            case 'r':
            case 'R':
                if (game.gameState === 'gameOver') {
                    game.restartGame();
                }
                break;
            case 'Escape':
                if (game.gameState === 'playing') {
                    game.pauseGame();
                }
                break;
        }
    }
});

// 手机端优化
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // 隐藏地址栏
    window.addEventListener('load', function() {
        setTimeout(function() {
            window.scrollTo(0, 1);
        }, 100);
    });
    
    // 禁用选择文本
    document.body.style.webkitUserSelect = 'none';
    document.body.style.userSelect = 'none';
}

// 性能监控
let lastTime = 0;
let frameCount = 0;
let fps = 0;

function measureFPS() {
    const now = performance.now();
    frameCount++;
    
    if (now - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;
        
        // 可以在开发模式下显示FPS
        if (window.location.search.includes('debug')) {
            console.log('FPS:', fps);
        }
    }
    
    requestAnimationFrame(measureFPS);
}

// 启动FPS监控
if (window.location.search.includes('debug')) {
    measureFPS();
}

// 导出全局函数供其他脚本使用
window.FlappyBirdMain = {
    game: () => game,
    toggleSound,
    toggleFullscreen,
    showLeaderboard,
    saveScore,
    loadGameStats
}; 