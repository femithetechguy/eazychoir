import { homeData } from '../data/homeData.js';

export default class HomeSection {
  constructor() {
    this.sectionId = 'home-section';
    this.data = homeData;
  }

  async loadData() {
    // In a real app, you might fetch this data from an API
    return this.data;
  }

  render() {
    const section = document.getElementById(this.sectionId);
    if (!section) return;

    this.loadData().then(data => {
      // Clear previous content
      section.innerHTML = '';
      
      // Create section container
      const container = document.createElement('div');
      container.className = 'section-container';
      
      // Content wrapper for proper flex behavior
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'content-fill';
      
      // Welcome banner
      const welcomeBanner = document.createElement('div');
      welcomeBanner.className = 'welcome-banner';
      welcomeBanner.innerHTML = `
        <h1>${data.title}</h1>
        <p class="subtitle">${data.subtitle}</p>
      `;
      contentWrapper.appendChild(welcomeBanner);
      
      // Section divider
      contentWrapper.appendChild(this.createDivider('home-outline'));
      
      // About Us
      const homeContent = document.createElement('div');
      homeContent.className = 'home-content';
      homeContent.innerHTML = `
        <h2>${data.aboutUs.title}</h2>
        ${data.aboutUs.paragraphs.map(p => `<p style="font-size: 1.1rem !important;">${p}</p>`).join('')}
      `;
      contentWrapper.appendChild(homeContent);
      
      // Section divider
      contentWrapper.appendChild(this.createDivider('calendar-outline'));
      
      // Upcoming Events
      const schedulePreview = document.createElement('div');
      schedulePreview.className = 'schedule-preview preview-section';
      schedulePreview.innerHTML = `
        <h2>${data.upcomingEvents.title}</h2>
        <div class="view-all-link">
          <button class="preview-link-btn">View All Events <ion-icon name="arrow-forward-outline"></ion-icon></button>
        </div>
      `;
      
      // Add event listener to "View All" button
      schedulePreview.querySelector('.preview-link-btn').addEventListener('click', () => {
        window.app.loadSection('schedule');
      });
      
      data.upcomingEvents.events.forEach(event => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
          <div class="date-badge">${event.date}</div>
          <div class="preview-details">
            <h3>${event.title}</h3>
            <p>${event.description}</p>
          </div>
        `;
        previewItem.addEventListener('click', () => {
          window.app.loadSection('schedule');
        });
        schedulePreview.appendChild(previewItem);
      });
      
      contentWrapper.appendChild(schedulePreview);
      
      // Section divider
      contentWrapper.appendChild(this.createDivider('musical-notes-outline'));
      
      // Featured Songs
      const playlistPreview = document.createElement('div');
      playlistPreview.className = 'playlist-preview preview-section';
      playlistPreview.innerHTML = `
        <h2>${data.featuredSongs.title}</h2>
        <div class="view-all-link">
          <button class="preview-link-btn">Browse All Songs <ion-icon name="arrow-forward-outline"></ion-icon></button>
        </div>
      `;
      
      // Add event listener to "Browse All" button
      playlistPreview.querySelector('.preview-link-btn').addEventListener('click', () => {
        window.app.loadSection('playlist');
      });
      
      const songCards = document.createElement('div');
      songCards.className = 'song-cards';
      
      data.featuredSongs.songs.forEach(song => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
          <ion-icon name="${song.icon}"></ion-icon>
          <h3>${song.title}</h3>
        `;
        songCard.addEventListener('click', () => {
          window.app.loadSection('playlist');
        });
        songCards.appendChild(songCard);
      });
      
      playlistPreview.appendChild(songCards);
      contentWrapper.appendChild(playlistPreview);
      
      // Section divider
      contentWrapper.appendChild(this.createDivider('chatbubble-ellipses-outline'));
      
      // Song Requests
      const requestPreview = document.createElement('div');
      requestPreview.className = 'request-preview preview-section';
      requestPreview.innerHTML = `
        <h2>${data.songRequests.title}</h2>
        <p>${data.songRequests.description}</p>
        <button class="preview-button">${data.songRequests.buttonText}</button>
      `;
      
      // Add event listener to request button
      requestPreview.querySelector('.preview-button').addEventListener('click', () => {
        window.app.loadSection('request');
      });
      
      contentWrapper.appendChild(requestPreview);
      
      // Section divider
      contentWrapper.appendChild(this.createDivider('book-outline'));
      
      // Latest Articles
      const blogPreview = document.createElement('div');
      blogPreview.className = 'blog-preview preview-section';
      blogPreview.innerHTML = `
        <h2>${data.latestArticles.title}</h2>
        <div class="view-all-link">
          <button class="preview-link-btn">Read All Articles <ion-icon name="arrow-forward-outline"></ion-icon></button>
        </div>
      `;
      
      // Add event listener to "Read All" button
      blogPreview.querySelector('.preview-link-btn').addEventListener('click', () => {
        window.app.loadSection('blog');
      });
      
      data.latestArticles.articles.forEach(article => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
          <div class="preview-details">
            <h3>${article.title}</h3>
            <p>${article.description}</p>
          </div>
        `;
        previewItem.addEventListener('click', () => {
          window.app.loadSection('blog');
        });
        blogPreview.appendChild(previewItem);
      });
      
      contentWrapper.appendChild(blogPreview);
      container.appendChild(contentWrapper);
      section.appendChild(container);
      
      // Ensure the section fills the viewport
      if (window.app && typeof window.app.adjustSectionHeight === 'function') {
        window.app.adjustSectionHeight();
      } else {
        // Fallback behavior if the function doesn't exist
        console.log('adjustSectionHeight function not available, using fallback');
        
        // Basic fallback to adjust section heights if needed
        const sections = document.querySelectorAll('.collapsible-section');
        sections.forEach(section => {
          if (section.getAttribute('data-collapsed') === 'false') {
            section.style.minHeight = `calc(100vh - var(--header-height) - var(--footer-height))`;
          }
        });
      }
    });
  }
  
  createDivider(iconName) {
    const divider = document.createElement('div');
    divider.className = 'section-divider';
    divider.innerHTML = `<span class="divider-icon"><ion-icon name="${iconName}"></ion-icon></span>`;
    return divider;
  }
}