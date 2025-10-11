document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger-icon');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('nav');
    const body = document.body;
    let isMenuOpen = false;
    
    // Set initial ARIA attributes
    if (hamburger && navLinks) {
        hamburger.setAttribute('aria-label', 'Menu');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'nav-links');
        navLinks.setAttribute('aria-hidden', 'true');
        navLinks.id = 'nav-links';
    }
    
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        body.classList.toggle('nav-open');
        
        // Update ARIA attributes
        hamburger.setAttribute('aria-expanded', isMenuOpen);
        navLinks.setAttribute('aria-hidden', !isMenuOpen);
        
        // Handle focus when menu opens
        if (isMenuOpen) {
            // Focus first menu item when menu opens
            const firstLink = navLinks.querySelector('a');
            if (firstLink) setTimeout(() => firstLink.focus(), 100);
        }
    }

    if (hamburger) {
        // Hamburger click event
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (isMenuOpen && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                toggleMenu();
            }
        });

        // Handle navigation links
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (isMenuOpen) {
                    toggleMenu();
                }
            });
        });

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768 && isMenuOpen) {
                    toggleMenu();
                }
            }, 250);
        });

        // Handle escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                toggleMenu();
            }
        });

        // Scroll handling for nav bar
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Add/remove scrolled class for nav styling
            if (currentScroll > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });

        // Focus trap for mobile menu
        document.addEventListener('keydown', function(e) {
            if (!isMenuOpen) return;

            const focusableElements = navLinks.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });
    }
});