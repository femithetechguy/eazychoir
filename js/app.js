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
    
    // Load the initial section (home)
    this.loadSection(this.activeSection);
    
    // Add window resize handler for mobile adjustments
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize(); // Call once on init
  }
  
  handleResize() {
    // Check if we're in mobile view
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('is-mobile', isMobile);
  }
  
  initNavigation() {
    // Direct event listeners for navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Prevent default if this is a link
        e.preventDefault();
        
        // Get the section name from data attribute
        const sectionName = button.getAttribute('data-section');
        
        // Load the section directly
        this.loadSection(sectionName);
        
        // Close the mobile menu
        document.getElementById('main-nav').classList.remove('show-nav');
      });
    });
    
    // Mobile menu toggle handler
    const logoTrigger = document.getElementById('logo-trigger');
    const mainNav = document.getElementById('main-nav');
    const menuClose = document.getElementById('menu-close');
    
    logoTrigger.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      mainNav.classList.toggle('show-nav');
      console.log('Mobile menu toggled', mainNav.classList.contains('show-nav'));
    });
    
    menuClose.addEventListener('click', () => {
      mainNav.classList.remove('show-nav');
      console.log('Mobile menu closed');
    });
    
    // Close mobile menu when clicking outside of it
    document.addEventListener('click', (e) => {
      if (mainNav.classList.contains('show-nav') && 
          !mainNav.contains(e.target) && 
          e.target !== logoTrigger) {
        mainNav.classList.remove('show-nav');
      }
    });
    
    // Add a separate home button functionality
    const homeButton = document.querySelector('.logo');
    homeButton.addEventListener('click', (e) => {
      if (e.target !== logoTrigger) { // Only handle clicks on the logo itself, not the menu trigger
        this.loadSection('home');
      }
    });
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
    // Don't reload the same section unless forced
    if (sectionName === this.activeSection && !options.force) {
      return;
    }
    
    // Validate section name
    if (!this.sections[sectionName]) {
      console.error(`Section '${sectionName}' does not exist`);
      return;
    }
    
    console.log(`Loading section: ${sectionName}`);
    
    // Hide all sections
    document.querySelectorAll('.collapsible-section').forEach(section => {
      section.setAttribute('data-collapsed', 'true');
    });
    
    // Show the selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
      section.setAttribute('data-collapsed', 'false');
      
      // Update active button in navigation
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === sectionName) {
          btn.classList.add('active');
        }
      });
      
      // Update active section and render it
      this.activeSection = sectionName;
      this.sections[sectionName].render(options);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});