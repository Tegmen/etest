class FullscreenManager {
    constructor() {
        this.fullscreenExits = [];
        this.focusLosses = [];
        this.currentExitStart = 0;
        this.currentFocusLossStart = 0;
        this.setupListeners();
    }

    setupListeners() {
        // Fullscreen change handler
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                this.handleFullscreenExit();
            } else {
                this.handleFullscreenEnter();
            }
        });

        // Window focus handlers
        window.addEventListener('focus', () => {
            if (document.fullscreenElement) {
                document.body.style.backgroundColor = '#e8f5e9'; // green
                this.handleFocusReturn();
            }
        });

        window.addEventListener('blur', () => {
            if (document.fullscreenElement) {
                document.body.style.backgroundColor = '#ffebee'; // red
                this.handleFocusLoss();
            }
        });

        // Visibility change handler for additional focus detection
        document.addEventListener('visibilitychange', () => {
            if (document.fullscreenElement) {
                if (document.hidden) {
                    document.body.style.backgroundColor = '#ffebee'; // red
                    this.handleFocusLoss();
                } else {
                    document.body.style.backgroundColor = '#e8f5e9'; // green
                    this.handleFocusReturn();
                }
            }
        });
    }

    async enterFullscreen() {
        try {
            await document.documentElement.requestFullscreen();
            document.body.style.backgroundColor = '#e8f5e9'; // green
        } catch (err) {
            console.error('Error attempting to enable fullscreen:', err);
        }
    }

    handleFullscreenExit() {
        document.body.classList.add('fullscreen-exit');
        document.getElementById('test-content').style.display = 'none';
        document.getElementById('return-to-test').style.display = 'inline-block';
        
        this.currentExitStart = Date.now();
    }

    handleFullscreenEnter() {
        document.body.classList.remove('fullscreen-exit');
        document.getElementById('test-content').style.display = 'block';
        document.getElementById('return-to-test').style.display = 'none';
        
        if (this.currentExitStart > 0) {
            this.fullscreenExits.push({
                exitTime: this.currentExitStart,
                duration: Date.now() - this.currentExitStart
            });
            this.currentExitStart = 0;
        }
    }

    handleFocusLoss() {
        if (!this.currentFocusLossStart) {
            this.currentFocusLossStart = Date.now();
        }
    }

    handleFocusReturn() {
        if (this.currentFocusLossStart > 0) {
            this.focusLosses.push({
                lostFocusAt: this.currentFocusLossStart,
                duration: Date.now() - this.currentFocusLossStart
            });
            this.currentFocusLossStart = 0;
        }
    }

    getFocusLosses() {
        // If focus is currently lost, add the ongoing loss
        if (this.currentFocusLossStart > 0) {
            this.handleFocusReturn();
            this.currentFocusLossStart = Date.now();
        }
        return this.focusLosses;
    }

    getFullscreenExits() {
        return this.fullscreenExits;
    }
}