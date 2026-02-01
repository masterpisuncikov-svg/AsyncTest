class GameManager {
    constructor() {
        this.games = [];
        this.jsonUrl = 'games.json'; // Или URL на GitHub
        this.loadFromJSON();
    }
    
    // Загрузить игры из JSON файла
    async loadFromJSON() {
        try {
            const response = await fetch(this.jsonUrl);
            if (response.ok) {
                this.games = await response.json();
                this.saveToLocalStorage();
                this.displayGames();
            } else {
                // Если не удалось загрузить, используем localStorage
                this.games = this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error('Ошибка загрузки JSON:', error);
            this.games = this.loadFromLocalStorage();
        }
    }
    
    // Загрузить из localStorage
    loadFromLocalStorage() {
        const saved = localStorage.getItem('robloxGames');
        return saved ? JSON.parse(saved) : [];
    }
    
    // Сохранить в localStorage
    saveToLocalStorage() {
        localStorage.setItem('robloxGames', JSON.stringify(this.games));
    }
    
    // Обновленный метод добавления игры
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
            id: parseInt(gameId),
            name: gameName.trim(),
            added: new Date().toISOString().slice(0, 19).replace('T', ' '),
            players: 0,
            genre: "Не указан"
        };
        
        this.games.push(newGame);
        this.saveToLocalStorage();
        this.displayGames();
        this.showMessage(`Игра "${gameName}" успешно добавлена!`, 'success');
        
        // Очистить поля
        document.getElementById('gameIdInput').value = '';
        document.getElementById('gameNameInput').value = '';
        
        // Экспорт в файл (для скачивания)
        this.exportGamesToFile();
        
        return true;
    }
    
    // Экспорт игр в JSON файл
    exportGamesToFile() {
        const dataStr = JSON.stringify(this.games, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Автоматическое скачивание не делаем, только для ручного экспорта
        console.log('Игры сохранены, готовы к экспорту');
    }
    
    // Генерация кода для Roblox
    generateRobloxCode() {
        let code = '-- Автоматически сгенерированный код\n';
        code += 'local GamesDatabase = {\n';
        
        this.games.forEach((game, index) => {
            code += `    [${game.id}] = "${game.name}"`;
            if (index < this.games.length - 1) code += ',';
            code += '\n';
        });
        
        code += '}\n\n';
        code += 'function CheckGame(gameId)\n';
        code += '    return GamesDatabase[gameId] ~= nil\n';
        code += 'end\n';
        code += '\n';
        code += 'function GetGameName(gameId)\n';
        code += '    return GamesDatabase[gameId] or "Неизвестная игра"\n';
        code += 'end';
        
        return code;
    }
    
    // Показать код для Roblox
    showRobloxCode() {
        const code = this.generateRobloxCode();
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 80%;
            max-height: 80%;
            overflow: auto;
        `;
        
        const pre = document.createElement('pre');
        pre.textContent = code;
        pre.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 5px;';
        
        const button = document.createElement('button');
        button.textContent = 'Закрыть';
        button.onclick = () => modal.remove();
        button.style.cssText = `
            margin-top: 15px;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `;
        
        content.appendChild(pre);
        content.appendChild(button);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
}

// Добавьте эту кнопку в HTML
function addRobloxButton() {
    const button = document.createElement('button');
    button.textContent = 'Получить код для Roblox';
    button.onclick = () => gameManager.showRobloxCode();
    button.style.cssText = `
        margin: 20px auto;
        display: block;
        padding: 12px 25px;
        background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
    `;
    
    document.querySelector('.main-content').appendChild(button);
}

// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
    addRobloxButton();
});
