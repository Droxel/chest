// --- БАЗА ДАННЫХ ПРЕДМЕТОВ ---
// Здесь ты можешь добавлять новые предметы.
// rarity (редкость): чем выше число, тем реже падает (но пока сделаем просто рандом)
const itemsDB = [
    { id: 1, name: "Камушек", image: "🪨" },
    { id: 2, name: "Какулька", image: "💩" },
    { id: 3, name: "Мячик", image: "⚽️" },
    { id: 4, name: "Листик", image: "🍃" },
    { id: 5, name: "Кленовый лист", image: "🍁" },
    { id: 6, name: "Веточка", image: "🪵" },
    { id: 7, name: "Алмаз", image: "💎" },
    { id: 8, name: "Сапог", image: "👢" }
];

// Настройки ежедневных наград (монеты по дням)
const dailyRewards = [10, 15, 20, 25, 30, 50, 100];

// --- СОСТОЯНИЕ ИГРОКА (Данные) ---
// Пытаемся загрузить сохранение, если его нет - создаем новое
let playerData = JSON.parse(localStorage.getItem('chestSimData')) || {
    coins: 50, // Стартовые монеты
    inventory: [], // Список полученных предметов
    dailyStreak: 0, // День награды
    lastDailyClaim: 0 // Время последнего сбора награды
};

// --- ОСНОВНЫЕ ПЕРЕМЕННЫЕ ---
const COST_TO_OPEN = 5;
const ROULETTE_ITEM_WIDTH = 100; // Ширина одного квадрата в рулетке (как в CSS)

// Ссылки на элементы DOM
const uiCoins = document.getElementById('coin-count');
const uiInventory = document.getElementById('inventory-grid');
const uiDailyGrid = document.getElementById('daily-grid');
const rouletteStrip = document.getElementById('roulette-strip');
const rouletteWrapper = document.getElementById('roulette-wrapper');
const modalReward = document.getElementById('modal-reward');

// --- ЗАПУСК ---
updateUI(); // Обновить все числа и списки при старте

// --- ФУНКЦИИ ---

// 1. Обновление интерфейса
function updateUI() {
    uiCoins.innerText = playerData.coins;
    renderInventory();
    renderDaily();
    saveData();
}

// 2. Сохранение данных в браузере
function saveData() {
    localStorage.setItem('chestSimData', JSON.stringify(playerData));
}

// 3. Переключение экранов
window.switchScreen = function(screenId) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Показываем нужный
    document.getElementById(screenId).classList.add('active');
};

// --- ЛОГИКА СУНДУКА ---

const openBtn = document.getElementById('open-chest-btn');

openBtn.addEventListener('click', () => {
    if (playerData.coins < COST_TO_OPEN) {
        alert("Не хватает монет! Забери подарок.");
        return;
    }

    // Списываем монеты
    playerData.coins -= COST_TO_OPEN;
    updateUI();
    openBtn.disabled = true; // Блокируем кнопку
    openBtn.innerText = "КРУТИМ...";

    startRoulette();
});

function startRoulette() {
    rouletteWrapper.style.display = "block"; // Показываем рулетку
    rouletteStrip.innerHTML = ""; // Очищаем старое
    rouletteStrip.style.transition = "none";
    rouletteStrip.style.left = "0px";

    // Генерация ленты рулетки
    // Мы создадим 30 фейковых предметов, а 31-й будет выигрышный
    const totalItems = 30;
    const winnerIndex = 25; // На каком элементе остановится (где-то в конце)
    
    // Выбираем случайный предмет для выигрыша
    const winningItem = itemsDB[Math.floor(Math.random() * itemsDB.length)];

    let html = "";
    for (let i = 0; i < totalItems; i++) {
        let item;
        if (i === winnerIndex) {
            item = winningItem;
        } else {
            // Случайный мусор для массовки
            item = itemsDB[Math.floor(Math.random() * itemsDB.length)];
        }
        html += `<div class="roulette-item">${item.image}</div>`;
    }
    rouletteStrip.innerHTML = html;

    // ЗАПУСК АНИМАЦИИ
    // Небольшая задержка, чтобы браузер отрисовал элементы
    setTimeout(() => {
        // Вычисляем, куда сдвинуть ленту, чтобы winner оказался по центру
        // Сдвиг = (ширина_элемента * индекс) - (половина_ширина_контейнера) + (половина_ширины_элемента)
        const containerWidth = 300; // Ширина окна рулетки
        const targetPos = (winnerIndex * ROULETTE_ITEM_WIDTH) - (containerWidth / 2) + (ROULETTE_ITEM_WIDTH / 2);
        
        // CSS Transition для плавного замедления (cubic-bezier делает эффект торможения)
        rouletteStrip.style.transition = "left 4s cubic-bezier(0.1, 0.9, 0.3, 1)";
        rouletteStrip.style.left = `-${targetPos}px`;

        // Когда анимация закончится (через 4 секунды)
        setTimeout(() => {
            giveReward(winningItem);
            openBtn.disabled = false;
            openBtn.innerHTML = `ОТКРЫТЬ СУНДУК <br><small>(${COST_TO_OPEN} монет)</small>`;
            // Можно скрыть рулетку обратно, если хочешь, но оставим для красоты
        }, 4000);

    }, 50);
}

function giveReward(item) {
    // Добавляем в инвентарь
    playerData.inventory.push(item);
    updateUI();

    // Показываем модалку
    document.getElementById('reward-icon').innerText = item.image;
    document.getElementById('reward-name').innerText = item.name;
    modalReward.classList.remove('hidden');
}

// Закрытие модалки
document.getElementById('close-modal').addEventListener('click', () => {
    modalReward.classList.add('hidden');
});

// --- ЛОГИКА ИНВЕНТАРЯ ---
function renderInventory() {
    uiInventory.innerHTML = "";
    // Перебираем инвентарь с конца (чтобы новые были сверху)
    playerData.inventory.slice().reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'inv-item';
        div.innerHTML = `
            <div class="inv-img">${item.image}</div>
            <div class="inv-name">${item.name}</div>
        `;
        uiInventory.appendChild(div);
    });
}

// --- ЛОГИКА ЕЖЕДНЕВНОЙ НАГРАДЫ ---
function renderDaily() {
    uiDailyGrid.innerHTML = "";
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Проверяем, прошли ли сутки
    const timeSinceLast = now - playerData.lastDailyClaim;
    const canClaim = timeSinceLast >= oneDayMs;

    // Отображаем 7 дней
    dailyRewards.forEach((coins, index) => {
        const div = document.createElement('div');
        div.className = 'day-card';
        div.innerHTML = `<div>День ${index + 1}</div><div>${coins}🟡</div>`;

        // Логика стилей
        if (index < playerData.dailyStreak) {
            div.classList.add('claimed'); // Уже забрали
        } else if (index === playerData.dailyStreak) {
            // Текущий день для сбора
            if (canClaim) {
                div.classList.add('active');
                div.onclick = () => claimDaily(index, coins);
            } else {
                // Еще рано
                div.style.opacity = "0.7";
                div.innerHTML += "<br><small>Жди...</small>";
            }
        }
        
        uiDailyGrid.appendChild(div);
    });
    
    // Таймер
    const timerMsg = document.getElementById('timer-msg');
    if (!canClaim) {
        // Сколько осталось ждать
        const waitTime = oneDayMs - timeSinceLast;
        const hours = Math.floor(waitTime / (1000 * 60 * 60));
        const minutes = Math.floor((waitTime % (1000 * 60 * 60)) / (1000 * 60));
        timerMsg.innerText = `Приходи через ${hours}ч ${minutes}м`;
    } else {
        timerMsg.innerText = "Награда доступна!";
    }
}

function claimDaily(dayIndex, coins) {
    playerData.coins += coins;
    playerData.dailyStreak++;
    playerData.lastDailyClaim = Date.now();
    
    // Если прошли 7 дней, можно сбросить или оставить на 7-м (тут сбрасываем)
    if (playerData.dailyStreak >= 7) {
        playerData.dailyStreak = 0;
    }
    
    updateUI();
    alert(`Ты получил ${coins} монет!`);
}