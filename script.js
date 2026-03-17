// ====================================
// РАДИО САВИК — Полный скрипт
// ====================================

// === Состояние ===
let radioUrl = '';
let intervalMinutes = 30;
let adFiles = [];
let currentAdIndex = 0;
let adTimerId = null;
let countdownId = null;
let isPlaying = false;
let isPaused = false;
let adEndTime = 0;
let pausedRemaining = 0; // ms оставшиеся при паузе

let radioVolume = 0.7;
let adVolume = 0.8;

const FADE_DURATION = 1500;
const FADE_STEPS = 30;

// === DOM ===
const radioPlayer = document.getElementById('radioPlayer');
const adPlayer = document.getElementById('adPlayer');
const statusText = document.getElementById('statusText');
const statusDot = document.getElementById('statusDot');
const nowPlaying = document.getElementById('nowPlaying');
const timerValue = document.getElementById('timerValue');
const fileList = document.getElementById('fileList');
const dropZone = document.getElementById('dropZone');

// ====================================
// 0. Шестерёнка — показ/скрытие настроек
// ====================================
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');

settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('open');
    settingsBtn.classList.toggle('active');
});

// ====================================
// 0.5 Preset радиостанции
// ====================================
const PRESET_STATIONS = [
    {
        category: '🎷 Ретро и Ностальгия',
        stations: [
            { name: 'Радио Мелодия (СПБ)', url: 'http://stream128.melodiafm.spb.ru:8000/melodia128', icon: '🎵', genre: 'Мелодии' },
            { name: 'Радио Маяк', url: 'https://icecast-vgtrk.cdnvideo.ru/mayakfm_aac_64kbps', icon: '📡', genre: 'Ток-шоу' },
            { name: 'Радио Ретро Хит', url: 'http://air.volna.top/Retro', icon: '🕺', genre: 'Ретро' },
            { name: 'Fallout FM', url: 'http://fallout.fm:8000/falloutfm1.ogg', icon: '☢️', genre: '40-60s' },
            { name: 'Jazz FM 89.1', url: 'http://nashe1.hostingradio.ru/jazz-128.mp3', icon: '🎷', genre: 'Джаз' },
            { name: 'Супердискотека 90-х', url: 'https://radiorecord.hostingradio.ru/sd9096.aacp', icon: '🤘', genre: '90-е' },
            { name: 'Рекорд 00-х', url: 'https://radiorecord.hostingradio.ru/200096.aacp', icon: '💿', genre: '00-е' },
            { name: 'Record 80-х', url: 'https://radiorecord.hostingradio.ru/198096.aacp', icon: '📼', genre: '80-е' },
        ]
    },
    {
        category: '⚡ Radio Record (Energy)',
        stations: [
            { name: 'Record', url: 'https://radiorecord.hostingradio.ru/rr_main96.aacp', icon: '🎧', genre: 'Main' },
            { name: 'Russian Mix', url: 'https://radiorecord.hostingradio.ru/rus96.aacp', icon: '🇷🇺', genre: 'Dance' },
            { name: 'Techno', url: 'https://radiorecord.hostingradio.ru/techno96.aacp', icon: '🧱', genre: 'Techno' },
            { name: 'Hard Bass', url: 'https://radiorecord.hostingradio.ru/hbass96.aacp', icon: '👟', genre: 'Hard' },
            { name: 'Trancemission', url: 'https://radiorecord.hostingradio.ru/tm96.aacp', icon: '✨', genre: 'Trance' },
            { name: 'Pirate Station', url: 'https://radiorecord.hostingradio.ru/ps96.aacp', icon: '☠️', genre: 'D&B' },
            { name: 'Phonk', url: 'https://radiorecord.hostingradio.ru/phonk96.aacp', icon: '🏎️', genre: 'Phonk' },
            { name: 'Rock', url: 'https://radiorecord.hostingradio.ru/rock96.aacp', icon: '🎸', genre: 'Rock' },
        ]
    },
    {
        category: '🍃 Chill & Lounge',
        stations: [
            { name: 'Chill-Out', url: 'https://radiorecord.hostingradio.ru/chil96.aacp', icon: '🧘', genre: 'Chill' },
            { name: 'Chill House', url: 'https://radiorecord.hostingradio.ru/chillhouse96.aacp', icon: '🏠', genre: 'House' },
            { name: 'Ambient', url: 'https://radiorecord.hostingradio.ru/ambient96.aacp', icon: '🌫️', genre: 'Ambient' },
            { name: 'Lo-Fi', url: 'https://radiorecord.hostingradio.ru/lofi96.aacp', icon: '☕', genre: 'Lo-Fi' },
            { name: 'Симфония FM', url: 'https://radiorecord.hostingradio.ru/symph96.aacp', icon: '🎻', genre: 'Classic' },
            { name: 'Megamix', url: 'https://radiorecord.hostingradio.ru/mix96.aacp', icon: '🧪', genre: 'Mix' },
        ]
    },
    {
        category: '📻 Разное',
        stations: [
            { name: 'Русское Радио', url: 'https://rusradio.hostingradio.ru/rusradio128.mp3', icon: '🇷🇺', genre: 'Поп' },
            { name: 'Вести ФМ', url: 'http://icecast.vgtrk.cdnvideo.ru/vestifm_mp3_128kbps', icon: '📰', genre: 'Новости' },
            { name: 'Гоп FM', url: 'https://radiorecord.hostingradio.ru/gop96.aacp', icon: '🍺', genre: 'Разное' },
            { name: 'Веснушка FM', url: 'https://radiorecord.hostingradio.ru/deti96.aacp', icon: '🎈', genre: 'Детям' },
            { name: 'На шашлыки!', url: 'https://radiorecord.hostingradio.ru/nashashlyki96.aacp', icon: '🍖', genre: 'Вечеринка' },
        ]
    }
];

const presetBtn = document.getElementById('presetBtn');
const presetDropdown = document.getElementById('presetDropdown');
const presetList = document.getElementById('presetList');

// Наполняем dropdown
function buildPresetList() {
    presetList.innerHTML = '';
    PRESET_STATIONS.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.className = 'preset-category';
        catDiv.textContent = cat.category;
        presetList.appendChild(catDiv);

        cat.stations.forEach(st => {
            const item = document.createElement('div');
            item.className = 'preset-item';
            item.innerHTML = `
                <span class="radio-icon">${st.icon}</span>
                <span class="radio-name">${st.name}</span>
                <span class="radio-genre">${st.genre}</span>
            `;
            item.addEventListener('click', () => {
                const urlInput = document.getElementById('radioUrl');
                urlInput.value = st.url;
                radioUrl = st.url;
                saveSettings();
                closePresetDropdown();
                // Если радио уже играет — перезапускаем с новым URL
                if (isPlaying) {
                    stop();
                    setTimeout(() => start(), 300);
                }
            });
            presetList.appendChild(item);
        });
    });
}

function togglePresetDropdown() {
    const isOpen = presetDropdown.classList.contains('open');
    const parentPanel = presetBtn.closest('.glass-panel');
    if (isOpen) {
        closePresetDropdown();
    } else {
        presetDropdown.classList.add('open');
        presetBtn.classList.add('active');
        if (parentPanel) parentPanel.classList.add('top-priority');
    }
}

function closePresetDropdown() {
    presetDropdown.classList.remove('open');
    presetBtn.classList.remove('active');
    const parentPanel = presetBtn.closest('.glass-panel');
    if (parentPanel) parentPanel.classList.remove('top-priority');
}

presetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePresetDropdown();
});

// Закрытие по клику снаружи
document.addEventListener('click', (e) => {
    if (!presetDropdown.contains(e.target) && e.target !== presetBtn) {
        closePresetDropdown();
    }
});

buildPresetList();

// ====================================
// 1. localStorage
// ====================================
function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem('radioSavikSettings'));
        if (!saved) return;
        if (saved.radioUrl) {
            radioUrl = saved.radioUrl;
            document.getElementById('radioUrl').value = radioUrl;
        }
        if (saved.intervalMinutes) {
            intervalMinutes = saved.intervalMinutes;
            document.getElementById('interval').value = intervalMinutes;
        }
        if (saved.radioVolume !== undefined) {
            radioVolume = saved.radioVolume;
            const slider = document.getElementById('radioVolume');
            slider.value = Math.round(radioVolume * 100);
            updateSliderVisual(slider);
            document.getElementById('radioVolVal').textContent = Math.round(radioVolume * 100) + '%';
        }
        if (saved.adVolume !== undefined) {
            adVolume = saved.adVolume;
            const slider = document.getElementById('adVolume');
            slider.value = Math.round(adVolume * 100);
            updateSliderVisual(slider);
            document.getElementById('adVolVal').textContent = Math.round(adVolume * 100) + '%';
        }
    } catch (e) {
        console.warn('Ошибка загрузки настроек:', e);
    }
}

function saveSettings() {
    try {
        localStorage.setItem('radioSavikSettings', JSON.stringify({
            radioUrl,
            intervalMinutes,
            radioVolume,
            adVolume
        }));
    } catch (e) {
        console.warn('Ошибка сохранения настроек:', e);
    }
}

// ====================================
// 2. Поля ввода
// ====================================
document.getElementById('radioUrl').addEventListener('input', (e) => {
    radioUrl = e.target.value.trim();
    saveSettings();
});

document.getElementById('interval').addEventListener('input', (e) => {
    let val = parseFloat(e.target.value);
    intervalMinutes = (val && val > 0) ? val : 30;
    saveSettings();
});

// ====================================
// 3. Громкость
// ====================================
function updateSliderVisual(slider) {
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--val', pct + '%');
}

document.getElementById('radioVolume').addEventListener('input', (e) => {
    radioVolume = parseInt(e.target.value) / 100;
    document.getElementById('radioVolVal').textContent = e.target.value + '%';
    if (!isFading) radioPlayer.volume = radioVolume;
    updateSliderVisual(e.target);
    saveSettings();
});

document.getElementById('adVolume').addEventListener('input', (e) => {
    adVolume = parseInt(e.target.value) / 100;
    document.getElementById('adVolVal').textContent = e.target.value + '%';
    adPlayer.volume = adVolume;
    updateSliderVisual(e.target);
    saveSettings();
});

document.querySelectorAll('input[type="range"]').forEach(updateSliderVisual);

// ====================================
// 4. Drag & Drop
// ====================================
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');

    const droppedFiles = [];
    const items = e.dataTransfer.items;

    if (items) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                if (file && isAudioFile(file)) droppedFiles.push(file);
            }
        }
    } else {
        Array.from(e.dataTransfer.files).forEach(f => {
            if (isAudioFile(f)) droppedFiles.push(f);
        });
    }

    if (droppedFiles.length > 0) {
        adFiles = droppedFiles;
        currentAdIndex = 0;
        updateFileList();
        setStatus(`Загружено ${adFiles.length} рекламных роликов`, 'idle');
    }
});

dropZone.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'audio/*';
    input.onchange = handleFileSelect;
    input.click();
});

function isAudioFile(f) {
    return f.type.includes('audio') ||
        /\.(mp3|wav|ogg|aac|m4a|flac|wma)$/i.test(f.name);
}

// ====================================
// 5. Кнопки выбора файлов
// ====================================
document.getElementById('selectAdFolder').addEventListener('click', (e) => {
    e.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    input.accept = 'audio/*';
    input.onchange = handleFileSelect;
    input.click();
});

document.getElementById('selectAdFiles').addEventListener('click', (e) => {
    e.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'audio/mpeg,audio/mp3,audio/*';
    input.onchange = handleFileSelect;
    input.click();
});

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    adFiles = files.filter(f => isAudioFile(f));
    currentAdIndex = 0;
    updateFileList();
    setStatus(`Загружено ${adFiles.length} рекламных роликов`, 'idle');
}

function updateFileList() {
    document.getElementById('adCount').textContent = adFiles.length + ' файлов';
    fileList.innerHTML = '';
    adFiles.forEach((f, i) => {
        const div = document.createElement('div');
        div.className = 'file-item' + (i === currentAdIndex ? ' active' : '');
        div.innerHTML = `<span class="file-num">${String(i + 1).padStart(2, '0')}</span> ${f.name}`;
        fileList.appendChild(div);
    });
}

function highlightCurrentFile() {
    const items = fileList.querySelectorAll('.file-item');
    items.forEach((item, i) => {
        item.classList.toggle('active', i === currentAdIndex);
    });
    const active = fileList.querySelector('.file-item.active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ====================================
// 6. Старт / Стоп
// ====================================
document.getElementById('startBtn').addEventListener('click', start);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('stopBtn').addEventListener('click', stop);

function start() {
    radioUrl = document.getElementById('radioUrl').value.trim();
    if (!radioUrl) {
        alert('Укажите URL радио');
        return;
    }
    if (adFiles.length === 0) {
        // Автоматически открываем выбор папки file/
        autoPickFolder().then(() => {
            if (adFiles.length > 0) start(); // повторный запуск после загрузки файлов
        });
        return;
    }
    if (isPlaying) return;

    isPlaying = true;
    isPaused = false;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = '⏸ Пауза';

    radioPlayer.volume = radioVolume;
    adPlayer.volume = adVolume;
    radioPlayer.src = radioUrl;

    radioPlayer.play()
        .then(() => {
            setStatus('Радио играет', 'playing');
            scheduleAd();
        })
        .catch(err => {
            alert('Не удалось запустить радио. Проверьте URL.\n' + err.message);
            stop();
        });

    saveSettings();
}

// Автоматический выбор папки с рекламой
async function autoPickFolder() {
    // Пробуем современный File System Access API (Chrome/Edge)
    if (window.showDirectoryPicker) {
        try {
            setStatus('Выберите папку file/ с рекламой...', 'idle');
            const dirHandle = await window.showDirectoryPicker({ startIn: 'desktop' });
            const files = [];
            for await (const entry of dirHandle.values()) {
                if (entry.kind === 'file') {
                    const file = await entry.getFile();
                    if (isAudioFile(file)) files.push(file);
                }
            }
            if (files.length > 0) {
                adFiles = files;
                currentAdIndex = 0;
                updateFileList();
                setStatus(`Загружено ${adFiles.length} роликов из папки`, 'idle');
            } else {
                setStatus('В папке нет аудиофайлов', 'idle');
            }
            return;
        } catch (e) {
            if (e.name === 'AbortError') {
                setStatus('Выбор папки отменён', 'idle');
                return;
            }
            // Фолбэк на input
        }
    }

    // Фолбэк: обычный input с webkitdirectory
    return new Promise(resolve => {
        setStatus('Выберите папку file/ с рекламой...', 'idle');
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;
        input.accept = 'audio/*';
        input.onchange = (e) => {
            handleFileSelect(e);
            resolve();
        };
        // Если пользователь закрыл диалог без выбора
        input.addEventListener('cancel', () => {
            setStatus('Выбор папки отменён', 'idle');
            resolve();
        });
        input.click();
    });
}

function togglePause() {
    if (!isPlaying) return;

    if (!isPaused) {
        // ПАУЗА
        isPaused = true;
        pausedRemaining = Math.max(0, adEndTime - Date.now());
        clearTimeout(adTimerId);
        clearInterval(countdownId);
        radioPlayer.pause();
        adPlayer.pause();
        document.getElementById('pauseBtn').textContent = '▶ Продолжить';
        setStatus('Пауза', 'idle');
    } else {
        // ПРОДОЛЖИТЬ
        isPaused = false;
        document.getElementById('pauseBtn').textContent = '⏸ Пауза';

        // Возобновляем радио или рекламу
        if (adPlayer.src && adPlayer.currentTime > 0 && !adPlayer.ended) {
            adPlayer.play().catch(() => { });
            setStatus('Реклама играет', 'ad');
        } else {
            radioPlayer.play()
                .then(() => setStatus('Радио играет', 'playing'))
                .catch(() => { });
            // Восстанавливаем таймер с оставшимся временем
            adEndTime = Date.now() + pausedRemaining;
            adTimerId = setTimeout(playAd, pausedRemaining);
            startCountdown();
        }
    }
}

function stop() {
    isPlaying = false;
    isPaused = false;
    clearTimeout(adTimerId);
    clearInterval(countdownId);
    radioPlayer.pause();
    adPlayer.pause();
    radioPlayer.src = '';
    adPlayer.src = '';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = '⏸ Пауза';
    setStatus('Остановлено', 'idle');
    timerValue.textContent = '--:--';
    nowPlaying.classList.remove('visible');
}

// ====================================
// 7. Таймер + планирование
// ====================================
function scheduleAd() {
    if (!isPlaying) return;
    const ms = intervalMinutes * 60 * 1000;
    adEndTime = Date.now() + ms;
    adTimerId = setTimeout(playAd, ms);
    startCountdown();
}

function startCountdown() {
    clearInterval(countdownId);
    countdownId = setInterval(() => {
        if (!isPlaying) { clearInterval(countdownId); return; }
        const remaining = Math.max(0, adEndTime - Date.now());
        const totalSec = Math.ceil(remaining / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        timerValue.textContent =
            String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
        if (remaining <= 0) clearInterval(countdownId);
    }, 250);
}

// ====================================
// 8. Реклама с плавным fade
// ====================================
let isFading = false;

function fadeVolume(audioEl, fromVol, toVol, duration) {
    return new Promise(resolve => {
        isFading = true;
        const steps = FADE_STEPS;
        const stepTime = duration / steps;
        const volStep = (toVol - fromVol) / steps;
        let currentStep = 0;

        const fader = setInterval(() => {
            currentStep++;
            audioEl.volume = Math.max(0, Math.min(1, fromVol + volStep * currentStep));
            if (currentStep >= steps) {
                clearInterval(fader);
                audioEl.volume = Math.max(0, Math.min(1, toVol));
                isFading = false;
                resolve();
            }
        }, stepTime);
    });
}

function playAd() {
    if (!isPlaying || adFiles.length === 0) { scheduleAd(); return; }

    const adFile = adFiles[currentAdIndex];
    currentAdIndex = (currentAdIndex + 1) % adFiles.length;
    highlightCurrentFile();

    nowPlaying.textContent = '🎶 ' + adFile.name;
    nowPlaying.classList.add('visible');
    timerValue.textContent = '📢';
    setStatus(`Реклама: ${adFile.name}`, 'ad');

    // Fade out радио → пауза → реклама → resume → fade in
    fadeVolume(radioPlayer, radioVolume, 0, FADE_DURATION).then(() => {
        radioPlayer.pause();

        const url = URL.createObjectURL(adFile);
        adPlayer.volume = adVolume;
        adPlayer.src = url;

        adPlayer.play()
            .then(() => {
                adPlayer.onended = () => {
                    URL.revokeObjectURL(url);
                    nowPlaying.classList.remove('visible');
                    radioPlayer.volume = 0;
                    radioPlayer.play()
                        .then(() => {
                            fadeVolume(radioPlayer, 0, radioVolume, FADE_DURATION).then(() => {
                                setStatus('Радио играет', 'playing');
                                scheduleAd();
                            });
                        })
                        .catch(err => {
                            console.error('Не удалось возобновить радио:', err);
                            setStatus('Ошибка возобновления', 'idle');
                            stop();
                        });
                };
            })
            .catch(err => {
                console.error('Ошибка рекламы:', err);
                URL.revokeObjectURL(url);
                nowPlaying.classList.remove('visible');
                radioPlayer.volume = radioVolume;
                radioPlayer.play().catch(() => { });
                setStatus('Радио играет', 'playing');
                scheduleAd();
            });
    });
}

// ====================================
// 9. Статус
// ====================================
function setStatus(text, mode) {
    statusText.textContent = text;
    statusDot.className = 'status-indicator';
    statusText.className = 'status-text';
    if (mode === 'playing') {
        statusDot.classList.add('playing');
        statusText.classList.add('playing');
    } else if (mode === 'ad') {
        statusDot.classList.add('ad-playing');
        statusText.classList.add('ad-playing');
    }
}

// ====================================
// 10. Canvas — летающие неоновые линии
// ====================================
(function initCanvas() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const LINE_COUNT = 35;
    const lines = [];
    const colors = [
        'rgba(0, 212, 255, 0.08)',
        'rgba(123, 47, 247, 0.07)',
        'rgba(255, 45, 170, 0.05)',
        'rgba(0, 212, 255, 0.04)',
        'rgba(123, 47, 247, 0.04)',
    ];

    for (let i = 0; i < LINE_COUNT; i++) {
        lines.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: 100 + Math.random() * 300,
            angle: Math.random() * Math.PI * 2,
            speed: 0.15 + Math.random() * 0.4,
            rotSpeed: (Math.random() - 0.5) * 0.003,
            width: 1 + Math.random() * 2.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            drift: (Math.random() - 0.5) * 0.3,
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const line of lines) {
            line.x += Math.cos(line.angle) * line.speed + line.drift * 0.1;
            line.y += Math.sin(line.angle) * line.speed;
            line.angle += line.rotSpeed;

            const m = line.length;
            if (line.x < -m) line.x = canvas.width + m;
            if (line.x > canvas.width + m) line.x = -m;
            if (line.y < -m) line.y = canvas.height + m;
            if (line.y > canvas.height + m) line.y = -m;

            ctx.beginPath();
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.x + Math.cos(line.angle) * line.length,
                line.y + Math.sin(line.angle) * line.length);
            ctx.strokeStyle = line.color;
            ctx.lineWidth = line.width;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
        requestAnimationFrame(animate);
    }
    animate();
})();

// ====================================
// 11. Инициализация
// ====================================
loadSettings();
radioUrl = document.getElementById('radioUrl').value.trim();