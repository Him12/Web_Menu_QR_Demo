// main.js - Premium Restaurant Menu (Favorites Removed Version, Universal Enhanced)
class PremiumMenu {
    constructor() {
        this.MENU = {};
        this.currentLang = 'en';
        this.openCategory = null;
        this.currentSearchQuery = '';
        this.activeFilters = [];
        this.activeSpiceFilters = [];
        this.maxPrice = 2000;
        // this.favorites = new Set(); // ❌ Favorites disabled
        this.currentSection = 'menu';
        this.isDarkTheme = false;
        this.currentModalItem = null;

        this.init();
    }

    async init() {
        this.cacheDOM();
        this.bindEvents();

        // ✅ Load user preferences everywhere
        this.loadUserPreferences();

        // ✅ Only load menu data if on menu page
        if (document.getElementById('menuArea')) {
            await this.loadMenuData();
        }

        if (this.loadingScreen) this.hideLoadingScreen();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    cacheDOM() {
        // Header & Navigation
        this.header = document.getElementById('mainHeader');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.mobileNav = document.getElementById('mobileNav');
        this.searchToggle = document.getElementById('searchToggle');
        this.searchExpandable = document.getElementById('searchExpandable');
        this.searchInput = document.getElementById('searchInput');
        this.searchClose = document.getElementById('searchClose');

        // Theme & Language
        this.themeToggle = document.getElementById('themeToggle');
        this.langSelect = document.getElementById('lang');

        // ❌ Favorites Removed
        // this.favoritesToggle = document.getElementById('favoritesToggle');
        // this.favoritesSidebar = document.getElementById('favoritesSidebar');
        // this.favoritesClose = document.getElementById('favoritesClose');
        // this.favoritesList = document.getElementById('favoritesList');
        // this.favoritesCount = document.querySelector('.favorites-count');

        // Filters
        this.advancedFilters = document.getElementById('advancedFilters');
        this.clearFilters = document.getElementById('clearFilters');
        this.priceRange = document.getElementById('priceRange');
        this.priceDisplay = document.getElementById('priceDisplay');

        // Content Areas
        this.categoryNav = document.querySelector('.category-scroll');
        this.menuArea = document.getElementById('menuArea');
        this.emptyState = document.getElementById('emptyState');

        // Modals
        this.imageModal = document.getElementById('imageModal');
        this.modalImg = document.getElementById('modalImg');
        this.modalName = document.getElementById('modalName');
        this.modalDesc = document.getElementById('modalDesc');
        this.modalPrice = document.getElementById('modalPrice');
        this.modalIngredients = document.getElementById('modalIngredients');
        this.modalBadges = document.getElementById('modalBadges');
        // this.modalFavorite = document.getElementById('modalFavorite'); // ❌ Hidden
        // this.modalAddFavorite = document.getElementById('modalAddFavorite'); // ❌ Hidden
        this.closeImageModal = document.getElementById('closeImageModal');
        this.modalAR = document.getElementById('modalAR');

        // AR Modal
        this.modelModal = document.getElementById('modelModal');
        this.mv = document.getElementById('mv');
        this.closeModelModal = document.getElementById('closeModelModal');
        // 🎬 Video Modal
        this.videoModal = document.getElementById('videoModal');
        this.videoPlayer = document.getElementById('videoPlayer');
        this.closeVideoModalBtn = document.getElementById('closeVideoModal');


        // Loading
        this.loadingScreen = document.getElementById('loadingScreen');

        // Toast
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        // Safe event bindings (works even if some elements are missing)
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        document.querySelectorAll('.nav-btn, .nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.currentTarget.dataset.section)
                    this.switchSection(e.currentTarget.dataset.section);
            });
        });

        if (this.searchToggle && this.searchClose && this.searchInput) {
            this.searchToggle.addEventListener('click', () => this.toggleSearch());
            this.searchClose.addEventListener('click', () => this.toggleSearch(false));
            this.searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        // ✅ Theme toggle always available
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        if (this.langSelect) {
            this.langSelect.addEventListener('change', (e) => {
                this.currentLang = e.target.value;
                this.updateContent();
            });
        }

        // ❌ Favorites event bindings removed (kept commented intentionally)

        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.toggleFilter(e.currentTarget.dataset.filter));
        });

        document.querySelectorAll('.spice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleSpiceFilter(e.currentTarget.dataset.spice));
        });

        if (this.priceRange) {
            this.priceRange.addEventListener('input', (e) => {
                this.updatePriceFilter(parseInt(e.target.value));
            });
        }

        if (this.clearFilters) {
            this.clearFilters.addEventListener('click', () => this.clearAllFilters());
        }

        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 100));

        if (this.closeImageModal) {
            this.closeImageModal.addEventListener('click', () => this.closeModal(this.imageModal));
        }

        if (this.modalAR) {
            this.modalAR.addEventListener('click', () => this.openARModal(this.currentModalItem));
        }

        if (this.closeModelModal) {
            this.closeModelModal.addEventListener('click', () => this.closeModal(this.modelModal));
        }
        // 🎬 Video Modal Close + Back Handling
        if (this.closeVideoModalBtn) {
            this.closeVideoModalBtn.addEventListener('click', () => this.closeVideoModal());
        }

        window.addEventListener("popstate", (e) => {
            if (this.videoModal && this.videoModal.getAttribute("aria-hidden") === "false") {
                e.preventDefault();
                this.closeVideoModal();
            }
        });

        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.closeAllModals();
                }
            });
        });

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    async loadMenuData() {
        try {
            const response = await fetch('menu_data.json');
            if (!response.ok) throw new Error('Failed to load menu data');
            const data = await response.json();

            // 🧩 Create “All” category dynamically — skip any specials
            const allItems = [];
            Object.keys(data).forEach(category => {
                const key = category.toLowerCase();
                // 🧠 Skip “Today's Specials” or similar variants
                // 🧠 Skip any specials category (works for "daily-specials", "today_specials", etc.)
                if (
                    key.includes('today_special') ||
                    key.includes('todayspecial') ||
                    key.includes('specials_today') ||
                    key.includes('daily-special') ||
                    key.includes('daily_special') ||
                    key.includes('special')
                ) return;


                if (data[category].items && Array.isArray(data[category].items)) {
                    allItems.push(...data[category].items);
                }
            });

            // ✅ Create menu object without specials
            this.MENU = {
                all: {
                    label: {
                        en: "All",
                        fr: "Tout",
                        es: "Todo",
                        it: "Tutti",
                        jp: "すべて"
                    },
                    items: allItems
                }
            };

            // ✅ Copy over only non-special categories
            for (const [key, value] of Object.entries(data)) {
                const lowerKey = key.toLowerCase();
                if (
                    lowerKey.includes('today_special') ||
                    lowerKey.includes('todayspecial') ||
                    lowerKey.includes('specials_today') ||
                    lowerKey.includes('daily-special') ||
                    lowerKey.includes('daily_special') ||
                    lowerKey.includes('special')
                ) {
                    continue; // skip specials completely
                }

                this.MENU[key] = value;
            }

            // ✅ Now build and render
            this.buildCategoryNav();
            this.openCategory = "all";
            this.renderMenu();

        } catch (error) {
            console.error('Error loading menu:', error);
            this.showError('Failed to load menu. Please refresh the page.');
        }
    }


    loadUserPreferences() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') this.toggleTheme(true);
        else this.toggleTheme(false);

        // ❌ Favorites loading removed

        const savedLang = localStorage.getItem('language');
        if (savedLang && this.langSelect) {
            this.currentLang = savedLang;
            this.langSelect.value = savedLang;
        }
    }

    toggleMobileMenu() {
        if (!this.mobileMenuBtn || !this.mobileNav) return;
        this.mobileMenuBtn.classList.toggle('active');
        this.mobileNav.classList.toggle('active');
    }

    switchSection(section) {
        document.querySelectorAll('.nav-btn, .nav-item').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll(`[data-section="${section}"]`).forEach(btn => btn.classList.add('active'));

        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) targetSection.classList.add('active');

        this.currentSection = section;
        if (this.mobileMenuBtn) this.mobileMenuBtn.classList.remove('active');
        if (this.mobileNav) this.mobileNav.classList.remove('active');
    }

    toggleSearch(show = null) {
        if (!this.searchExpandable) return;
        const shouldShow = show !== null ? show : !this.searchExpandable.classList.contains('active');
        if (shouldShow) {
            this.searchExpandable.classList.add('active');
            if (this.searchInput) this.searchInput.focus();
        } else {
            this.searchExpandable.classList.remove('active');
            if (this.searchInput) {
                this.searchInput.value = '';
                this.handleSearch('');
            }
        }
    }

    handleSearch(query) {
        this.currentSearchQuery = query.trim().toLowerCase();
        if (this.menuArea) this.renderMenu();
    }

    toggleTheme(forceDark = null) {
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

    // ❌ All favorites methods commented out
    /*
    toggleFavoritesSidebar() {}
    toggleFavorite(item) {}
    updateFavoritesCount() {}
    updateFavoriteButtons() {}
    renderFavorites() {}
    */

    toggleFilter(filter) {
        const index = this.activeFilters.indexOf(filter);
        if (index > -1) this.activeFilters.splice(index, 1);
        else {
            if (filter === 'VEG' || filter === 'NON_VEG')
                this.activeFilters = this.activeFilters.filter(f => f !== 'VEG' && f !== 'NON_VEG');
            this.activeFilters.push(filter);
        }
        this.updateFilterUI();
        if (this.menuArea) this.renderMenu();
    }

    toggleSpiceFilter(spiceLevel) {
        const index = this.activeSpiceFilters.indexOf(spiceLevel);
        if (index > -1) this.activeSpiceFilters.splice(index, 1);
        else this.activeSpiceFilters.push(spiceLevel);
        this.updateFilterUI();
        if (this.menuArea) this.renderMenu();
    }

    updatePriceFilter(price) {
        this.maxPrice = price;
        if (this.priceDisplay) this.priceDisplay.textContent = `Up to ₹${price}`;
        if (this.menuArea) this.renderMenu();
    }

    clearAllFilters() {
        this.activeFilters = [];
        this.activeSpiceFilters = [];
        this.maxPrice = 2000;
        if (this.priceRange) this.priceRange.value = 2000;
        if (this.priceDisplay) this.priceDisplay.textContent = 'Up to ₹2000';
        this.currentSearchQuery = '';
        if (this.searchInput) this.searchInput.value = '';
        this.updateFilterUI();
        if (this.menuArea) this.renderMenu();
    }

    updateFilterUI() {
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.classList.toggle('active', this.activeFilters.includes(tag.dataset.filter));
        });
        document.querySelectorAll('.spice-btn').forEach(btn => {
            btn.classList.toggle('active', this.activeSpiceFilters.includes(btn.dataset.spice));
        });
    }

    buildCategoryNav() {
        if (!this.categoryNav) return;
        this.categoryNav.innerHTML = Object.keys(this.MENU)
            .map(categoryKey => {
                const category = this.MENU[categoryKey];
                const label = category.label[this.currentLang] || categoryKey;
                return `<button class="category-btn" data-category="${categoryKey}">${label}</button>`;
            })
            .join('');

        this.categoryNav.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.openCategory = e.currentTarget.dataset.category;
                this.updateCategoryNav();
                this.renderMenu();
            });
        });

        this.openCategory = "all";
        this.updateCategoryNav();
    }

    updateCategoryNav() {
        if (!this.categoryNav) return;
        this.categoryNav.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.openCategory);
        });
    }

    renderMenu() {
        if (!this.menuArea) return;
        const filteredData = this.filterMenu();
        if (!filteredData || Object.keys(filteredData).length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        let menuHTML = '';

        Object.keys(filteredData).forEach(categoryKey => {
            const category = filteredData[categoryKey];
            const categoryLabel = category.label[this.currentLang] || categoryKey;

            menuHTML += `
                <div class="category-section" data-category="${categoryKey}">
                    <h3 class="category-title">${categoryLabel}</h3>
                    <div class="menu-grid">
                        ${category.items.map(item => this.createMenuItemHTML(item)).join('')}
                    </div>
                </div>
            `;
        });

        this.menuArea.innerHTML = menuHTML;
        this.attachItemEventListeners();
    }

    // ✅ Updated version with View / 3D / Video buttons (fixed label)
    createMenuItemHTML(item) {
        const t = item.translations?.[this.currentLang] || item.translations?.en || {};
        const badges = this.createDietaryBadges(item);

        return `
        <div class="menu-card" data-item-id="${item.id}">
            <div class="card-media">
                <img src="${item.image}" alt="${t.name}" class="card-img" loading="lazy">
                <div class="card-badges">${badges}</div>
            </div>
            <div class="card-body">
                <div class="card-header">
                    <h3 class="card-title">${t.name}</h3>
                    <div class="card-price">${t.price}</div>
                </div>
            <p class="card-desc">${t.desc ? t.desc.replace(/\*\*/g, "") : ""}</p>
                ${t.ingredients ? `<div class="card-ingredients"><small>${t.ingredients}</small></div>` : ''}
                
                <div class="card-footer">
                    <div class="card-actions">
                        <!-- 👁️ View Button -->
                        <button class="btn btn-secondary"
                            onclick="premiumMenu.openItemModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                            <i class="fas fa-eye"></i> View
                        </button>

                        <!-- 🧊 3D Button -->
                        ${item.model ? `
                            <button class="btn btn-3d"
                                onclick="premiumMenu.handle3DClick(this, ${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                <i class="fas fa-cube"></i> 3D
                            </button>` : ''}

                        <!-- 🎬 Video Button -->
                        ${item.video ? `
                            <button class="btn btn-secondary"
                                onclick="premiumMenu.openVideoModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                <i class="fas fa-play"></i> Video
                            </button>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    // 🎥 Open video in new tab
    openVideo(item) {
        if (!item || !item.video) {
            this.showToast('Video not available for this item');
            return;
        }

        try {
            window.open(item.video, "_blank"); // open video in new tab
        } catch {
            this.showToast('Unable to open video.');
        }
    }


    createDietaryBadges(item) {
        const badges = [];
        const flags = item.dietaryFlags || [];
        if (flags.includes('VEG') || item.dietaryColor === 'green') badges.push('<span class="badge veg">Veg</span>');
        if (flags.includes('NON_VEG') || item.dietaryColor === 'red') badges.push('<span class="badge nonveg">Non-Veg</span>');
        if (flags.includes('GLUTEN_FREE')) badges.push('<span class="badge gluten-free">GF</span>');
        return badges.join('');
    }

    attachItemEventListeners() {
        if (!this.menuArea) return;
        this.menuArea.querySelectorAll('.menu-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Ignore clicks on buttons inside cards
                if (e.target.closest('button')) return;

                // Trigger micro motion on card tap
                card.classList.add('clicked');
                setTimeout(() => card.classList.remove('clicked'), 400);

                // Open item modal as usual
                const itemId = card.dataset.itemId;
                const item = this.findItemById(itemId);
                if (item) this.openItemModal(item);
            });
        });
    }


    filterMenu() {
        let filtered = { ...this.MENU };
        if (this.currentSearchQuery) filtered = this.applySearch(filtered) || {};
        if (this.activeFilters.length > 0) filtered = this.applyDietaryFilters(filtered) || {};
        if (this.maxPrice < 2000) filtered = this.applyPriceFilter(filtered) || {};
        if (this.openCategory) filtered = { [this.openCategory]: filtered[this.openCategory] };
        return Object.keys(filtered).length > 0 ? filtered : null;
    }

    applySearch(data) {
        const results = {};
        const query = this.currentSearchQuery.toLowerCase();
        for (const [categoryKey, category] of Object.entries(data)) {
            const matchingItems = category.items.filter(item => {
                const t = item.translations?.[this.currentLang] || item.translations?.en || {};
                const searchText = `${t.name} ${t.desc} ${t.ingredients}`.toLowerCase();
                return searchText.includes(query);
            });
            if (matchingItems.length > 0) results[categoryKey] = { ...category, items: matchingItems };
        }
        return Object.keys(results).length > 0 ? results : null;
    }

    applyDietaryFilters(data) {
        const results = {};
        for (const [categoryKey, category] of Object.entries(data)) {
            const matchingItems = category.items.filter(item =>
                this.activeFilters.every(filter => (item.dietaryFlags || []).includes(filter))
            );
            if (matchingItems.length > 0) results[categoryKey] = { ...category, items: matchingItems };
        }
        return Object.keys(results).length > 0 ? results : null;
    }

    applyPriceFilter(data) {
        const results = {};
        for (const [categoryKey, category] of Object.entries(data)) {
            const matchingItems = category.items.filter(item => {
                const t = item.translations?.[this.currentLang] || item.translations?.en || {};
                const price = parseInt(t.price.replace(/[^0-9]/g, '')) || 0;
                return price <= this.maxPrice;
            });
            if (matchingItems.length > 0) results[categoryKey] = { ...category, items: matchingItems };
        }
        return Object.keys(results).length > 0 ? results : null;
    }

    openItemModal(item) {
        if (!this.imageModal) return;
        this.currentModalItem = item;
        const t = item.translations?.[this.currentLang] || item.translations?.en || {};
        this.modalImg.src = item.image;
        this.modalName.textContent = t.name;
        this.modalDesc.innerHTML = t.desc.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        this.modalPrice.textContent = t.price;
        this.modalIngredients.textContent = t.ingredients;
        this.modalBadges.innerHTML = this.createDietaryBadges(item);
        this.modalAR.style.display = item.model ? 'inline-flex' : 'none';
        this.openModal(this.imageModal);
    }

    openARModal(item) {
        if (!item || !this.mv) return;
        if (!item.model) {
            this.showToast('AR model not available for this item');
            return;
        }
        try {
            this.mv.setAttribute('src', item.model);
            this.mv.setAttribute(
                'alt',
                `3D model of ${item.translations?.[this.currentLang]?.name || item.translations?.en?.name}`
            );

            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then(() => {
                    this.openModal(this.modelModal);
                    setTimeout(() => {
                        const modelViewer = this.mv;
                        if (modelViewer.canActivateAR) modelViewer.activateAR();
                        else this.showToast('AR not supported — showing 3D preview.');
                    }, 800);
                })
                .catch(() => alert('Camera access is required to view the 3D model in AR.'));
        } catch {
            this.showToast('AR feature not supported on this device');
        }
    }

    // 🎬 VIDEO MODAL — inline version (portrait aware)
    openVideoModal(item) {
        if (!item || !item.video) {
            this.showToast('Video not available for this item');
            return;
        }

        const source = this.videoPlayer.querySelector("source");
        source.src = item.video;
        this.videoPlayer.load();

        // ✅ Detect portrait orientation dynamically
        this.videoPlayer.addEventListener("loadedmetadata", () => {
            const isPortrait = this.videoPlayer.videoHeight > this.videoPlayer.videoWidth;
            if (isPortrait) {
                this.videoPlayer.setAttribute("portrait", "");
            } else {
                this.videoPlayer.removeAttribute("portrait");
            }
        });

        this.videoPlayer.play().catch(() => console.log("User interaction required"));
        this.videoModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        // Push a new state so back button closes modal, not site
        history.pushState({ videoOpen: true }, "");
    }

    closeVideoModal() {
        if (!this.videoModal || !this.videoPlayer) return;

        this.videoPlayer.pause();
        this.videoPlayer.currentTime = 0;
        this.videoModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }




    // 🧊 Handle 3D button click effect + open model viewer
    handle3DClick(button, item) {
        // Add temporary highlight
        button.classList.add("active");

        // Open AR/3D modal
        this.openARModal(item);

        // Remove highlight after 0.6s
        setTimeout(() => {
            button.classList.remove("active");
        }, 600);
    }


    openModal(modal) {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    closeAllModals() {
        if (this.imageModal) this.closeModal(this.imageModal);
        if (this.modelModal) this.closeModal(this.modelModal);
    }

    findItemById(itemId) {
        for (const category of Object.values(this.MENU)) {
            const item = category.items.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    }

    updateContent() {
        // Keep track of which category is open
        const previousCategory = this.openCategory || "all";

        // Rebuild category navigation with translated labels
        this.buildCategoryNav();

        // Keep the same category selected
        this.openCategory = previousCategory;
        this.updateCategoryNav();

        // Re-render the menu cards with the new language
        this.renderMenu();

        // Save the selected language to localStorage
        localStorage.setItem('language', this.currentLang);
    }


    handleScroll() {
        if (this.header) {
            const scrolled = window.scrollY > 50;
            this.header.classList.toggle('scrolled', scrolled);
        }
    }

    handleKeyboard(e) {
        if (e.key === 'Escape') this.closeAllModals();
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.toggleSearch(true);
        }
    }

    showEmptyState() {
        if (this.menuArea && this.emptyState) {
            this.menuArea.style.display = 'none';
            this.emptyState.style.display = 'block';
        }
    }

    hideEmptyState() {
        if (this.menuArea && this.emptyState) {
            this.menuArea.style.display = 'block';
            this.emptyState.style.display = 'none';
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

    showError(message) {
        this.showToast(message, 5000);
    }
}

let premiumMenu;
document.addEventListener('DOMContentLoaded', () => {
    premiumMenu = new PremiumMenu();
});