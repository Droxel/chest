// --- 1. БАЗА ПРЕДМЕТОВ ---
const itemsDB = [
    { id: 1, name: "Какулька", image: "💩", rarity: "trash", desc: "Фу, воняет!" },
    { id: 2, name: "Огрызок", image: "🍎", rarity: "trash", desc: "Кто-то уже поел." },
    { id: 3, name: "Рваный носок", image: "🧦", rarity: "trash", desc: "Второй потерялся." },
    { id: 4, name: "Камень", image: "🪨", rarity: "common", desc: "Просто камень." },
    { id: 5, name: "Ветка", image: "🪵", rarity: "common", desc: "Палка-копалка." },
    { id: 6, name: "Хлебушек", image: "🍞", rarity: "common", desc: "Всему голова." },
    { id: 7, name: "Мячик", image: "⚽", rarity: "rare", desc: "Гол!" },
    { id: 8, name: "Бургер", image: "🍔", rarity: "rare", desc: "Вкуснятина." },
    { id: 9, name: "Айфон 5", image: "📱", rarity: "epic", desc: "Почти новый." },
    { id: 10, name: "Котик", image: "😽", rarity: "epic", desc: "Мур-мяу." },
    { id: 11, name: "Алмаз", image: "💎", rarity: "legendary", desc: "ТЫ БОГАТ!" },
    { id: 12, name: "Корона", image: "👑", rarity: "legendary", desc: "Король сундуков." }
];

const RARITY_COLORS = {
    trash: "#747d8c",
    common: "#a4b0be",
    rare: "#1e90ff",
    epic: "#a55eea",
    legendary: "#ffa502"
};

// --- 2. СОСТОЯНИЕ ---
let playerData = JSON.parse(localStorage.getItem('simChestUser')) || {
    coins: 50,
    inventory: [],
    dailyStreak: 0,
    lastDaily: 0
};
const dailyRewards = [10, 15, 20, 30, 50, 100, 500];

// --- 3. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ---
function updateUI() {
    document.getElementById('coin-count').innerText = playerData.coins;
    
    const invGrid = document.getElementById('inventory-grid');
    invGrid.innerHTML = "";
    if(playerData.inventory.length === 0) {
        document.getElementById('empty-inv-msg').style.display = 'block';
    } else {
        document.getElementById('empty-inv-msg').style.display = 'none';
        playerData.inventory.slice().reverse().forEach(item => {
            const div = document.createElement('div');
            div.className = 'inv-item';
            div.style.borderColor = RARITY_COLORS[item.rarity];
            div.innerHTML = `<div class="inv-img">${item.image}</div><div class="inv-name">${item.name}</div>`;
            invGrid.appendChild(div);
        });
    }
    renderDaily();
    localStorage.setItem('simChestUser', JSON.stringify(playerData));
}

window.switchScreen = function(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// --- 4. ЛОГИКА СУНДУКА ---
const openBtn = document.getElementById('open-chest-btn');
const chestVisual = document.getElementById('chest-visual');
const rouletteWrapper = document.getElementById('roulette-wrapper');
const rouletteStrip = document.getElementById('roulette-strip');

openBtn.onclick = function() {
    if(playerData.coins < 5) {
        alert("Мало монет!");
        return;
    }
    playerData.coins -= 5;
    updateUI();

    chestVisual.classList.add('shake');
    openBtn.disabled = true;
    openBtn.innerText = "ОТКРЫВАЕМ...";

    setTimeout(() => {
        chestVisual.classList.remove('shake');
        chestVisual.style.display = 'none';
        rouletteWrapper.style.display = 'block';
        startRoulette();
    }, 500);
};

function startRoulette() {
    let pool = [];
    itemsDB.forEach(item => {
        let weight = (item.rarity === 'trash') ? 50 : (item.rarity === 'common') ? 30 : (item.rarity === 'rare') ? 15 : (item.rarity === 'epic') ? 5 : 1;
        for(let i=0; i<weight; i++) pool.push(item);
    });

    const winner = pool[Math.floor(Math.random() * pool.length)];
    const totalItems = 35;
    const winnerIndex = 29;
    
    let html = "";
    for(let i=0; i < totalItems; i++) {
        let item = (i === winnerIndex) ? winner : pool[Math.floor(Math.random() * pool.length)];
        html += `<div class="roulette-item bg-${item.rarity}">${item.image}</div>`;
    }
    
    rouletteStrip.innerHTML = html;
    rouletteStrip.style.transition = 'none';
    rouletteStrip.style.left = '0px';

    setTimeout(() => {
        const itemWidth = 100;
        const targetPos = (winnerIndex * itemWidth) - (rouletteWrapper.offsetWidth / 2) + (itemWidth / 2);
        rouletteStrip.style.transition = 'left 4s cubic-bezier(0.1, 0.8, 0.1, 1)';
        rouletteStrip.style.left = `-${targetPos}px`;

        setTimeout(() => finishSpin(winner), 4000);
    }, 50);
}

function finishSpin(item) {
    playerData.inventory.push(item);
    updateUI();
    
    document.getElementById('reward-icon').innerText = item.image;
    document.getElementById('reward-name').innerText = item.name;
    document.getElementById('reward-desc').innerText = item.desc;
    
    const badge = document.getElementById('reward-rarity');
    badge.innerText = item.rarity.toUpperCase();
    badge.style.backgroundColor = RARITY_COLORS[item.rarity];
    
    document.getElementById('modal-reward').classList.remove('hidden');
    if(item.rarity === 'epic' || item.rarity === 'legendary') fireConfetti();

    openBtn.disabled = false;
    openBtn.innerHTML = `ОТКРЫТЬ <br><span class="price-tag">5 🟡</span>`;
}

document.getElementById('claim-btn').onclick = function() {
    document.getElementById('modal-reward').classList.add('hidden');
    rouletteWrapper.style.display = 'none';
    chestVisual.style.display = 'block';
};

// --- 5. ЕЖЕДНЕВКА И КОНФЕТТИ ---
function renderDaily() {
    const grid = document.getElementById('daily-grid');
    const timerBox = document.getElementById('timer-box');
    grid.innerHTML = "";
    const now = Date.now();
    const canClaim = (now - playerData.lastDaily) > 86400000;

    dailyRewards.forEach((coins, i) => {
        const el = document.createElement('div');
        el.className = 'day-card' + (i < playerData.dailyStreak ? ' claimed' : '') + (i === playerData.dailyStreak && canClaim ? ' active' : '');
        if(i === playerData.dailyStreak && canClaim) {
            el.onclick = () => {
                playerData.coins += coins;
                playerData.dailyStreak = (playerData.dailyStreak + 1) % 7;
                playerData.lastDaily = Date.now();
                fireConfetti();
                updateUI();
            };
        }
        el.innerHTML = `День ${i+1}<br><b>${coins}</b>`;
        grid.appendChild(el);
    });
    timerBox.innerText = canClaim ? "ЗАБИРАЙ!" : "Приходи завтра";
}

function fireConfetti() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

updateUI();