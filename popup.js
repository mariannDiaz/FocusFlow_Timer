// DOM elements
const pomodoroScreen = document.getElementById('pomodoro-screen');
const settingsScreen = document.getElementById('settings-screen');
const graphsScreen = document.getElementById('graphs-screen');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const settingsBtn = document.getElementById('settings-btn');
const graphsBtn = document.getElementById('graphs-btn');
const closeSettingsBtn = document.getElementById('close-settings');
const closeGraphsBtn = document.getElementById('close-graphs');
const pomodoroCountDisplay = document.getElementById('pomodoro-count');
const modeText = document.getElementById('mode-text');
const upArrowBtn = document.getElementById('up-arrow');
const downArrowBtn = document.getElementById('down-arrow');
const totalSessionsGraph = document.getElementById('total-sessions-graph');
const congratsScreen = document.getElementById('congratulations-screen');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const lightModeIcon = document.getElementById('light-mode-icon');
const darkModeIcon = document.getElementById('dark-mode-icon');
const body = document.body;

// State variables
let intervalId = null;
let mode = 'pomodoro';
let timeLeft = 25 * 60;
let isPaused = true;
let pomodoroCount = 0;
let sessionHistory = JSON.parse(localStorage.getItem('sessionHistory')) || [];

// Constants for timer modes
const timerModes = ['pomodoro', 'short-break', 'long-break'];
let currentModeIndex = 0;

// Default timer lengths from local storage or fallbacks
let timerLengths = JSON.parse(localStorage.getItem('timerLengths')) || {
    'pomodoro': 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60,
};

let dailyGoal = parseInt(localStorage.getItem('dailyGoal')) || 3;

// UI State
let isDarkMode = localStorage.getItem('isDarkMode') === 'true';

// Function to update the timer display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

// Function to switch between screens
const allScreens = [pomodoroScreen, settingsScreen, graphsScreen, congratsScreen];
function showScreen(screen) {
    allScreens.forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Function to apply the correct theme
function applyTheme() {
    body.classList.toggle('light-mode', !isDarkMode);
    if (isDarkMode) {
        darkModeIcon.style.display = 'inline';
        lightModeIcon.style.display = 'none';
    } else {
        darkModeIcon.style.display = 'none';
        lightModeIcon.style.display = 'inline';
    }
}

// Function to toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('isDarkMode', isDarkMode);
    applyTheme(); // Call the new function to update the UI
}

// Function to update pomodoro count and check for daily goal
function updatePomodoroCount() {
    pomodoroCount++;
    localStorage.setItem('pomodoroCount', pomodoroCount);
    pomodoroCountDisplay.textContent = pomodoroCount;

    if (pomodoroCount >= dailyGoal) {
        showScreen(congratsScreen);
    }
}

// Function to set the timer mode
function setMode(newMode) {
    mode = newMode;
    isPaused = true;
    timeLeft = timerLengths[mode];
    updateDisplay();
    modeText.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    
    // Hide/show buttons based on the mode
    if (mode === 'pomodoro') {
        startBtn.style.display = 'block';
        pauseBtn.style.display = 'none';
        resetBtn.style.display = 'none';
    } else {
        startBtn.style.display = 'block';
        pauseBtn.style.display = 'none';
        resetBtn.style.display = 'block';
    }
}

// Function to start the timer
function startTimer() {
    if (intervalId) return;
    isPaused = false;
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'block';
    resetBtn.style.display = 'block';
    
    // Store session start time for history
    const sessionStartTime = new Date();

    intervalId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            clearInterval(intervalId);
            intervalId = null;
            
            // Record session completion
            const sessionEndTime = new Date();
            const sessionDuration = (sessionEndTime - sessionStartTime) / 1000;
            sessionHistory.push({ mode, duration: sessionDuration, date: new Date().toISOString() });
            localStorage.setItem('sessionHistory', JSON.stringify(sessionHistory));
            
            // Notification
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Pomodoro Timer', {
                        body: `Your ${mode} session has ended!`,
                        icon: 'icon128.png'
                    });
                }
            });

            // Switch to next mode
            if (mode === 'pomodoro') {
                updatePomodoroCount();
                currentModeIndex = pomodoroCount % 4 === 0 ? 2 : 1; // Long break every 4 pomodoros
            } else {
                currentModeIndex = 0; // Always return to pomodoro after a break
            }
            setMode(timerModes[currentModeIndex]);
        }
    }, 1000);
}

// Function to pause the timer
function pauseTimer() {
    clearInterval(intervalId);
    intervalId = null;
    isPaused = true;
    startBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
}

// Function to reset the timer
function resetTimer() {
    clearInterval(intervalId);
    intervalId = null;
    isPaused = true;
    timeLeft = timerLengths[mode];
    updateDisplay();
    startBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
    resetBtn.style.display = 'none';
}

// Functions to navigate modes with the spinner
function nextMode() {
    currentModeIndex = (currentModeIndex + 1) % timerModes.length;
    setMode(timerModes[currentModeIndex]);
}

function prevMode() {
    currentModeIndex = (currentModeIndex - 1 + timerModes.length) % timerModes.length;
    setMode(timerModes[currentModeIndex]);
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

settingsBtn.addEventListener('click', () => showScreen(settingsScreen));
graphsBtn.addEventListener('click', () => showScreen(graphsScreen));
closeSettingsBtn.addEventListener('click', () => showScreen(pomodoroScreen));
closeGraphsBtn.addEventListener('click', () => showScreen(pomodoroScreen));
darkModeToggle.addEventListener('click', toggleDarkMode);

upArrowBtn.addEventListener('click', nextMode);
downArrowBtn.addEventListener('click', prevMode);

// Event listeners for settings inputs
document.getElementById('pomodoro-length-input').addEventListener('change', (e) => {
    timerLengths.pomodoro = e.target.value * 60;
    localStorage.setItem('timerLengths', JSON.stringify(timerLengths));
    if (mode === 'pomodoro') setMode('pomodoro');
});

document.getElementById('long-break-length-input').addEventListener('change', (e) => {
    timerLengths['long-break'] = e.target.value * 60;
    localStorage.setItem('timerLengths', JSON.stringify(timerLengths));
    if (mode === 'long-break') setMode('long-break');
});

document.getElementById('short-break-length-input').addEventListener('change', (e) => {
    timerLengths['short-break'] = e.target.value * 60;
    localStorage.setItem('timerLengths', JSON.stringify(timerLengths));
    if (mode === 'short-break') setMode('short-break');
});

document.getElementById('daily-goal-input').addEventListener('change', (e) => {
    dailyGoal = parseInt(e.target.value);
    localStorage.setItem('dailyGoal', dailyGoal);
});

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    setMode('pomodoro');
    pomodoroCount = parseInt(localStorage.getItem('pomodoroCount')) || 0;
    pomodoroCountDisplay.textContent = pomodoroCount;
    // Apply the correct theme on page load
    applyTheme();
    // Request permission for notifications
    Notification.requestPermission();
});
