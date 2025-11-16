// ambience.js - Premium Restaurant Ambience Experience
class AmbienceExperience {
    constructor() {
        this.currentTheme = 'default';
        this.ambientSoundActive = false;
        this.ambientAudio = null;
        this.currentView = 'restaurant';
        this.isPlayingMusic = false;
        this.musicAudio = null;
        this.volumeLevel = 0.5;
        this.isDarkTheme = false;

        this.init();
    }

    async init() {
        this.cacheDOM();
        this.bindEvents();
        this.syncTheme();
        this.loadUserPreferences();
        this.initAmbientSound();
        this.initMusicPlayer();
       

        if (this.loadingScreen) this.hideLoadingScreen();
    }

    // ✅ Sync theme based on saved preference
    syncTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (this.themeToggle) this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            this.isDarkTheme = true;
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (this.themeToggle) this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            this.isDarkTheme = false;
        }
    }

    // ✅ Toggle Theme (Single Final Version)
    toggleDarkTheme(forceDark = null) {
        this.isDarkTheme = forceDark !== null ? forceDark : !this.isDarkTheme;

        if (this.isDarkTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (this.themeToggle) this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (this.themeToggle) this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    }


    cacheDOM() {
        // Theme Sections
        this.themeSections = document.querySelectorAll('.theme-section');
        this.themeButtons = document.querySelectorAll('.theme-btn');

        // Audio Controls
        this.ambientSoundBtn = document.getElementById('ambientSound');
        this.musicPlayerBtn = document.getElementById('musicPlayer');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeDisplay = document.getElementById('volumeDisplay');

        // View Controls
        this.viewButtons = document.querySelectorAll('.view-btn');
        this.galleryGrid = document.getElementById('galleryGrid');
        this.virtualTour = document.getElementById('virtualTour');

        // Music Player
        this.musicControls = document.getElementById('musicControls');
        this.playPauseBtn = document.getElementById('playPause');
        this.prevTrackBtn = document.getElementById('prevTrack');
        this.nextTrackBtn = document.getElementById('nextTrack');
        this.trackInfo = document.getElementById('trackInfo');
        this.progressBar = document.getElementById('progressBar');

        // Theme Toggle
        this.themeToggle = document.getElementById('themeToggle');

        // Loading
        this.loadingScreen = document.getElementById('loadingScreen');

        // Toast
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        // Theme Selection
        this.themeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTheme(e.currentTarget.dataset.theme);
            });
        });

        // View Controls
        this.viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.currentTarget.dataset.view);
            });
        });

        

        // Gallery Image Click
        if (this.galleryGrid) {
            this.galleryGrid.addEventListener('click', (e) => {
                const img = e.target.closest('.gallery-item');
                if (img) this.openImageModal(img.src, img.alt);
            });
        }

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleDarkTheme());
        }


        // Keyboard Controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    loadUserPreferences() {
        const savedTheme = localStorage.getItem('ambienceTheme');
        if (savedTheme) this.currentTheme = savedTheme;

        const savedView = localStorage.getItem('ambienceView');
        if (savedView) this.currentView = savedView;

        const savedVolume = localStorage.getItem('ambienceVolume');
        if (savedVolume) this.volumeLevel = parseFloat(savedVolume);

        const savedDarkTheme = localStorage.getItem('theme');
        if (savedDarkTheme === 'dark') this.toggleDarkTheme(true);
    }

    switchTheme(theme) {
        this.currentTheme = theme;

        // Update UI
        this.themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });

        this.themeSections.forEach(section => {
            section.classList.toggle('active', section.dataset.theme === theme);
        });

        // Update ambient sound based on theme
        this.updateAmbientSoundForTheme(theme);

        // Save preference
        localStorage.setItem('ambienceTheme', theme);

        this.showToast(`Switched to ${theme} theme`);
    }

    switchView(view) {
        this.currentView = view;

        // Update UI
        this.viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Show/hide sections based on view
        if (this.galleryGrid) this.galleryGrid.style.display = view === 'gallery' ? 'grid' : 'none';
        if (this.virtualTour) this.virtualTour.style.display = view === 'tour' ? 'block' : 'none';

        // Initialize virtual tour if needed
        if (view === 'tour') this.initVirtualTour();

        localStorage.setItem('ambienceView', view);
    }

    initAmbientSound() {
        this.ambientAudio = new Audio('assets/audio/restaurant-ambience.mp3');
        this.ambientAudio.loop = true;
        this.ambientAudio.volume = this.volumeLevel * 0.3; // Lower volume for ambient

        // Load saved state
        const savedAmbient = localStorage.getItem('ambientSound');
        if (savedAmbient === 'true') {
            this.ambientSoundActive = true;
            this.playAmbientSound();
        }
    }

    updateAmbientSoundForTheme(theme) {
        if (!this.ambientAudio) return;

        const themeSounds = {
            'default': 'assets/audio/restaurant-ambience.mp3',
            'garden': 'assets/audio/garden-ambience.mp3',
            'romantic': 'assets/audio/romantic-ambience.mp3',
            'luxury': 'assets/audio/luxury-ambience.mp3'
        };

        if (themeSounds[theme]) {
            this.ambientAudio.pause();
            this.ambientAudio.src = themeSounds[theme];
            if (this.ambientSoundActive) {
                this.ambientAudio.play().catch(console.warn);
            }
        }
    }

    toggleAmbientSound() {
        if (this.ambientSoundActive) {
            this.pauseAmbientSound();
        } else {
            this.playAmbientSound();
        }
    }

    playAmbientSound() {
        if (this.ambientAudio) {
            this.ambientAudio.play().catch(e => {
                console.warn('Ambient sound play failed:', e);
            });
            this.ambientSoundActive = true;
            this.ambientSoundBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.ambientSoundBtn.classList.add('active');
            localStorage.setItem('ambientSound', 'true');
        }
    }

    pauseAmbientSound() {
        if (this.ambientAudio) {
            this.ambientAudio.pause();
            this.ambientSoundActive = false;
            this.ambientSoundBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.ambientSoundBtn.classList.remove('active');
            localStorage.setItem('ambientSound', 'false');
        }
    }

    

    handleKeyboard(e) {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.toggleMusic();
                break;
            case 'ArrowRight':
                this.nextTrack();
                break;
            case 'ArrowLeft':
                this.previousTrack();
                break;
            case 'Escape':
                this.toggleMusicPlayer();
                break;
        }
    }

    hideLoadingScreen() {
        if (!this.loadingScreen) return;
        setTimeout(() => {
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => (this.loadingScreen.style.display = 'none'), 500);
        }, 1000);
    }

    showToast(message, duration = 3000) {
        if (!this.toast) return;
        this.toast.textContent = message;
        this.toast.classList.add('active');
        setTimeout(() => this.toast.classList.remove('active'), duration);
    }
}

// Initialize Ambience Experience
// ✅ Initialize Ambience Experience and Handle Mobile Nav Scroll
let ambienceExperience;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the main ambience experience
    ambienceExperience = new AmbienceExperience();

    // ✅ Handle mobile nav hide/show on scroll
    // const mobileNav = document.querySelector('.mobile-nav');
    // if (mobileNav) {
    //     let lastScrollY = window.scrollY;

    //     window.addEventListener('scroll', () => {
    //         if (window.scrollY > lastScrollY) {
    //             // Scrolling down → hide nav
    //             mobileNav.classList.add('hide');
    //         } else {
    //             // Scrolling up → show nav
    //             mobileNav.classList.remove('hide');
    //         }
    //         lastScrollY = window.scrollY;
    //     });
    // }
});


