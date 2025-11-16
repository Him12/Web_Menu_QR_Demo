// story.js - Premium Restaurant Story Experience
class StoryExperience {
  constructor() {
    this.currentChapter = 0;
    this.totalChapters = 0;
    this.autoPlay = false;
    this.autoPlayInterval = null;
    this.isPlayingAudio = false;
    this.audioElement = null;
    this.isDarkTheme = false;
    this.parallaxEnabled = true;

    this.init();
  }

  async init() {
    this.cacheDOM();
    this.bindEvents();
    await this.loadUserPreferences();
    this.syncTheme();
    this.initChapters();
    this.initAudio();
    this.initParallax();
    this.initScrollAnimations();

    if (this.loadingScreen) this.hideLoadingScreen();
  }

  cacheDOM() {
    this.chapterNav = document.getElementById('chapterNav');
    this.prevChapter = document.getElementById('prevChapter');
    this.nextChapter = document.getElementById('nextChapter');
    this.chapterIndicators = document.querySelectorAll('.chapter-indicator');
    this.chapterTitle = document.getElementById('chapterTitle');
    this.chapterContent = document.getElementById('chapterContent');
    this.chapterMedia = document.getElementById('chapterMedia');
    this.chapterYear = document.getElementById('chapterYear');
    this.autoPlayBtn = document.getElementById('autoPlay');
    this.audioPlayBtn = document.getElementById('audioPlay');
    this.timelineProgress = document.getElementById('timelineProgress');
    this.timelineItems = document.querySelectorAll('.timeline-item');
    this.timelineContainer = document.querySelector('.timeline-container');
    this.teamGrid = document.getElementById('teamGrid');
    this.themeToggle = document.getElementById('themeToggle');
    this.loadingScreen = document.getElementById('loadingScreen');
    this.toast = document.getElementById('toast');
  }

  bindEvents() {
    if (this.prevChapter) {
      this.prevChapter.addEventListener('click', () => this.previousChapter());
    }

    if (this.nextChapter) {
      this.nextChapter.addEventListener('click', () => this.nextChapter());
    }

    this.chapterIndicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToChapter(index));
    });

    this.timelineItems.forEach((item, index) => {
      item.addEventListener('click', () => this.goToChapter(index));
    });

    if (this.autoPlayBtn) {
      this.autoPlayBtn.addEventListener('click', () => this.toggleAutoPlay());
    }

    if (this.audioPlayBtn) {
      this.audioPlayBtn.addEventListener('click', () => this.toggleAudio());
    }

    // ✅ Single unified theme toggle handler
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleDarkTheme());
    }

    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    window.addEventListener('scroll', () => this.handleScroll());
    window.addEventListener('resize', () => this.handleResize());
  }

  async loadUserPreferences() {
    const savedChapter = localStorage.getItem('storyChapter');
    if (savedChapter) this.currentChapter = parseInt(savedChapter);

    const savedAutoPlay = localStorage.getItem('storyAutoPlay');
    if (savedAutoPlay === 'true') this.autoPlay = true;
  }

  // ✅ Centralized Theme Sync Function
  syncTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (this.themeToggle)
        this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      this.isDarkTheme = true;
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (this.themeToggle)
        this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      this.isDarkTheme = false;
    }
  }

  toggleDarkTheme(forceDark = null) {
    this.isDarkTheme = forceDark !== null ? forceDark : !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (this.themeToggle)
        this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (this.themeToggle)
        this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      localStorage.setItem('theme', 'light');
    }
  }

  initChapters() {
    this.chapters = [
      {
        title: { en: 'The Beginning' },
        content: {
          en: 'Our story began in 1995 when Chef Marco discovered his passion for authentic Italian cuisine...',
        },
        year: '1995',
        media: {
          type: 'image',
          src: 'assets/images/story/beginning.jpg',
          alt: 'Our first restaurant location',
        },
        audio: 'assets/audio/story/chapter1.mp3',
      },
      {
        title: { en: 'Culinary Journey' },
        content: {
          en: 'Traveling through Italy, Chef Marco mastered traditional recipes and techniques...',
        },
        year: '1998',
        media: {
          type: 'video',
          src: 'assets/videos/culinary-journey.mp4',
          poster: 'assets/images/story/journey-poster.jpg',
        },
        audio: 'assets/audio/story/chapter2.mp3',
      },
      {
        title: { en: 'First Restaurant' },
        content: {
          en: 'In 2005, we opened our first restaurant in the heart of the city...',
        },
        year: '2005',
        media: {
          type: 'image',
          src: 'assets/images/story/first-restaurant.jpg',
          alt: 'Our first restaurant opening day',
        },
        audio: 'assets/audio/story/chapter3.mp3',
      },
      {
        title: { en: 'Award Recognition' },
        content: {
          en: "Our commitment to excellence earned us the prestigious 'Golden Chef' award in 2012...",
        },
        year: '2012',
        media: {
          type: 'image',
          src: 'assets/images/story/awards.jpg',
          alt: 'Golden Chef award ceremony',
        },
        audio: 'assets/audio/story/chapter4.mp3',
      },
      {
        title: { en: 'Modern Era' },
        content: {
          en: 'Today, we continue to innovate while staying true to our traditional roots...',
        },
        year: 'Present',
        media: {
          type: 'video',
          src: 'assets/videos/modern-era.mp4',
          poster: 'assets/images/story/modern-poster.jpg',
        },
        audio: 'assets/audio/story/chapter5.mp3',
      },
    ];

    this.totalChapters = this.chapters.length;
    this.updateChapter();
  }

  updateChapter() {
    const chapter = this.chapters[this.currentChapter];
    if (!chapter) return;

    if (this.chapterTitle) this.chapterTitle.textContent = chapter.title.en;
    if (this.chapterContent) this.chapterContent.textContent = chapter.content.en;
    if (this.chapterYear) this.chapterYear.textContent = chapter.year;

    this.updateChapterMedia(chapter);
    this.updateNavigation();
    this.updateTimeline();
    this.updateProgress();

    localStorage.setItem('storyChapter', this.currentChapter.toString());

    if (this.autoPlay) this.startAutoPlay();
  }

  updateChapterMedia(chapter) {
    if (!this.chapterMedia) return;
    let mediaHTML = '';

    switch (chapter.media.type) {
      case 'image':
        mediaHTML = `
          <img src="${chapter.media.src}" alt="${chapter.media.alt}" class="chapter-image">
          <div class="media-caption">${chapter.media.alt}</div>
        `;
        break;
      case 'video':
        mediaHTML = `
          <video class="chapter-video" controls poster="${chapter.media.poster}">
            <source src="${chapter.media.src}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        `;
        break;
    }
    this.chapterMedia.innerHTML = mediaHTML;
  }

  updateNavigation() {
    this.chapterIndicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentChapter);
      indicator.classList.toggle('completed', index < this.currentChapter);
    });

    if (this.prevChapter)
      this.prevChapter.disabled = this.currentChapter === 0;
    if (this.nextChapter)
      this.nextChapter.disabled = this.currentChapter === this.totalChapters - 1;
  }

  updateTimeline() {
    this.timelineItems.forEach((item, index) => {
      item.classList.toggle('active', index === this.currentChapter);
      item.classList.toggle('completed', index < this.currentChapter);
    });

    if (this.timelineContainer && this.timelineItems[this.currentChapter]) {
      const currentItem = this.timelineItems[this.currentChapter];
      const containerRect = this.timelineContainer.getBoundingClientRect();
      const itemRect = currentItem.getBoundingClientRect();
      const scrollLeft =
        currentItem.offsetLeft - containerRect.width / 2 + itemRect.width / 2;
      this.timelineContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }

  updateProgress() {
    if (this.timelineProgress) {
      const progress = ((this.currentChapter + 1) / this.totalChapters) * 100;
      this.timelineProgress.style.width = `${progress}%`;
    }
  }

  nextChapter() {
    if (this.currentChapter < this.totalChapters - 1) {
      this.currentChapter++;
      this.updateChapter();
      this.showToast(
        `Chapter ${this.currentChapter + 1}: ${this.chapters[this.currentChapter].title.en}`
      );
    }
  }

  previousChapter() {
    if (this.currentChapter > 0) {
      this.currentChapter--;
      this.updateChapter();
      this.showToast(
        `Chapter ${this.currentChapter + 1}: ${this.chapters[this.currentChapter].title.en}`
      );
    }
  }

  goToChapter(index) {
    if (index >= 0 && index < this.totalChapters) {
      this.currentChapter = index;
      this.updateChapter();
    }
  }

  toggleAutoPlay() {
    this.autoPlay = !this.autoPlay;
    if (this.autoPlayBtn) {
      this.autoPlayBtn.classList.toggle('active', this.autoPlay);
      this.autoPlayBtn.innerHTML = this.autoPlay
        ? '<i class="fas fa-pause"></i>'
        : '<i class="fas fa-play"></i>';
    }
    if (this.autoPlay) this.startAutoPlay();
    else this.stopAutoPlay();
    localStorage.setItem('storyAutoPlay', this.autoPlay.toString());
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      if (this.currentChapter < this.totalChapters - 1) this.nextChapter();
      else {
        this.stopAutoPlay();
        this.autoPlay = false;
        if (this.autoPlayBtn) {
          this.autoPlayBtn.classList.remove('active');
          this.autoPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
      }
    }, 8000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  initAudio() {
    this.audioElement = new Audio();
    this.audioElement.addEventListener('ended', () => {
      this.isPlayingAudio = false;
      this.updateAudioButton();
    });
  }

  toggleAudio() {
    const chapter = this.chapters[this.currentChapter];
    if (!chapter || !chapter.audio) return;
    if (this.isPlayingAudio) this.pauseAudio();
    else this.playAudio(chapter.audio);
  }

  playAudio(audioSrc) {
    if (this.audioElement) {
      this.audioElement.src = audioSrc;
      this.audioElement.play().catch(console.warn);
      this.isPlayingAudio = true;
      this.updateAudioButton();
    }
  }

  pauseAudio() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isPlayingAudio = false;
      this.updateAudioButton();
    }
  }

  updateAudioButton() {
    if (this.audioPlayBtn) {
      this.audioPlayBtn.innerHTML = this.isPlayingAudio
        ? '<i class="fas fa-pause"></i>'
        : '<i class="fas fa-play"></i>';
      this.audioPlayBtn.classList.toggle('active', this.isPlayingAudio);
    }
  }

  initParallax() {
    if (!this.parallaxEnabled) return;
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      parallaxElements.forEach((element) => {
        const rate = scrolled * -0.5;
        element.style.transform = `translate3d(0, ${rate}px, 0)`;
      });
    });
  }

  initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });
  }

  handleKeyboard(e) {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        this.nextChapter();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.previousChapter();
        break;
      case 'Escape':
        this.stopAutoPlay();
        this.pauseAudio();
        break;
      case 'a':
        e.preventDefault();
        this.toggleAutoPlay();
        break;
    }
  }

  handleScroll() {
    const scrolled = window.pageYOffset;
    if (this.chapterNav) {
      this.chapterNav.classList.toggle('scrolled', scrolled > 100);
    }
  }

  handleResize() {
    this.updateTimeline();
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

// Initialize
let storyExperience;
document.addEventListener('DOMContentLoaded', () => {
  storyExperience = new StoryExperience();
});
