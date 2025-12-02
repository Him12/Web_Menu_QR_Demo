// game-controller.js
class GameController {
    constructor() {
        this.arrowControls = null;
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        if (this.isMobile) {
            this.createController();
            this.addEventListeners();
        }
    }

    createController() {
        // Create controller HTML
        const controllerHTML = `
            <div class="game-controller" id="game-controller">
                <div class="controller-grid">
                    <button class="controller-btn arrow-up" data-action="up">↑</button>
                    <button class="controller-btn arrow-left" data-action="left">←</button>
                    <button class="controller-btn arrow-down" data-action="down">↓</button>
                    <button class="controller-btn arrow-right" data-action="right">→</button>
                </div>
                <div class="action-buttons">
                    <button class="controller-btn action-btn" data-action="actionA">A</button>
                    <button class="controller-btn action-btn" data-action="actionB">B</button>
                    <button class="controller-btn action-btn" data-action="start">Start</button>
                </div>
            </div>
        `;

        // Add to body
        document.body.insertAdjacentHTML('beforeend', controllerHTML);
        this.arrowControls = document.getElementById('game-controller');
    }

    addEventListeners() {
        const buttons = this.arrowControls.querySelectorAll('.controller-btn');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleButtonPress(button.dataset.action);
                button.classList.add('active');
            });

            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.classList.remove('active');
            });

            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                button.classList.remove('active');
            });
        });
    }

    handleButtonPress(action) {
        // Create custom event for game actions
        const event = new CustomEvent('gameControl', {
            detail: { action }
        });
        window.dispatchEvent(event);
    }

    // Method to enable/disable specific buttons
    setButtonState(action, enabled) {
        const button = this.arrowControls?.querySelector(`[data-action="${action}"]`);
        if (button) {
            button.disabled = !enabled;
            button.style.opacity = enabled ? '1' : '0.5';
        }
    }

    // Method to show/hide controller
    show() {
        if (this.arrowControls) {
            this.arrowControls.style.display = 'block';
        }
    }

    hide() {
        if (this.arrowControls) {
            this.arrowControls.style.display = 'none';
        }
    }

    // Cleanup method
    destroy() {
        if (this.arrowControls) {
            this.arrowControls.remove();
            this.arrowControls = null;
        }
    }
}

// Global controller instance
window.gameController = new GameController();