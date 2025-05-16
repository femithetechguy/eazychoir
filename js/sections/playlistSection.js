import { playlistData } from '../data/playlistData.js';

export default class PlaylistSection {
  constructor() {
    this.sectionId = 'playlist-section';
    this.data = playlistData;
  }

  async loadData() {
    // In a real app, you might fetch this data from an API
    return this.data;
  }

  render(options = {}) {
    const section = document.getElementById(this.sectionId);
    if (!section) return;

    this.loadData().then(data => {
      // Clear previous content
      section.innerHTML = '';
      
      // Create section container
      const container = document.createElement('div');
      container.className = 'section-container';
      
      // Add header
      const header = document.createElement('div');
      header.className = 'section-header';
      header.innerHTML = `
        <h1>${data.title}</h1>
        <p class="subtitle">${data.description}</p>
      `;
      container.appendChild(header);
      
      // Add category filters
      const filterContainer = document.createElement('div');
      filterContainer.className = 'filter-container';
      filterContainer.innerHTML = '<span>Filter by: </span>';
      
      const allFilter = document.createElement('button');
      allFilter.className = 'filter-btn active';
      allFilter.textContent = 'All';
      allFilter.addEventListener('click', () => this.filterSongs(null));
      filterContainer.appendChild(allFilter);
      
      data.categories.forEach(category => {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-btn';
        filterBtn.textContent = category;
        filterBtn.addEventListener('click', () => this.filterSongs(category));
        filterContainer.appendChild(filterBtn);
      });
      
      container.appendChild(filterContainer);
      
      // Add songs
      const songsContainer = document.createElement('div');
      songsContainer.className = 'songs-container';
      
      // Filter songs if a search term is provided
      let filteredSongs = data.songs;
      if (options.searchTerm) {
        filteredSongs = data.songs.filter(song => 
          song.title.toLowerCase().includes(options.searchTerm.toLowerCase()) ||
          song.composer.toLowerCase().includes(options.searchTerm.toLowerCase())
        );
        
        // Show search results message
        const searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        searchResults.innerHTML = `
          <p>Showing results for: "${options.searchTerm}" (${filteredSongs.length} songs found)</p>
          <button class="clear-search">Clear Search</button>
        `;
        searchResults.querySelector('.clear-search').addEventListener('click', () => {
          this.render();
        });
        container.appendChild(searchResults);
      }
      
      filteredSongs.forEach(song => {
        const songCard = document.createElement('div');
        songCard.className = `song-card ${song.featured ? 'featured' : ''}`;
        songCard.setAttribute('data-category', song.category);
        songCard.innerHTML = `
          <div class="song-info">
            <h3>${song.title}</h3>
            <p class="composer">${song.composer}</p>
            <p class="difficulty">Difficulty: ${song.difficulty}</p>
            <p class="category">Category: ${song.category}</p>
          </div>
          <div class="song-actions">
            <a href="${song.sheetMusicUrl}" class="action-btn" target="_blank">
              <ion-icon name="document-outline"></ion-icon> Sheet Music
            </a>
            <button class="action-btn play-audio" data-audio="${song.audioUrl}">
              <ion-icon name="play-outline"></ion-icon> Play
            </button>
          </div>
        `;
        songsContainer.appendChild(songCard);
      });
      
      container.appendChild(songsContainer);
      section.appendChild(container);
      
      // Add event listeners to play buttons
      section.querySelectorAll('.play-audio').forEach(button => {
        button.addEventListener('click', () => {
          const audioUrl = button.getAttribute('data-audio');
          this.playAudio(audioUrl);
        });
      });
    });
  }
  
  filterSongs(category) {
    const songCards = document.querySelectorAll('.song-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    filterButtons.forEach(btn => {
      btn.classList.remove('active');
      if (
        (category === null && btn.textContent === 'All') || 
        btn.textContent === category
      ) {
        btn.classList.add('active');
      }
    });
    
    // Filter songs
    songCards.forEach(card => {
      if (category === null || card.getAttribute('data-category') === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  playAudio(audioUrl) {
    // Create an audio element and play
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      alert('Unable to play audio. Please try again later.');
    });
  }
}