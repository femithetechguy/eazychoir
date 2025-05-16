import { siteContent } from "./content.js";
import HomeSection from "./sections/homeSection.js";
import ScheduleSection from "./sections/scheduleSection.js";
import PlaylistSection from "./sections/playlistSection.js";
import RequestSection from "./sections/requestSection.js";
import BlogSection from "./sections/blogSection.js";

// Create a global app object
window.app = window.app || {};

class App {
  constructor() {
    this.sections = {
      home: new HomeSection(),
      schedule: new ScheduleSection(),
      playlist: new PlaylistSection(),
      request: new RequestSection(),
      blog: new BlogSection(),
    };

    this.activeSection = "home";
    this.siteTitle = "EazyChoir";

    // Clear any previous navigation state
    if (
      window.performance &&
      window.performance.navigation.type ===
        window.performance.navigation.TYPE_RELOAD
    ) {
      console.log("Page was reloaded, resetting to home section");
      this.activeSection = "home";
      // Remove any saved section state
      sessionStorage.removeItem("currentSection");
    } else if (sessionStorage.getItem("currentSection")) {
      // If we have a saved section from a previous visit, ignore it on reload
      sessionStorage.removeItem("currentSection");
    }

    this.init();
  }

  init() {
    // Set the site title
    const siteTitleElement = document.getElementById("site-title");
    if (siteTitleElement) {
      siteTitleElement.textContent = this.siteTitle;
    }

    // Initialize navigation
    this.initNavigation();

    // Initialize search functionality
    this.initSearch();

    // Initialize scroll to top button
    this.initScrollToTop();

    // Initialize FTTG modal
    this.initFttgModal();

    // Ensure we're starting with the home section regardless of any saved state or URL parameters
    this.activeSection = "home";

    // Load the initial section (home)
    this.loadSection(this.activeSection, { force: true });

    // Add window resize handler for mobile adjustments
    window.addEventListener("resize", this.handleResize.bind(this));
    this.handleResize(); // Call once on init

    // Add beforeunload event listener to reset to home section when page reloads
    window.addEventListener("beforeunload", () => {
      // Setting a localStorage flag to indicate we're reloading
      localStorage.setItem("eazychoir_reloading", "true");
    });

    // Check if we're coming back from a reload
    if (localStorage.getItem("eazychoir_reloading") === "true") {
      // Clear the flag
      localStorage.removeItem("eazychoir_reloading");
      // Force reload to home
      this.loadSection("home", { force: true });
    }

    // Handle browser history for better navigation
    this.handleHistoryNavigation();

    // Initialize mobile menu functionality
    this.initMobileMenu();

    // Check for shared schedule links
    this.handleSharedLinks();

    // Log that app is initialized
    console.log("App initialized, active section:", this.activeSection);
  }

  handleHistoryNavigation() {
    // Listen for popstate events (browser back/forward buttons)
    window.addEventListener("popstate", (event) => {
      // If we have state information, use it
      if (event.state && event.state.section) {
        this.loadSection(event.state.section);
      } else {
        // Default to home if no state
        this.loadSection("home");
      }
    });

    // Initialize history with home state
    if (!history.state) {
      history.replaceState({ section: "home" }, "Home", "");
    }
  }

  handleResize() {
    // Check if we're in mobile view
    const isMobile = window.innerWidth < 768;
    const wasMobile = document.body.classList.contains("is-mobile");
    document.body.classList.toggle("is-mobile", isMobile);

    // Adjust section height for current viewport
    this.adjustActiveSection();

    // If we crossed the mobile/desktop threshold, reload the active section to switch views
    if (isMobile !== wasMobile && this.activeSection) {
      // Only reload the schedule section since other sections might not need different views
      if (this.activeSection === "schedule") {
        console.log(
          `View changed to ${
            isMobile ? "mobile" : "desktop"
          }, reloading schedule`
        );
        this.loadSection(this.activeSection, { skipHistory: true });
      }
    }
  }

  adjustActiveSection() {
    // Find active section
    const activeSection = document.querySelector(
      '.collapsible-section[data-collapsed="false"]'
    );
    if (activeSection) {
      // Calculate viewport height minus header and footer
      const viewportHeight = window.innerHeight;
      const headerHeight =
        document.querySelector(".header")?.offsetHeight || 60;
      const footerHeight =
        document.querySelector(".footer")?.offsetHeight || 60;
      const availableHeight = viewportHeight - headerHeight - footerHeight;

      // Set section height to fill viewport
      activeSection.style.minHeight = `${availableHeight}px`;

      console.log(
        `Adjusted section ${activeSection.id} to height: ${availableHeight}px`
      );
    }
  }

  initNavigation() {
    // Get all navigation buttons
    const navButtons = document.querySelectorAll(".nav-btn");

    // Add click event listener to each button
    navButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get section name from data attribute
        const sectionName = button.getAttribute("data-section");
        console.log(`Nav button clicked: ${sectionName}`);

        // Make sure we have a valid section name
        if (sectionName && this.sections[sectionName]) {
          // Load the section
          this.loadSection(sectionName);

          // Close mobile menu if open
          const mobileNav = document.getElementById("main-nav");
          if (mobileNav && mobileNav.classList.contains("show-nav")) {
            mobileNav.classList.remove("show-nav");
          }
        } else {
          console.error(`Invalid section name: ${sectionName}`);
        }
      });
    });

    // Logo click handling - make it go to home section
    const logo = document.querySelector(".logo");
    if (logo) {
      const siteTitle = document.getElementById("site-title");
      const logoIcon = logo.querySelector("ion-icon");

      // Function to handle logo click
      const handleLogoClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Only trigger home navigation if not clicking the menu toggle button
        if (e.target !== document.getElementById("logo-trigger")) {
          console.log("Logo clicked, navigating to home section");
          this.loadSection("home");

          // Close mobile menu if open
          const mobileNav = document.getElementById("main-nav");
          if (mobileNav && mobileNav.classList.contains("show-nav")) {
            mobileNav.classList.remove("show-nav");
          }
        }
      };

      // Add click events to logo elements
      logo.addEventListener("click", handleLogoClick);
      if (siteTitle) siteTitle.addEventListener("click", handleLogoClick);
      if (logoIcon) logoIcon.addEventListener("click", handleLogoClick);
    }

    // Mobile menu toggle (separate from logo click)
    const menuToggle = document.getElementById("logo-trigger");
    const mobileNav = document.getElementById("main-nav");
    const menuClose = document.getElementById("menu-close");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent triggering the logo click
        mobileNav.classList.toggle("show-nav");
        console.log("Mobile menu toggled");
      });
    }

    if (menuClose && mobileNav) {
      menuClose.addEventListener("click", () => {
        mobileNav.classList.remove("show-nav");
        console.log("Mobile menu closed");
      });
    }
  }

  initMobileMenu() {
    console.log("Initializing mobile menu...");

    // Get all necessary elements
    const fixedMobileToggle = document.getElementById("fixed-mobile-toggle");
    const logoTrigger = document.getElementById("logo-trigger");
    const mobileMenuClose = document.querySelector(".mobile-menu-close");
    const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
    const mobileNavLinks = document.querySelectorAll(
      ".mobile-nav-links .nav-link"
    );

    // Function to open mobile menu
    const openMobileMenu = () => {
      document.body.classList.add("menu-open");
      document.querySelector(".mobile-menu-overlay").classList.add("active");
      console.log("Mobile menu opened");

      // Update ARIA attributes
      if (fixedMobileToggle)
        fixedMobileToggle.setAttribute("aria-expanded", "true");
      if (logoTrigger) logoTrigger.setAttribute("aria-expanded", "true");
    };

    // Function to close mobile menu
    const closeMobileMenu = () => {
      document.body.classList.remove("menu-open");
      if (mobileMenuOverlay) mobileMenuOverlay.classList.remove("active");
      console.log("Mobile menu closed");

      // Update ARIA attributes
      if (fixedMobileToggle)
        fixedMobileToggle.setAttribute("aria-expanded", "false");
      if (logoTrigger) logoTrigger.setAttribute("aria-expanded", "false");
    };

    // Add click event to fixed mobile toggle button
    if (fixedMobileToggle) {
      fixedMobileToggle.addEventListener("click", openMobileMenu);
      console.log("Added event listener to fixed mobile toggle");
    } else {
      console.warn("Fixed mobile toggle button not found");
    }

    // Add click event to logo trigger button
    if (logoTrigger) {
      logoTrigger.addEventListener("click", openMobileMenu);
      console.log("Added event listener to logo trigger");
    } else {
      console.warn("Logo trigger button not found");
    }

    // Add click event to close button
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", closeMobileMenu);
      console.log("Added event listener to close button");
    } else {
      console.warn("Mobile menu close button not found");
    }

    // Close menu when clicking overlay
    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener("click", (e) => {
        if (e.target === mobileMenuOverlay) {
          closeMobileMenu();
        }
      });
      console.log("Added event listener to menu overlay");
    } else {
      console.warn("Mobile menu overlay not found");
    }

    // Add click events to each nav link
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const section = link.getAttribute("data-section");

        // Close the menu
        closeMobileMenu();

        // Navigate to the section
        if (section && this.loadSection) {
          this.loadSection(section);
          console.log(`Navigated to ${section}`);
        }
      });
    });

    // Add keyboard accessibility - close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        closeMobileMenu();
      }
    });

    // Check if we're on mobile and init specific behaviors
    this.checkMobileView();
    window.addEventListener("resize", () => this.checkMobileView());

    console.log("Mobile menu initialization complete");
  }

  checkMobileView() {
    const isMobile = window.innerWidth <= 768;
    document.body.classList.toggle("is-mobile", isMobile);

    const fixedMobileToggle = document.getElementById("fixed-mobile-toggle");
    const logoTrigger = document.getElementById("logo-trigger");

    // Make sure toggle buttons are visible on mobile only
    if (fixedMobileToggle) {
      fixedMobileToggle.style.display = isMobile ? "flex" : "none";
    }

    if (logoTrigger) {
      logoTrigger.style.display = isMobile ? "flex" : "none";
    }
  }

  initSearch() {
    // Desktop search
    const searchInput = document.getElementById("song-search");
    const searchIcon = document.getElementById("search-icon");

    // Mobile search
    const mobileSearchInput = document.getElementById("mobile-song-search");
    const mobileSearchButton = document.querySelector(".mobile-search-button");

    // Common search function for both inputs
    const performSearch = (searchTerm) => {
      if (!searchTerm.trim()) return;

      console.log(`Searching for: ${searchTerm}`);
      this.globalSearch(searchTerm);
    };

    // Setup desktop search
    if (searchInput && searchIcon) {
      // Real-time search as user types (with debounce)
      let debounceTimer;
      searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const searchTerm = searchInput.value.trim();
          if (searchTerm && searchTerm.length >= 2) {
            performSearch(searchTerm);
          }
        }, 300); // Debounce delay of 300ms
      });

      // Search on click
      searchIcon.addEventListener("click", () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
          performSearch(searchTerm);
        }
      });

      // Search on Enter key
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const searchTerm = searchInput.value.trim();
          if (searchTerm) {
            performSearch(searchTerm);
          }
        }
      });
    }

    // Setup mobile search (similar to desktop)
    if (mobileSearchInput && mobileSearchButton) {
      // Real-time search as user types (with debounce)
      let mobileDebounceTimer;
      mobileSearchInput.addEventListener("input", () => {
        clearTimeout(mobileDebounceTimer);
        mobileDebounceTimer = setTimeout(() => {
          const searchTerm = mobileSearchInput.value.trim();
          if (searchTerm && searchTerm.length >= 2) {
            performSearch(searchTerm);

            // Don't close mobile menu during typing to allow continued searching
          }
        }, 300);
      });

      // Search on button click
      mobileSearchButton.addEventListener("click", () => {
        const searchTerm = mobileSearchInput.value.trim();
        if (searchTerm) {
          performSearch(searchTerm);

          // Close mobile menu after clicking search button
          document.body.classList.remove("menu-open");
          const mobileMenuOverlay = document.querySelector(
            ".mobile-menu-overlay"
          );
          if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove("active");
          }
        }
      });

      // Search on Enter key
      mobileSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const searchTerm = mobileSearchInput.value.trim();
          if (searchTerm) {
            performSearch(searchTerm);

            // Close mobile menu after pressing Enter
            document.body.classList.remove("menu-open");
            const mobileMenuOverlay = document.querySelector(
              ".mobile-menu-overlay"
            );
            if (mobileMenuOverlay) {
              mobileMenuOverlay.classList.remove("active");
            }
          }
        }
      });
    }
  }

  globalSearch(term) {
    // Normalize search term - case insensitive search
    const searchTerm = term.toLowerCase();

    // Search in all data sources
    let results = {
      scheduleResults: this.searchInSchedules(searchTerm),
      playlistResults: this.searchInPlaylists(searchTerm),
      requestResults: this.searchInRequests(searchTerm),
      blogResults: this.searchInBlogs(searchTerm),
    };

    // Determine which section has the most relevant results
    const sectionResults = {
      schedule: results.scheduleResults.length,
      playlist: results.playlistResults.length,
      request: results.requestResults.length,
      blog: results.blogResults.length,
    };

    // Find section with most results
    let targetSection = "playlist"; // Default to playlist if no results
    let maxResults = 0;

    for (const [section, count] of Object.entries(sectionResults)) {
      if (count > maxResults) {
        maxResults = count;
        targetSection = section;
      }
    }

    // If no results found in any section
    if (maxResults === 0) {
      // Show a message and stay on current section
      this.showSearchMessage(`No results found for "${term}"`);
      return;
    }

    // Switch to the section with the most results
    this.loadSection(targetSection, {
      searchResults: results[`${targetSection}Results`],
      searchTerm: searchTerm,
    });

    // Show search summary message
    const totalResults = Object.values(sectionResults).reduce(
      (sum, count) => sum + count,
      0
    );
    this.showSearchMessage(`Found ${totalResults} results for "${term}"`);
  }

  searchInSchedules(term) {
    if (!this.sections.schedule || !this.sections.schedule.data) return [];

    const results = [];
    const schedules = this.sections.schedule.data.schedules || [];

    schedules.forEach((schedule) => {
      // Search in minister name
      if (schedule.minister.toLowerCase().includes(term)) {
        results.push({
          type: "minister",
          date: schedule.date,
          text: schedule.minister,
          id: `minister-${new Date(schedule.date).toISOString()}`,
        });
      }

      // Search in songs
      for (const [category, songs] of Object.entries(schedule.songList)) {
        if (Array.isArray(songs)) {
          songs.forEach((song) => {
            if (song.toLowerCase().includes(term)) {
              results.push({
                type: "song",
                category: category,
                date: schedule.date,
                text: song,
                id: `${category}-${song.replace(/\s+/g, "-")}-${new Date(
                  schedule.date
                ).toISOString()}`,
              });
            }
          });
        }
      }
    });

    return results;
  }

  searchInPlaylists(term) {
    if (!this.sections.playlist || !this.sections.playlist.data) return [];

    const results = [];
    const songsData = this.sections.playlist.data.songs || [];

    songsData.forEach((song) => {
      // Search in title
      if (song.title.toLowerCase().includes(term)) {
        results.push({
          type: "song",
          text: song.title,
          id: `song-${song.id}`,
          song: song,
        });
      }

      // Search in lyrics
      if (song.lyrics && song.lyrics.toLowerCase().includes(term)) {
        results.push({
          type: "lyrics",
          text: song.lyrics.substring(0, 50) + "...",
          id: `lyrics-${song.id}`,
          song: song,
        });
      }

      // Search in author
      if (song.author && song.author.toLowerCase().includes(term)) {
        results.push({
          type: "author",
          text: song.author,
          id: `author-${song.id}`,
          song: song,
        });
      }
    });

    return results;
  }

  searchInRequests(term) {
    if (!this.sections.request || !this.sections.request.data) return [];

    const results = [];
    const requests = this.sections.request.data.requests || [];

    requests.forEach((request) => {
      // Search in song title
      if (request.songTitle.toLowerCase().includes(term)) {
        results.push({
          type: "request",
          text: request.songTitle,
          id: `request-${request.id}`,
          request: request,
        });
      }

      // Search in requester name
      if (request.requesterName.toLowerCase().includes(term)) {
        results.push({
          type: "requester",
          text: request.requesterName,
          id: `requester-${request.id}`,
          request: request,
        });
      }
    });

    return results;
  }

  searchInBlogs(term) {
    if (!this.sections.blog || !this.sections.blog.data) return [];

    const results = [];
    const articles = this.sections.blog.data.articles || [];

    articles.forEach((article) => {
      // Search in title
      if (article.title.toLowerCase().includes(term)) {
        results.push({
          type: "article",
          text: article.title,
          id: `article-${article.id}`,
          article: article,
        });
      }

      // Search in content
      if (article.content && article.content.toLowerCase().includes(term)) {
        results.push({
          type: "content",
          text: article.content.substring(0, 50) + "...",
          id: `content-${article.id}`,
          article: article,
        });
      }

      // Search in author
      if (article.author && article.author.toLowerCase().includes(term)) {
        results.push({
          type: "blogAuthor",
          text: article.author,
          id: `author-${article.id}`,
          article: article,
        });
      }
    });

    return results;
  }

  showSearchMessage(message) {
    // Create or update search message element
    let messageEl = document.getElementById("search-message");
    if (!messageEl) {
      messageEl = document.createElement("div");
      messageEl.id = "search-message";
      document.body.appendChild(messageEl);
    }

    messageEl.textContent = message;
    messageEl.classList.add("active");

    // Hide message after a delay
    setTimeout(() => {
      messageEl.classList.remove("active");
    }, 3000);
  }

  initScrollToTop() {
    const backToTopButton = document.getElementById("back-to-top");

    if (backToTopButton) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
          backToTopButton.classList.add("visible");
        } else {
          backToTopButton.classList.remove("visible");
        }
      });

      backToTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  initFttgModal() {
    const fttgLink = document.getElementById("fttg-link");
    const fttgModal = document.getElementById("fttg-modal");
    const fttgModalClose = document.getElementById("fttg-modal-close");
    const fttgIframe = document.getElementById("fttg-iframe");

    if (fttgLink && fttgModal && fttgModalClose && fttgIframe) {
      // Function to open modal
      const openModal = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop event from bubbling

        // Set the iframe src attribute now, to avoid loading until needed
        fttgIframe.src = "https://www.fttgsolutions.com";

        // Show modal and overlay
        document.body.classList.add("modal-open"); // Prevent body scrolling
        fttgModal.classList.add("visible");

        console.log("Modal opened");
      };

      // Function to close modal
      const closeModal = () => {
        document.body.classList.remove("modal-open");
        fttgModal.classList.remove("visible");

        // Clear the iframe src to stop any media/resources after animation completes
        setTimeout(() => {
          fttgIframe.src = "";
        }, 300);

        console.log("Modal closed");
      };

      // Event listeners
      fttgLink.addEventListener("click", openModal);

      fttgModalClose.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event from reaching modal content
        closeModal();
      });

      // Close when clicking on the background (outside modal content)
      fttgModal.addEventListener("click", (e) => {
        // Only close if clicking directly on the modal backdrop (not on the content)
        if (e.target === fttgModal) {
          closeModal();
        }
      });

      // Close modal with Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && fttgModal.classList.contains("visible")) {
          closeModal();
        }
      });
    }
  }

  handleSharedLinks() {
    const urlParams = new URLSearchParams(window.location.search);
    const scheduleId = urlParams.get("schedule");

    if (scheduleId) {
      // If there's a schedule parameter, navigate to the schedule section
      this.loadSection("schedule", {
        initialLoad: true,
        highlightSchedule: scheduleId,
      });

      // IMPORTANT: Don't clear the URL parameter - keep it for the highlighting to work
      // Instead, replace the state but keep the query parameter
      if (window.history.replaceState) {
        const newUrl = window.location.pathname + window.location.search;
        window.history.replaceState(
          { section: "schedule", scheduleId: scheduleId },
          "Schedule",
          newUrl
        );
      }
    }
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
    const allSections = document.querySelectorAll(".collapsible-section");
    allSections.forEach((section) => {
      section.setAttribute("data-collapsed", "true");
      section.style.display = "none";
    });

    // Show the selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
      // Show this section
      targetSection.setAttribute("data-collapsed", "false");
      targetSection.style.display = "block";

      // Update active class on navigation buttons
      document.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.getAttribute("data-section") === sectionName) {
          btn.classList.add("active");
        }
      });

      // Update active class on mobile navigation links
      document
        .querySelectorAll(".mobile-nav-links .nav-link")
        .forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("data-section") === sectionName) {
            link.classList.add("active");
          }
        });

      // Update active section
      this.activeSection = sectionName;

      // Update browser history unless this is the initial load or forced navigation
      if (!options.initialLoad && !options.skipHistory) {
        // Create a descriptive title
        const sectionTitle =
          sectionName.charAt(0).toUpperCase() + sectionName.slice(1);

        // Push new state
        history.pushState({ section: sectionName }, sectionTitle, "");
      }

      // Render the section content
      this.sections[sectionName].render(options);

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
}

// Make loadSection and adjustSectionHeight available on window.app
window.app.loadSection = function (sectionName) {
  // This will be overridden by the App class instance, but we provide a fallback
  console.log("Using fallback loadSection, app not fully initialized yet");
  const targetSection = document.getElementById(`${sectionName}-section`);
  if (targetSection) {
    // Hide all sections
    document.querySelectorAll(".collapsible-section").forEach((section) => {
      section.style.display = "none";
      section.setAttribute("data-collapsed", "true");
    });

    // Show target section
    targetSection.style.display = "block";
    targetSection.setAttribute("data-collapsed", "false");
  }
};

window.app.adjustSectionHeight = function () {
  // This will be overridden by the App class instance, but we provide a fallback
  console.log(
    "Using fallback adjustSectionHeight, app not fully initialized yet"
  );
  const activeSection = document.querySelector(
    '.collapsible-section[data-collapsed="false"]'
  );
  if (activeSection) {
    activeSection.style.minHeight = `calc(100vh - 120px)`;
  }
};

// Initialize app on DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  // Create app instance
  window.app = new App();

  // Add event listener for fixed mobile toggle button
  const fixedMobileToggle = document.getElementById("fixed-mobile-toggle");
  const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");

  if (fixedMobileToggle && mobileMenuOverlay) {
    fixedMobileToggle.addEventListener("click", function () {
      document.body.classList.add("menu-open");
      mobileMenuOverlay.classList.add("active");
    });
  }
});
