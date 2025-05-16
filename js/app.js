import { siteContent } from './content.js';
import HomeSection from './sections/homeSection.js';
import ScheduleSection from './sections/scheduleSection.js';
import PlaylistSection from './sections/playlistSection.js';
import RequestSection from './sections/requestSection.js';
import BlogSection from './sections/blogSection.js';

class App {
  constructor() {
    this.sections = {
      home: new HomeSection(),
      schedule: new ScheduleSection(),
      playlist: new PlaylistSection(),
      request: new RequestSection(),
      blog: new BlogSection()
    };
    
    this.activeSection = 'home';
    this.siteTitle = 'EazyChoir';
    
    // Clear any previous navigation state
    if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
      console.log('Page was reloaded, resetting to home section');
      this.activeSection = 'home';
      // Remove any saved section state
      sessionStorage.removeItem('currentSection');
    } else if (sessionStorage.getItem('currentSection')) {
      // If we have a saved section from a previous visit, ignore it on reload
      sessionStorage.removeItem('currentSection');
    }
    
    this.init();
  }
  
  init() {
    // Set the site title
    document.getElementById('site-title').textContent = this.siteTitle;
    
    // Initialize navigation
    this.initNavigation();
    
    // Initialize search functionality
    this.initSearch();
    
    // Initialize scroll to top button
    this.initScrollToTop();
    
    // Initialize FTTG modal
    this.initFttgModal();
    
    // Ensure we're starting with the home section regardless of any saved state or URL parameters
    this.activeSection = 'home';
    
    // Load the initial section (home)
    this.loadSection(this.activeSection, { force: true });
    
    // Add window resize handler for mobile adjustments
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize(); // Call once on init
    
    // Add beforeunload event listener to reset to home section when page reloads
    window.addEventListener('beforeunload', () => {
      // Setting a localStorage flag to indicate we're reloading
      localStorage.setItem('eazychoir_reloading', 'true');
    });
    
    // Check if we're coming back from a reload
    if (localStorage.getItem('eazychoir_reloading') === 'true') {
      // Clear the flag
      localStorage.removeItem('eazychoir_reloading');
      // Force reload to home
      this.loadSection('home', { force: true });
    }
    
    // Handle browser history for better navigation
    this.handleHistoryNavigation();
    
    // Log that app is initialized
    console.log('App initialized, active section:', this.activeSection);
  }
  
  handleHistoryNavigation() {
    // Listen for popstate events (browser back/forward buttons)
    window.addEventListener('popstate', (event) => {
      // If we have state information, use it
      if (event.state && event.state.section) {
        this.loadSection(event.state.section);
      } else {
        // Default to home if no state
        this.loadSection('home');
      }
    });
    
    // Initialize history with home state
    if (!history.state) {
      history.replaceState({ section: 'home' }, 'Home', '');
    }
  }
  
  handleResize() {
    // Check if we're in mobile view
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('is-mobile', isMobile);
    
    // Adjust section height for current viewport
    this.adjustActiveSection();
  }
  
  adjustActiveSection() {
    // Find active section
    const activeSection = document.querySelector('.collapsible-section[data-collapsed="false"]');
    if (activeSection) {
      // Calculate viewport height minus header and footer
      const viewportHeight = window.innerHeight;
      const headerHeight = document.querySelector('.header').offsetHeight || 60;
      const footerHeight = document.querySelector('.footer').offsetHeight || 60;
      const availableHeight = viewportHeight - headerHeight - footerHeight;
      
      // Set section height to fill viewport
      activeSection.style.minHeight = `${availableHeight}px`;
      
      console.log(`Adjusted section ${activeSection.id} to height: ${availableHeight}px`);
    }
  }
  
  initNavigation() {
    // Get all navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    
    // Add click event listener to each button
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Get section name from data attribute
        const sectionName = button.getAttribute('data-section');
        console.log(`Nav button clicked: ${sectionName}`);
        
        // Make sure we have a valid section name
        if (sectionName && this.sections[sectionName]) {
          // Load the section
          this.loadSection(sectionName);
          
          // Close mobile menu if open
          const mobileNav = document.getElementById('main-nav');
          if (mobileNav && mobileNav.classList.contains('show-nav')) {
            mobileNav.classList.remove('show-nav');
          }
        } else {
          console.error(`Invalid section name: ${sectionName}`);
        }
      });
    });
    
    // Logo click handling - make it go to home section
    const logo = document.querySelector('.logo');
    const siteTitle = document.getElementById('site-title');
    const logoIcon = logo.querySelector('ion-icon');
    
    // Function to handle logo click
    const handleLogoClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Only trigger home navigation if not clicking the menu toggle button
      if (e.target !== document.getElementById('logo-trigger')) {
        console.log('Logo clicked, navigating to home section');
        this.loadSection('home');
        
        // Close mobile menu if open
        const mobileNav = document.getElementById('main-nav');
        if (mobileNav && mobileNav.classList.contains('show-nav')) {
          mobileNav.classList.remove('show-nav');
        }
      }
    };
    
    // Add click events to logo elements
    logo.addEventListener('click', handleLogoClick);
    siteTitle.addEventListener('click', handleLogoClick);
    logoIcon.addEventListener('click', handleLogoClick);
    
    // Mobile menu toggle (separate from logo click)
    const menuToggle = document.getElementById('logo-trigger');
    const mobileNav = document.getElementById('main-nav');
    const menuClose = document.getElementById('menu-close');
    
    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent triggering the logo click
        mobileNav.classList.toggle('show-nav');
        console.log('Mobile menu toggled');
      });
    }
    
    if (menuClose && mobileNav) {
      menuClose.addEventListener('click', () => {
        mobileNav.classList.remove('show-nav');
        console.log('Mobile menu closed');
      });
    }
  }
  
  initSearch() {
    const searchInput = document.getElementById('song-search');
    const searchIcon = document.getElementById('search-icon');
    
    searchIcon.addEventListener('click', () => {
      const searchTerm = searchInput.value.trim();
      if (searchTerm) {
        this.search(searchTerm);
      }
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
          this.search(searchTerm);
        }
      }
    });
  }
  
  search(term) {
    console.log(`Searching for: ${term}`);
    // First load the playlist section
    this.loadSection('playlist');
    // Then apply the search filter
    setTimeout(() => {
      this.sections.playlist.render({ searchTerm: term });
    }, 100);
  }
  
  initScrollToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    });
    
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  initFttgModal() {
    const fttgLink = document.getElementById('fttg-link');
    const fttgModal = document.getElementById('fttg-modal');
    const fttgModalClose = document.getElementById('fttg-modal-close');
    const fttgIframe = document.getElementById('fttg-iframe');
    const modalOverlay = document.getElementById('modal-overlay');
    
    // Function to open modal
    const openModal = (e) => {
      e.preventDefault();
      e.stopPropagation(); // Stop event from bubbling
      
      // Set the iframe src attribute now, to avoid loading until needed
      fttgIframe.src = 'https://www.fttgsolutions.com';
      
      // Show modal and overlay
      document.body.classList.add('modal-open'); // Prevent body scrolling
      fttgModal.classList.add('visible');
      
      console.log('Modal opened');
    };
    
    // Function to close modal
    const closeModal = () => {
      document.body.classList.remove('modal-open');
      fttgModal.classList.remove('visible');
      
      // Clear the iframe src to stop any media/resources after animation completes
      setTimeout(() => {
        fttgIframe.src = '';
      }, 300);
      
      console.log('Modal closed');
    };
    
    // Event listeners
    fttgLink.addEventListener('click', openModal);
    
    fttgModalClose.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from reaching modal content
      closeModal();
    });
    
    // Close when clicking on the background (outside modal content)
    fttgModal.addEventListener('click', (e) => {
      // Only close if clicking directly on the modal backdrop (not on the content)
      if (e.target === fttgModal) {
        closeModal();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && fttgModal.classList.contains('visible')) {
        closeModal();
      }
    });
  }
  
  loadSection(sectionName, options = {}) {
    console.log(`Attempting to load section: ${sectionName}`);
    
    // Skip if already on this section and not forced
    if (sectionName === this.activeSection && !options.force) {
      console.log(`Already on section: ${sectionName}`);
      return;
    }
    
    // Make sure the section exists
    if (!this.sections[sectionName]) {
      console.error(`Section not found: ${sectionName}`);
      return;
    }
    
    // Hide all sections
    const allSections = document.querySelectorAll('.collapsible-section');
    allSections.forEach(section => {
      section.setAttribute('data-collapsed', 'true');
      section.style.display = 'none';
    });
    
    // Show the selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
      // Show this section
      targetSection.setAttribute('data-collapsed', 'false');
      targetSection.style.display = 'flex';
      
      // Update active class on navigation buttons
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === sectionName) {
          btn.classList.add('active');
        }
      });
      
      // Update active section
      this.activeSection = sectionName;
      
      // Update browser history unless this is the initial load or forced navigation
      if (!options.initialLoad && !options.skipHistory) {
        // Create a descriptive title
        const sectionTitle = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        
        // Push new state
        history.pushState({ section: sectionName }, sectionTitle, '');
      }
      
      // Render the section content
      this.sections[sectionName].render();
      
      // Scroll to top
      window.scrollTo(0, 0);
      
      // Adjust section height to fill viewport
      setTimeout(() => {
        this.adjustActiveSection();
      }, 10);
      
      console.log(`Section loaded: ${sectionName}`);
    } else {
      console.error(`Section element not found: ${sectionName}-section`);
    }
  }
  
  // Rest of your methods (search, initScrollToTop, initFttgModal)...
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});