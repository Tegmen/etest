class FullscreenManager {
    constructor() {
        this.fullscreenExits = [];
        this.currentExitStart = 0;
        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                this.handleFullscreenExit();
            } else {
                this.handleFullscreenEnter();
            }
        });
    }

    async enterFullscreen() {
        try {
            await document.documentElement.requestFullscreen();
            document.body.style.backgroundColor = '#e8f5e9';
        } catch (err) {
            console.error('Error attempting to enable fullscreen:', err);
        }
    }

    handleFullscreenExit() {
        // Show only control elements
        document.body.classList.add('fullscreen-exit');
        document.getElementById('test-content').style.display = 'none';
        document.getElementById('return-to-test').style.display = 'inline-block';
        
        this.currentExitStart = Date.now();
    }

    handleFullscreenEnter() {
        // Show all test content
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

    getFullscreenExits() {
        return this.fullscreenExits;
    }
}