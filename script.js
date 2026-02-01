class GameManager {
    constructor() {
        this.games = this.loadGames();
        this.displayGames();
    }
    
    // Загрузить игры из localStorage
    loadGames() {
        const saved = localStorage.getItem('robloxGames');
        return saved ? JSON.parse(saved) : [];
    }
    
    // Сохранить игры в localStorage
    saveGames() {
        localStorage.setItem('robloxGames', JSON.stringify(this.games));
    }
    
    // Проверить существует ли игра
    gameExists(gameId) {
        return this.games.some(game => game.id === gameId);
    }
    
    // Добавить игру
    addGame(gameId, gameName) {
        if (!gameId || !gameName) {
            this.showMessage('Введите ID и название игры', 'error');
            return false;
        }
        
        if (this.gameExists(gameId)) {
            this.showMessage('Игра с таким ID уже существует!', 'error');
            return false;
        }
        
        const newGame = {
            id: gameId,
            name: gameName.trim(),
            added: new Date().toLocaleString('ru-RU')
        };
        
        this.games.push(newGame);
        this.saveGames();
        this.displayGames();
        this.showMessage(`Игра "${gameName}" успешно добавлена!`, 'success');
        
        // Очистить поля ввода
        document.getElementById('gameIdInput').value = '';
        document.getElementById('gameNameInput').value = '';
        
        return true;
    }
    
    // Удалить игру
    deleteGame(gameId) {
        const index = this.games.findIndex(game => game.id === gameId);
        if (index !== -1) {
            const gameName = this.games[index].name;
            this.games.splice(index, 1);
            this.saveGames();
            this.displayGames();
            this.showMessage(`Игра "${gameName}" удалена`, 'success');
        }
    }
    
    // Отобразить все игры
    displayGames() {
        const container = document.getElementById('gamesContainer');
        const countElement = document.getElementById('gameCount');
        
        if (this.games.length === 0) {
            container.innerHTML = `
                <div class="empty-list">
                    <p>Список игр пуст. Добавьте первую игру!</p>
                </div>
            `;
            countElement.textContent = '0';
            return;
        }
        
        container.innerHTML = this.games.map(game => `
            <div class="game-item">
                <div class="game-info">
                    <span class="game-id">ID: ${game.id}</span>
                    <span class="game-name">${game.name}</span>
                    <span class="game-added">Добавлено: ${game.added}</span>
                </div>
                <button class="delete-btn" onclick="gameManager.deleteGame('${game.id}')">
                    Удалить
                </button>
            </div>
        `).join('');
        
        countElement.textContent = this.games.length;
    }
    
    // Показать сообщение
    showMessage(text, type) {
        const container = document.getElementById('messageContainer');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        container.innerHTML = '';
        container.appendChild(message);
        
        setTimeout(() => {
            message.style.transition = 'opacity 0.5s';
            message.style.opacity = '0';
            setTimeout(() => {
                if (container.contains(message)) {
                    container.removeChild(message);
                }
            }, 500);
        }, 3000);
    }
    
    // Экспорт в JSON
    exportToJSON() {
        const dataStr = JSON.stringify(this.games, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'roblox_games.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    // Импорт из JSON
    importFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedGames = JSON.parse(e.target.result);
                let added = 0;
                let skipped = 0;
                
                importedGames.forEach(game => {
                    if (!this.gameExists(game.id)) {
                        this.games.push(game);
                        added++;
                    } else {
                        skipped++;
                    }
                });
                
                this.saveGames();
                this.displayGames();
                this.showMessage(
                    `Импорт завершен: добавлено ${added}, пропущено ${skipped} (дубликаты)`,
                    'success'
                );
            } catch (error) {
                this.showMessage('Ошибка при импорте файла', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Глобальный экземпляр менеджера игр
const gameManager = new GameManager();

// Функция для добавления игры (вызывается из HTML)
function addGame() {
    const gameId = document.getElementById('gameIdInput').value;
    const gameName = document.getElementById('gameNameInput').value;
    gameManager.addGame(gameId, gameName);
}

// Добавить обработчик нажатия Enter
document.getElementById('gameNameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addGame();
    }
});
