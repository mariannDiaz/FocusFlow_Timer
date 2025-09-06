// DOM elements
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const pomodoroBtn = document.getElementById('pomodoro-btn');
const shortBreakBtn = document.getElementById('short-break-btn');
const longBreakBtn = document.getElementById('long-break-btn');
const pomodoroCountDisplay = document.getElementById('pomodoro-count');
const modeButtons = document.querySelectorAll('.mode-btn');

// State variables
let intervalId = null;
let mode = 'pomodoro';
let timeLeft = 25 * 60;
let pomodoroCount = 0;
let isPaused = true;

const timerLengths = {
    'pomodoro': 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60,
};

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

function setMode(newMode) {
    mode = newMode;
    timeLeft = timerLengths[mode];
    isPaused = true;
    
    modeButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${mode}-btn`).classList.add('active');

    updateDisplay();
    
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    resetBtn.classList.add('hidden');
    clearInterval(intervalId);
    intervalId = null;
}

function startTimer() {
    if (intervalId) return;
    isPaused = false;
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    resetBtn.classList.remove('hidden');

    intervalId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            // Timer finished
            clearInterval(intervalId);
            intervalId = null;

            if (mode === 'pomodoro') {
                pomodoroCount++;
                pomodoroCountDisplay.textContent = pomodoroCount;
                if (pomodoroCount % 4 === 0) {
                    setMode('long-break');
                } else {
                    setMode('short-break');
                }
            } else {
                setMode('pomodoro');
            }
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(intervalId);
    intervalId = null;
    isPaused = true;
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
}

function resetTimer() {
    clearInterval(intervalId);
    intervalId = null;
    isPaused = true;
    timeLeft = timerLengths[mode];
    updateDisplay();
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    resetBtn.classList.add('hidden');
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
pomodoroBtn.addEventListener('click', () => setMode('pomodoro'));
shortBreakBtn.addEventListener('click', () => setMode('short-break'));
longBreakBtn.addEventListener('click', () => setMode('long-break'));

// Initial setup
updateDisplay();
