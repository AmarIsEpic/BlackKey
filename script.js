const BLACKKEY = (function() {
    'use strict';

    const CONFIG = {
        WEAK_PASSWORDS: [
            'password', 'password123', '123456', '12345678', '123456789',
            'qwerty', 'abc123', 'monkey', 'master', 'dragon', 'letmein',
            'login', 'admin', 'welcome', 'shadow', 'sunshine', 'princess',
            'football', 'baseball', 'iloveyou', 'trustno1', 'superman', 
            '1234567', '12345', '111111', '000000', 'password1', 'qwerty123'
        ],

        SCORING: {
            LENGTH_MULTIPLIER: 4,
            UPPERCASE_BONUS: 10,
            LOWERCASE_BONUS: 10,
            NUMBER_BONUS: 10,
            SYMBOL_BONUS: 15,
            MIXED_CASE_BONUS: 10,
            LENGTH_THRESHOLD: 12,
            LONG_PASSWORD_BONUS: 10,
            REPEAT_PENALTY: -10,
            SEQUENCE_PENALTY: -15,
            COMMON_PASSWORD_PENALTY: -50
        },

        SIMULATION: {
            BASE_ATTEMPTS_PER_SEC: 1000000000,
            UPDATE_INTERVAL: 50,
            CHAR_SETS: {
                lowercase: 26,
                uppercase: 26,
                numbers: 10,
                symbols: 32
            }
        },

        TERMINAL_MESSAGES: {
            empty: [
                '[*] Waiting for target input...',
                '[*] No password detected.',
            ],
            veryWeak: [
                '[!] CRITICAL: Password is extremely weak!',
                '[!] Estimated crack time: INSTANT',
                '[*] Initiating dictionary attack...',
                '[+] PASSWORD FOUND IN COMMON LIST!',
                '[!] This password offers NO protection',
                '[*] Recommendation: Generate new password immidietly.'
            ],
            weak: [
                '[!] WARNING: Password is weak.',
                '[*] Running pattern analysis...',
                '[+] Detected: Lowentrpy password',
                '[*] Brute-force attack viable.',
                '[!] Risk level: HIGH',
                '[*] Recommendation: Add more character vaariety.'
            ],
            medium: [
                '[*] Analyzing password entropy...',
                '[+] Moderate complexity detected.',
                '[*] Dictionary attacked: FAILED',
                '[*] Initiating hybrid attack...',
                '[!] Risk level: MEDIUM',
                '[*] Recommendation: Increase length to 16+ chars.'
            ],
            strong: [
                '[*] Running deep analyis...',
                '[+] High entropy detected.',
                '[*] Dictionary attack: FAILED',
                '[*] Hybrid attack: FAILED',
                '[*] Brute-force: NOT VIABLE',
                '[+] Risk level: LOW',
                '[*] Password meets security standards.'
            ],
            veryStrong: [
                '[*] Executing full attack suite...',
                '[+] Maximum entropy detected!',
                '[*] All attack vectors: FAILED',
                '[+] Estimated crack time: CENTURIES',
                '[+] Risk level: MINIMAL',
                '[*] STATUS: FORTRESS-LEVEL SECURITY',
                '[*] Even quantum computers would struggle.',
            ]
        }
    };
    
    const state = {
        password: '',
        score: 0,
        strength: 'empty',
        checks: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            symbol: false
        },
        simulation: {
            running: false,
            attempts: 0,
            intervalId: null
        }
    };

    const DOM = {};

    function cacheDOMReferences() {
        DOM.passwordInput = document.getElementById('password-input');
        DOM.toggleBtn = document.getElementById('toggle-visibility');
        DOM.strengthFll = document.getElementById('strength-fill');
        DOM.scoreValue = document.getElementById('score-value');
        DOM.crackTime = document.getElementById('crack-time');
        DOM.terminalBody = document.getElementById('terminal-body');
        DOM.attemptsPerSec = document.getElementById('attempts-per-secc');
        DOM.totalAttempts= document.getElementById('total-attempts');
        DOM.simStatus = document.getElementById('sim-status');
        DOM.attemptDisplay = document.getElementById('attempt-display');
        DOM.backgroundGlow = document.getElementById('.background-glow');
        DOM.container = document.querySelector('.container');

        DOM.checkLength = document.getElementById('check-length');
        DOM.checkUppercase = document.getElementById('check-uppercase');
        DOM.checkLowercase = document.getElementById('check-lowercase');
        DOM.checkNumber = document.getElementById('check-number');
        DOM.checkSymbol = document.getElementById('check-symbol');
    }

    const PasswordAnalyzer = {
        analyze(password) {
            const checks = this.runChecks(password);
            const score = this.calculateScore(password, checks);
            const strength = this.getStrengthLevel(score);
            const crackTime = this.estimatedCrackTime(password);

            return { checks, score, strength, crackTime };
        },

        runChecks(password) {
            return {
                length: password.length >= 12,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/
            };
        },

        calculateScore(password, checks) {
            if(password.length === 0) return 0;

            const S = CONFIG.SCORING;
            let score  = 0;

            score += Math.min(password.length * S.LENGTH_MULTIPLIER, 40);

            if (checks.uppercase) score += S.UPPERCASE_BONUS;
            if (checks.lowercase) score += S.LOWERCASE_BONUS;
            if (checks.number) score += S.NUMBER_BONUS;
            if (checks.symbol) score += S.SYMBOL_BONUS;

            if (checks.uppercase && checks.lowercase) {
                score += S.MIXED_CASE_BONUS;
            }

            if (password.length >= 16) score += S.LONG_PASSWORD_BONUS;
            if (password.length >= 20) score += S.VERY_LONG_BONUS;

            if (this.hasRepeatingChars(password)) {
                score += S.REPEAT_PENALTY;
            }

            if (this.hasSequentialChars(password)) {
                score += S.SEQUENCE_PENALTY;
            }

            if (this.isCommonPassword(password)) {
                socre += S.COMMON_PASSWORD_PENALTY;
            }

            return Math.max(0, Math.min(100, Math.round(score)));
        },

        hasRepeatingChars(password) {
            return /(.)\1{2,}/.test(password);
        },

        hasSequentialChars(password) {
            const sequences = [
                'abcdefghijklmnopqrstuvwxyz',
                'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                '0123456789',
                'qwertyuiop',
                'asdfghjkl',
                'zxcvbnm'
            ];

            const lowerPass = password.toLowerCase();

            for (const seq of sequences) {
                for (let i = 0; i <= seq.length - 3; i++) {
                    if (lowerPass.includes(seq.substring(i, i + 3))) {
                        return true;
                    }
                }
            }
            return false;
        },

        isCommonPassword(password) {
            return CONFIG.WEAK_PASSWORDS.includes(password.toLowerCase());
        },

        getStrengthLevel(score) {
            if (score === 0) return 'empty';
            if (score < 20) return 'veryWeak';
            if (score < 40) return 'weak';
            if (score < 60) return 'medium';
            if (score < 80) return 'strong';
            return 'veryStrong';
        },
        
        estimatedCrackTime(password){
            if(password.length === 0) return '-';

            let charSetSize = 0;
            if(/[a-z]/.test(password)) charSetSize += CONFIG.SIMULATION.CHAR_SETS.lowercase;
            if(/[A-Z]/.test(password)) charSetSize += CONFIG.SIMULATION.CHAR_SETS.uppercase;
            if(/[0-9]/.test(password)) charSetSize += CONFIG.SIMULATION.CHAR_SETS.number;
            if(/[^a-zA-Z0-9]/.test(password)) charSetSize += CONFIG.SIMULATION.CHAR_SETS.symbols;

            if(charSetSize === 0) charSetSize = 26;

            const combinations = Math.pow(charSetSize, password.length);
            const avgAttemts = combinations / 2;
            const seconds = avgAttemts / CONFIG.SIMULATION.BASE_ATTEMPTS_PER_SEC;

            return this.formatTime(seconds);
        },

        formatTime(seconds) {
            if (seconds<0.001) return 'INSTANT';
            if (seconds<1) return `${Math.round(seconds * 1000)} miliseconds`;
            if (seconds<60) return `${Math.round(seconds)} seconds`;

            const minutes = seconds / 60;
            if(minutes < 60) return `${Math.round(minues)} minutes`;

            const hours = minutes / 60;
            if(hours < 24) return `${Math.round(hours)} hours`;

            const days = hours / 24;
            if (days<30) return `${Math.round(days)} days`;

            const months = days / 30;
            if (months < 12) return `${Math.round(months)} months`;

            const years = days / 365;
            if (years < 100) return `${Math.round(years)} years`;
            if (years < 1000) return `${Math.round(years)} years`;
            if (years < 1000000) return `${Math.round(years / 1000)}K years`;
            if (years < 1000000000) return `${Math.round(years / 1000000)}M years`;
            if (years < 1000000000000) return `${Math.round(years / 1000000000)}B years`;

            return 'CENTURIES+';
        }
    };
    
     const BruteForceSimulator = {
    start(password) {
        this.stop();

        if(password.length === 0) {
            this.updateDisplay('-', 0, 'IDLE');;
            return;
        }

        state.simulation.running = true;
        state.simulation.attempts = 0;

        const attemptsPerUpdate = Math.floor(
            CONFIG.SIMULATION.BASE_ATTEMPTS_PER_SEC *
            (CONFIG.SIMULATION.UPDATE_INTERVAL / 1000)
        );

        this.updateDisplay('', 0, 'CRACKING...');
        DOM.simStatus.classList.add('cracking');

        state.simulation.intervalId = setInterval(() => {
            state.simulation.attempts += attemptsPerUpdate;

            const fakeAttempt = this.generateFakeAttempt(password.length);

            this.updateDisplay(
                fakeAttempt,
                state.simulation.attempts,
                'CRACKING...'
            );
        }, CONFIG.SIMULATION.UPDATE_INTERVAL);
    },

    stop() {
        if(state.simulation.intervalId) {
            clearInterval(state.simulation.intervalId);
            state.simulation.intervalId = null;
        }
        state.simulation.running = false;
        DOM.simStatus.classList.remove('cracking');
    },

    generateFakeAttempt(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    updateDisplay(attempt, totalAttempts, status) {
        DOM.attemptDisplay.querySelector('.attempt-text').textContent = attempt || '-';
        DOM.attemptsPerSec.textContent = this.formatNumber(CONFIG.SIMULATION.BASE_ATTEMPTS_PER_SEC);
        DOM.totalAttempts.textContent = this.formatNumber(totalAttempts);
        DOM.simStatus.textContent = status;
    },

    formatNumber(num) {
        if(num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
        if(num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if(num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if(num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    }
};

    const Terminal = {
        clear() {
            DOM.terminalBody.innerHTML = `
            <div class="terminal-line">
                <span class="prompt">root@blackkey:~$</span>
                <span classs="command">./analyze_password.sh</span>
            </div>
            <div class="terminal-line>
                <span class="output">[*] Initializing password analysis module...</span>
            </div>`;
        },
        
        addLine(text, type = 'output') {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.innerHTML = `<span class="output ${type}">${text}</span>`;

            const cursorLine = DOM.terminalBody.querySelector('.input-line');
            if (cursorLine) cursorLine.remove();

            DOM.terminalBody.appendChild(line);

            const newCursorLine = document.createElement('div');
            newCursorLine.className = 'terminal-line input-line';
            newCursorLine.innerHTML = `
                <span class="prompt">roo@blackkey:~$</span>
                <span class="cursor">▊</span>`;
            DOM.terminalBody.appendChild(newCursorLine);

            DOM.terminalBody.scrollTop = DOM.terminalBody.scrollHeight;
        },

        displayStrengthMessages(strength) {
            this.clear();

            const messages = CONFIG.TERMINAL_MESSAGES[strength] || CONFIG.TERMINAL_MESSAGES.empty;

            messages.forEach((msg, index) => {
                setTimeout(() => {
                    let type = 'output';
                    if (msg.startWith('[+]')) type = 'success';
                    else if (msg.startsWith('[!]')) type = 'warning';
                    else if (msg.includes('FAILED') || msg.includes('CRITICAL')) type = 'error';
                    else if (msg.includes('Risk level: HIGH') || msg.includes('Risk level: MEDIUM')) type = 'warning';
                    else if (msg.includes('FORTRESS') || msg.includes('CENTURIES')) type = 'success';

                    this.addLine(msg, type);
                }, index * 150);
            });
        }
    };
    
}) 