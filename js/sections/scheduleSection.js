import { scheduleData } from "../data/scheduleData.js";
import { songData } from "../data/songData.js";

export default class ScheduleSection {
  constructor() {
    this.sectionId = "schedule-section";
    this.data = scheduleData;

    // Make songData directly accessible to this class
    this.songData = songData;

    // Also make it globally available since your code references window.songData
    window.songData = songData;
  }

  async loadData() {
    // In a real app, you might fetch this data from an API
    return this.data;
  }

  // Update the render method to properly bind song click events
  render(options = {}) {
    const section = document.getElementById(this.sectionId);
    if (!section) return;

    const searchTerm = options.searchTerm || "";
    const searchResults = options.searchResults || [];

    this.loadData().then((data) => {
      // Clear previous content
      section.innerHTML = "";

      // Create section container
      const container = document.createElement("div");
      container.className = "section-container";

      // Create section header
      const headerEl = document.createElement("div");
      headerEl.className = "section-header";
      headerEl.innerHTML = `
        <h1>${data.title}</h1>
        <p class="subtitle">${data.description}</p>
      `;
      container.appendChild(headerEl);

      // Sort schedules by date
      const sortedSchedules = [...data.schedules].sort(
        (a, b) => a.date - b.date
      );

      // Check if we're on mobile
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // Mobile view - cards instead of table
        this.renderMobileView(container, sortedSchedules, searchTerm);
      } else {
        // Desktop view - table
        this.renderDesktopView(container, sortedSchedules, searchTerm);
      }

      // Update the section content and initialize song links
      this.updateSectionContent(container);

      // Check for URL parameter to highlight specific schedule
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const scheduleId = urlParams.get("schedule");

        if (scheduleId) {
          this.highlightSchedule(scheduleId, isMobile);
        }
      }, 300);
    });
  }

  // Add this new method to handle song link initialization
  initSongLinks() {
    console.log("Initializing song links...");

    // Use a slight delay to ensure all links are in the DOM
    setTimeout(() => {
      const songLinks = document.querySelectorAll(".song-link");
      console.log(`Found ${songLinks.length} song links`);

      if (songLinks.length === 0) {
        console.warn("No song links found. DOM might not be ready yet.");
      }

      songLinks.forEach((link) => {
        // Remove existing listeners to prevent duplicates
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);

        // Add new listener
        newLink.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation(); // Prevent parent elements from catching the click

          const songId = newLink.getAttribute("data-song-id");
          const songTitle = newLink.getAttribute("data-song-title");

          console.log(`Song link clicked: ${songTitle} (ID: ${songId})`);

          // Call a method to show song details in a modal
          this.showSongDetailsModal(songId, songTitle);
        });
      });

      // Handle video icons separately
      const videoLinks = document.querySelectorAll(".song-video-link");
      videoLinks.forEach((link) => {
        // Remove existing listeners
        const newVideoLink = link.cloneNode(true);
        link.parentNode.replaceChild(newVideoLink, link);

        // Add new listener
        newVideoLink.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Get the song ID from the parent song-item's song-link
          const songLink = newVideoLink
            .closest(".song-item")
            .querySelector(".song-link");
          if (songLink) {
            const songId = songLink.getAttribute("data-song-id");
            const songTitle = songLink.getAttribute("data-song-title");

            console.log(`Video link clicked for: ${songTitle}`);
            this.showSongDetailsModal(songId, songTitle);
          }
        });
      });

      console.log("Song links initialization complete");
    }, 500);
  }

  // Method to render desktop view (table)
  renderDesktopView(container, sortedSchedules, searchTerm) {
    // Create schedule table container with horizontal scroll capability
    const tableContainer = document.createElement("div");
    tableContainer.className = "table-container";

    // Create schedule table
    const table = document.createElement("table");
    table.className = "schedule-table";

    // Create table header
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Date</th>
        <th>Minister</th>
        <th>Opening</th>
        <th>Praise</th>
        <th>Closing</th>
        <th>Offering</th>
        <th>Hymn</th>
        <th>Color</th>
      </tr>
    `;
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");

    // Add rows with alternating styles
    sortedSchedules.forEach((schedule, index) => {
      const row = document.createElement("tr");

      // Create a unique ID for this schedule based on date and minister
      const scheduleId = this.createScheduleId(schedule);
      row.setAttribute("id", scheduleId);

      // Add alternating class for styling
      row.className = index % 2 === 0 ? "even-row" : "odd-row";

      // Normalize color to array if it's not already
      const colors = Array.isArray(schedule.color)
        ? schedule.color
        : [schedule.color];

      // Apply row color as a left border gradient if multiple colors, or solid if single color
      if (colors.length > 1) {
        row.style.borderLeft = `4px solid`;
        row.style.borderImage = `linear-gradient(to bottom, ${colors.join(
          ", "
        )}) 1`;
      } else {
        row.style.borderLeft = `4px solid ${colors[0]}`;
      }

      // Format date
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(schedule.date);

      // Format song lists
      const openingSongs = this.formatSongList(schedule.songList.opening);
      const praiseSongs = this.formatSongList(schedule.songList.praise);
      const closingSongs = this.formatSongList(schedule.songList.closing);
      const offeringSongs = this.formatSongList(schedule.songList.offering);
      const hymnSongs = this.formatSongList(schedule.songList.hymn);

      // Create color swatches HTML for display
      const colorSwatches = this.createColorSwatchesHTML(colors);

      // Update the row HTML with simplified share button
      row.innerHTML = `
        <td data-label="Date" class="date-cell">
          <div class="clickable-date">${formattedDate}</div>
          <div class="share-actions">
            <button class="share-btn" title="Share this schedule" aria-label="Copy schedule link">
              <ion-icon name="share-social-outline"></ion-icon>
            </button>
          </div>
        </td>
        <td data-label="Minister">${schedule.minister}</td>
        <td data-label="Opening">${openingSongs}</td>
        <td data-label="Praise">${praiseSongs}</td>
        <td data-label="Closing">${closingSongs}</td>
        <td data-label="Offering">${offeringSongs}</td>
        <td data-label="Hymn">${hymnSongs}</td>
        <td data-label="Color">${colorSwatches}</td>
      `;

      // Add click event to the date cell to highlight the row
      setTimeout(() => {
        const dateCell = row.querySelector(".clickable-date");
        if (dateCell) {
          dateCell.addEventListener("click", () => {
            // Remove highlight from all rows
            tbody.querySelectorAll("tr").forEach((r) => {
              r.classList.remove("row-highlighted");
              r.classList.remove("animate-in");
            });

            // Add highlight to this row
            row.classList.add("row-highlighted");

            // Add animation class with a small delay for proper sequencing
            setTimeout(() => {
              row.classList.add("animate-in");
            }, 10);

            // Scroll to center if needed
            row.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          });
        }

        // Add click event to share button for direct copying
        const shareBtn = row.querySelector(".share-btn");
        if (shareBtn) {
          shareBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent row highlight when clicking share

            // Create the shareable link
            const shareUrl = `${window.location.origin}${window.location.pathname}?schedule=${scheduleId}`;

            // Use the Clipboard API if available
            if (navigator.clipboard) {
              navigator.clipboard
                .writeText(shareUrl)
                .then(() => {
                  this.showCopiedFeedback(shareBtn);
                })
                .catch((err) => {
                  console.error("Could not copy text: ", err);
                  this.fallbackCopy(shareUrl, shareBtn);
                });
            } else {
              this.fallbackCopy(shareUrl, shareBtn);
            }
          });
        }

        // Add click event to share link for copying (replacing the copy button)
        const shareLink = row.querySelector(".share-link");
        if (shareLink) {
          shareLink.addEventListener("click", (e) => {
            e.stopPropagation();
            shareLink.select();
            document.execCommand("copy");

            // Show feedback
            const container = shareLink.closest(".share-link-container");
            container.classList.add("copied");

            // Reset after a moment
            setTimeout(() => {
              container.classList.remove("copied");
            }, 2000);
          });
        }
      }, 100);

      // Add the row to the table body
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
  }

  // Method to render mobile view (cards)
  renderMobileView(container, sortedSchedules, searchTerm) {
    // Create a cards container
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "schedule-cards-container";

    // Add card for each schedule
    sortedSchedules.forEach((schedule, index) => {
      // Create a unique ID for this schedule
      const scheduleId = this.createScheduleId(schedule);

      // Format date
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(schedule.date);

      // Format day number and month for visual display
      const day = schedule.date.getDate();
      const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
        schedule.date
      );

      // Normalize color to array if it's not already
      const colors = Array.isArray(schedule.color)
        ? schedule.color
        : [schedule.color];

      // Create border style
      let borderStyle = "";
      if (colors.length > 1) {
        borderStyle = `border-left: 6px solid; border-image: linear-gradient(to bottom, ${colors.join(
          ", "
        )}) 1;`;
      } else {
        borderStyle = `border-left: 6px solid ${colors[0]};`;
      }

      // Create color swatches HTML
      const colorSwatches = this.createColorSwatchesHTML(colors);

      // Create a card element
      const card = document.createElement("div");
      card.className = "schedule-card";
      card.id = scheduleId + "-card";
      card.setAttribute("style", borderStyle);

      // Format song lists
      const openingSongs = this.formatSongList(schedule.songList.opening);
      const praiseSongs = this.formatSongList(schedule.songList.praise);
      const closingSongs = this.formatSongList(schedule.songList.closing);
      const offeringSongs = this.formatSongList(schedule.songList.offering);
      const hymnSongs = this.formatSongList(schedule.songList.hymn);

      // Create the card content
      card.innerHTML = `
        <div class="card-header">
          <div class="date-badge">
            <span class="date-month">${month}</span>
            <span class="date-day">${day}</span>
          </div>
          <div class="card-header-info">
            <div class="date-text">${formattedDate}</div>
            <div class="minister-name">${schedule.minister}</div>
          </div>
          <div class="share-actions">
            <button class="share-btn" title="Share this schedule" aria-label="Copy schedule link">
              <ion-icon name="share-social-outline"></ion-icon>
            </button>
          </div>
          <button class="toggle-button" aria-label="Toggle details">
            <ion-icon name="chevron-down-outline"></ion-icon>
          </button>
        </div>
        <div class="card-content collapsed">
          <div class="card-content-grid">
            <div class="song-category">
              <h4>Opening</h4>
              ${openingSongs}
            </div>
            <div class="song-category">
              <h4>Praise</h4>
              ${praiseSongs}
            </div>
            <div class="song-category">
              <h4>Closing</h4>
              ${closingSongs}
            </div>
            <div class="song-category">
              <h4>Offering</h4>
              ${offeringSongs}
            </div>
            <div class="song-category">
              <h4>Hymn</h4>
              ${hymnSongs}
            </div>
            <div class="song-category">
              <h4>Color</h4>
              ${colorSwatches}
            </div>
          </div>
        </div>
      `;

      cardsContainer.appendChild(card);

      // Add event listeners (after DOM is ready)
      setTimeout(() => {
        // Toggle card expansion on button click
        const toggleButton = card.querySelector(".toggle-button");
        const cardContent = card.querySelector(".card-content");
        const icon = toggleButton.querySelector("ion-icon");

        toggleButton.addEventListener("click", () => {
          cardContent.classList.toggle("collapsed");

          if (cardContent.classList.contains("collapsed")) {
            icon.setAttribute("name", "chevron-down-outline");
          } else {
            icon.setAttribute("name", "chevron-up-outline");
          }
        });

        // Add click event to share button
        const shareBtn = card.querySelector(".share-btn");
        if (shareBtn) {
          shareBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            // Toggle share link container visibility
            const shareLinkContainer = card.querySelector(
              ".share-link-container"
            );
            const isVisible = shareLinkContainer.classList.contains("visible");

            // Close all open share containers first
            document
              .querySelectorAll(".share-link-container.visible")
              .forEach((container) => {
                container.classList.remove("visible");
              });

            // Toggle this one if it wasn't the one that was open
            if (!isVisible) {
              shareLinkContainer.classList.add("visible");
            }
          });
        }

        // Add click event to copy button
        const copyBtn = card.querySelector(".copy-link-btn");
        if (copyBtn) {
          copyBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const shareLink = card.querySelector(".share-link");
            shareLink.select();
            document.execCommand("copy");

            // Show feedback
            copyBtn.setAttribute("title", "Copied!");
            copyBtn
              .querySelector("ion-icon")
              .setAttribute("name", "checkmark-outline");

            // Reset after a moment
            setTimeout(() => {
              copyBtn.setAttribute("title", "Copy link");
              copyBtn
                .querySelector("ion-icon")
                .setAttribute("name", "copy-outline");
            }, 2000);
          });
        }

        // Make card header clickable to highlight card
        const cardHeader = card.querySelector(".card-header");
        cardHeader.addEventListener("click", (e) => {
          // Don't trigger if clicking share or toggle buttons
          if (
            e.target.closest(".share-btn") ||
            e.target.closest(".toggle-button")
          ) {
            return;
          }

          // Remove highlight from all cards
          document.querySelectorAll(".schedule-card").forEach((c) => {
            c.classList.remove("row-highlighted");
          });

          // Add highlight to this card
          card.classList.add("row-highlighted");
        });
      }, 100);
    });

    container.appendChild(cardsContainer);
  }

  // Helper method to highlight a specific schedule by ID
  highlightSchedule(scheduleId, isMobile) {
    if (isMobile) {
      // Mobile - highlight card
      const card = document.getElementById(scheduleId + "-card");
      if (card) {
        // Remove highlight from all cards
        document.querySelectorAll(".schedule-card").forEach((c) => {
          c.classList.remove("row-highlighted");
          c.classList.remove("animate-in");
        });

        // Add highlight and animation to this card
        card.classList.add("row-highlighted");

        // Use setTimeout to ensure the animation class is applied after the highlight class
        setTimeout(() => {
          card.classList.add("animate-in");
        }, 10);

        // Expand the card
        const cardContent = card.querySelector(".card-content");
        const icon = card.querySelector(".toggle-button ion-icon");
        cardContent.classList.remove("collapsed");
        icon.setAttribute("name", "chevron-up-outline");

        // Scroll to the card
        card.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    } else {
      // Desktop - highlight row
      const row = document.getElementById(scheduleId);
      if (row) {
        // Remove highlight from all rows
        document.querySelectorAll("tr.row-highlighted").forEach((r) => {
          r.classList.remove("row-highlighted");
          r.classList.remove("animate-in");
        });

        // Add highlight and animation to this row
        row.classList.add("row-highlighted");

        // Use setTimeout to ensure the animation class is applied after the highlight class
        setTimeout(() => {
          row.classList.add("animate-in");
        }, 10);

        // Scroll to the row
        row.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }

  // Helper method to create a unique ID for a schedule
  createScheduleId(schedule) {
    const dateStr = new Date(schedule.date).toISOString().split("T")[0];
    const ministerSlug = schedule.minister
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    return `schedule-${dateStr}-${ministerSlug}`;
  }

  // Add this method to your ScheduleSection class
  showSongDetailsModal(songId, songTitle) {
    console.log(`Showing modal for song: ${songTitle} (ID: ${songId})`);

    // Find the song in the song data
    const song = this.findSongById(songId);
    if (!song) {
      console.error(`Song with ID ${songId} not found`);
      return;
    }

    // Create modal if it doesn't exist
    let modal = document.getElementById("song-details-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "song-details-modal";
      modal.className = "song-modal";
      document.body.appendChild(modal);
    }

    // Set the modal content with song details and embedded video
    modal.innerHTML = `
      <div class="song-modal-content">
        <button class="song-modal-close" aria-label="Close">
          <ion-icon name="close-outline"></ion-icon>
        </button>
        
        <div class="song-modal-header">
          <h2>${song.title}</h2>
          <div class="song-details-meta">
            <div class="song-authors">
              <strong>By:</strong> ${
                song.author ? song.author.join(", ") : "Unknown"
              }
            </div>
            <div class="song-key">
              <strong>Key:</strong> ${song.key || "Not specified"}
            </div>
            <div class="song-category">
              <strong>Category:</strong> ${song.category || "General"}
            </div>
          </div>
        </div>
        
        <div class="song-content-container">
          <div class="song-modal-columns">
            <div class="song-lyrics-column">
              <div class="lyrics-container">
                <h3>Lyrics</h3>
                <div class="song-lyrics">
                  ${this.formatLyrics(song.lyrics)}
                </div>
              </div>
            </div>
            
            ${
              song.url
                ? `
            <div class="song-video-column">
              <div class="video-container">
                <h3>Video</h3>
                <div class="song-video-embed">
                  <iframe 
                    src="${this.formatVideoUrl(song.url)}" 
                    frameborder="0" 
                    allowfullscreen 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                  </iframe>
                </div>
              </div>
            </div>`
                : ""
            }
          </div>
          
          <div class="song-modal-footer">
            <div class="song-actions">
              <button class="song-action-btn print-btn">
                <ion-icon name="print-outline"></ion-icon> Print
              </button>
              <button class="song-action-btn share-btn">
                <ion-icon name="share-social-outline"></ion-icon> Share
              </button>
              ${
                song.chords
                  ? `
              <button class="song-action-btn chords-btn">
                <ion-icon name="musical-notes-outline"></ion-icon> Show Chords
              </button>`
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listener to close button
    const closeBtn = modal.querySelector(".song-modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("visible");
        setTimeout(() => {
          document.body.classList.remove("modal-open");
        }, 300);
      });
    }

    // Add event listeners to buttons
    const printBtn = modal.querySelector(".print-btn");
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        this.printSongLyrics(song);
      });
    }

    const shareBtn = modal.querySelector(".share-btn");
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        this.shareSong(song);
      });
    }

    const chordsBtn = modal.querySelector(".chords-btn");
    if (chordsBtn && song.chords) {
      chordsBtn.addEventListener("click", () => {
        const lyricsContainer = modal.querySelector(".song-lyrics");
        lyricsContainer.classList.toggle("show-chords");

        if (lyricsContainer.classList.contains("show-chords")) {
          chordsBtn.innerHTML =
            '<ion-icon name="musical-notes-outline"></ion-icon> Hide Chords';
          lyricsContainer.innerHTML = this.formatLyricsWithChords(
            song.lyrics,
            song.chords
          );
        } else {
          chordsBtn.innerHTML =
            '<ion-icon name="musical-notes-outline"></ion-icon> Show Chords';
          lyricsContainer.innerHTML = this.formatLyrics(song.lyrics);
        }
      });
    }

    // Show the modal
    document.body.classList.add("modal-open");
    setTimeout(() => {
      modal.classList.add("visible");
    }, 10);

    console.log("Modal should now be visible");
  }

  // Helper method to find song by ID
  findSongById(id) {
    // First try window.songData
    if (window.songData && window.songData.songs) {
      const song = window.songData.songs.find((song) => song.id === id);
      if (song) return song;
    }

    // Fall back to the local reference if window.songData fails
    if (this.songData && this.songData.songs) {
      return this.songData.songs.find((song) => song.id === id);
    }

    console.error(
      `Song with ID ${id} not found. Song data might not be loaded correctly.`
    );
    console.log("Available song data:", this.songData);
    return null;
  }

  // Similarly update findSongByTitle
  findSongByTitle(title) {
    // First try window.songData
    if (window.songData && window.songData.songs) {
      const song = window.songData.songs.find(
        (song) => song.title.toLowerCase() === title.toLowerCase()
      );
      if (song) return song;
    }

    // Fall back to the local reference if window.songData fails
    if (this.songData && this.songData.songs) {
      return this.songData.songs.find(
        (song) => song.title.toLowerCase() === title.toLowerCase()
      );
    }

    return null;
  }

  // Helper method to format lyrics
  formatLyrics(lyrics) {
    if (!lyrics) return '<p class="no-lyrics">No lyrics available</p>';

    // Basic formatting: split into paragraphs and add line breaks
    return lyrics
      .split("\n\n")
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  // Helper method to format lyrics with chords
  formatLyricsWithChords(lyrics, chords) {
    if (!lyrics || !chords) return this.formatLyrics(lyrics);

    // This is a simplified version - you'd need to implement a proper chord parser
    // For now, we'll just add chords above the lyrics
    return `
      <div class="chords-section">
        <h4>Chords</h4>
        <pre class="chord-sheet">${chords}</pre>
      </div>
      <div class="lyrics-section">
        <h4>Lyrics</h4>
        ${this.formatLyrics(lyrics)}
      </div>
    `;
  }

  // Helper method to format video URL for embedding
  formatVideoUrl(url) {
    // Handle YouTube URLs
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      // Extract video ID
      let videoId = "";

      if (url.includes("v=")) {
        videoId = url.split("v=")[1];
        const ampersandPosition = videoId.indexOf("&");
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1];
      }

      return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0&enable_js=1`;
    }

    // Handle Vimeo URLs
    if (url.includes("vimeo.com")) {
      const vimeoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${vimeoId}`;
    }

    // Default: return the original URL
    return url;
  }

  // Helper method to print song lyrics
  printSongLyrics(song) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${song.title} - Lyrics</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { color: #4a88f9; margin-bottom: 5px; }
            .authors { color: #555; margin-bottom: 20px; }
            .lyrics { white-space: pre-wrap; }
            .footer { margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>${song.title}</h1>
          <div class="authors">By: ${song.author.join(", ")}</div>
          <div class="lyrics">${song.lyrics || "No lyrics available"}</div>
          <div class="footer">Printed from EazyChoir</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // Helper method to share song
  shareSong(song) {
    // Create a sharable link to the song
    const songLink = `${window.location.origin}${window.location.pathname}?song=${song.id}`;

    // Check if Web Share API is available
    if (navigator.share) {
      navigator
        .share({
          title: `${song.title} - EazyChoir`,
          text: `Check out "${song.title}" by ${song.author.join(", ")}`,
          url: songLink,
        })
        .catch((err) => {
          console.error("Share failed:", err);
          this.fallbackShare(songLink);
        });
    } else {
      this.fallbackShare(songLink);
    }
  }

  // Fallback sharing method
  fallbackShare(link) {
    // Create a temporary input to copy the link
    const input = document.createElement("input");
    input.value = link;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    // Show a notification that the link was copied
    alert("Link copied to clipboard!");
  }

  // Add the missing formatSongList method
  formatSongList(songs) {
    if (!songs || songs.length === 0) {
      return '<span class="no-songs">None</span>';
    }

    return songs
      .map((songTitle) => {
        // Find the song details from songData
        const songDetails = this.findSongByTitle(songTitle);

        if (songDetails) {
          // Create a link with song details - ensure data attributes are correct
          return `<div class="song-item">
          <a href="#" class="song-link" 
             data-song-id="${songDetails.id}" 
             data-song-title="${songDetails.title.replace(/"/g, "&quot;")}"
             title="${
               songDetails.author
                 ? songDetails.author.join(", ").replace(/"/g, "&quot;")
                 : ""
             }">
             ${songTitle}
          </a>
          ${
            songDetails.url
              ? `<a href="#" class="song-video-link" title="Watch video">
               <ion-icon name="play-circle-outline"></ion-icon>
             </a>`
              : ""
          }
        </div>`;
        } else {
          // Just show the song title without links if no details found
          return `<div class="song-item">${songTitle}</div>`;
        }
      })
      .join("");
  }

  // Add the missing createColorSwatchesHTML method
  createColorSwatchesHTML(colors) {
    // If no colors, return empty string
    if (!colors || colors.length === 0) return "";

    // Map each color to a color swatch with tooltip
    const swatches = colors
      .map((color) => {
        const colorName = this.getColorName(color);
        return `<div class="color-swatch" style="background-color: ${color};" title="${colorName}"></div>`;
      })
      .join("");

    // Get combined color names for accessibility and display
    const colorNames = this.getColorNamesString(colors);

    // Return both the visual swatches and the text description
    return `
      <div class="color-swatches">
        ${swatches}
      </div>
      <div class="color-names">${colorNames}</div>
    `;
  }

  // Add the missing getColorName method
  getColorName(hex) {
    const colorMap = {
      "#cccccc": "Gray",
      "#4a88f9": "Blue",
      "#ffffff": "White",
      "#e63946": "Red",
      "#000000": "Black",
      "#8B4513": "Brown",
      "#32a852": "Green",
      "#FFC0CB": "Pink",
      "#ffb703": "Yellow",
      // Add any other colors you use
    };

    return colorMap[hex.toLowerCase()] || "Unknown";
  }

  // Add the missing getColorNamesString method
  getColorNamesString(colors) {
    if (!colors || colors.length === 0) return "";

    const colorNames = colors.map((color) => this.getColorName(color));

    // If multiple colors, join with commas and "and"
    if (colorNames.length > 1) {
      const lastColor = colorNames.pop();
      return `${colorNames.join(", ")} and ${lastColor}`;
    }

    return colorNames[0];
  }

  // Add the missing showCopiedFeedback method
  showCopiedFeedback(button) {
    // Add copied class for styling
    button.classList.add("copied");

    // Change icon to checkmark
    const icon = button.querySelector("ion-icon");
    if (icon) {
      icon.setAttribute("name", "checkmark-outline");
    }

    // Reset after 2 seconds
    setTimeout(() => {
      button.classList.remove("copied");
      if (icon) {
        icon.setAttribute("name", "share-social-outline");
      }
    }, 2000);
  }

  // Add the missing fallbackCopy method
  fallbackCopy(text, button) {
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Make it invisible but still on the page
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);

    // Select and copy
    textArea.focus();
    textArea.select();

    let successful = false;
    try {
      successful = document.execCommand("copy");
    } catch (err) {
      console.error("Fallback copy failed: ", err);
    }

    // Remove the temporary textarea
    document.body.removeChild(textArea);

    // Show feedback if successful
    if (successful) {
      this.showCopiedFeedback(button);
    }
  }

  // Helper to setup the song links after schedule is rendered
  updateSectionContent(container) {
    // First update the section container
    const section = document.getElementById(this.sectionId);
    if (section) {
      section.innerHTML = "";
      section.appendChild(container);

      // Now initialize song links after content is in the DOM
      console.log("Section content updated, initializing song links");
      this.initSongLinks();
    }
  }
}
