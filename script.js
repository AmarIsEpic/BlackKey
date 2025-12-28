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
        }
    }
})