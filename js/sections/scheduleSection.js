import { scheduleData } from "../data/scheduleData.js";
import { songData } from "../data/songData.js";

export default class ScheduleSection {
  constructor() {
    this.sectionId = "schedule-section";
    this.data = scheduleData;
  }

  async loadData() {
    // In a real app, you might fetch this data from an API
    return this.data;
  }

  // Update the render method to accept search options
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

      section.appendChild(container);

      // Check for URL parameter to highlight specific schedule
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const scheduleId = urlParams.get("schedule");

        if (scheduleId) {
          this.highlightSchedule(scheduleId, isMobile);
        }
      }, 500);
    });

    // Initialize song link click handlers
    setTimeout(() => {
      const songLinks = document.querySelectorAll(".song-link");
      songLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const songId = link.getAttribute("data-song-id");
          this.showSongDetails(songId);
        });
      });
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
        const shareBtn = row.querySelector('.share-btn');
        if (shareBtn) {
          shareBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent row highlight when clicking share
            
            // Create the shareable link
            const shareUrl = `${window.location.origin}${window.location.pathname}?schedule=${scheduleId}`;
            
            // Use the Clipboard API if available
            if (navigator.clipboard) {
              navigator.clipboard.writeText(shareUrl)
                .then(() => {
                  this.showCopiedFeedback(shareBtn);
                })
                .catch(err => {
                  console.error('Could not copy text: ', err);
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
  showSongDetails(songId) {
    const song = songData.songs.find((s) => s.id === songId);
    if (!song) return;

    // Check if modal already exists, or create it
    let modal = document.querySelector(".song-details-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "song-details-modal";
      document.body.appendChild(modal);
    }

    // Create modal content
    modal.innerHTML = `
      <div class="song-details-content">
        <button class="song-details-close" aria-label="Close details">
          <ion-icon name="close-outline"></ion-icon>
        </button>
        <h2 class="song-details-title">${song.title}</h2>
        <div class="song-details-category">
          ${song.category
            .map((cat) => `<span class="song-category-tag">${cat}</span>`)
            .join("")}
        </div>
        <p class="song-details-author">By ${song.author.join(", ")}</p>
        <div class="song-details-lyrics">${song.lyrics}</div>
        <div class="song-action-buttons">
          ${
            song.url
              ? `<a href="${song.url}" class="song-action-button watch-video-button" target="_blank">
              <ion-icon name="logo-youtube"></ion-icon> Watch Video
             </a>`
              : ""
          }
        </div>
      </div>
    `;

    // Show modal
    modal.classList.add("visible");

    // Add close functionality
    const closeBtn = modal.querySelector(".song-details-close");
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("visible");
    });

    // Close when clicking outside content
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("visible");
      }
    });
  }

  // Fix the formatSongList method which is missing in your current implementation

  formatSongList(songs) {
    if (!songs || songs.length === 0) {
      return '<span class="no-songs">None</span>';
    }

    return songs
      .map((songTitle) => {
        // Find the song details from songData
        const songDetails = this.findSongByTitle(songTitle);

        if (songDetails) {
          // Create a link with song details
          return `<div class="song-item">
          <a href="#" class="song-link" 
             data-song-id="${songDetails.id}" 
             data-song-title="${songDetails.title}"
             title="${songDetails.author.join(", ")}">
             ${songTitle}
          </a>
          ${
            songDetails.url
              ? `<a href="${songDetails.url}" class="song-video-link" target="_blank" title="Watch video">
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

  // Add the missing findSongByTitle helper method
  findSongByTitle(title) {
    if (!songData || !songData.songs) return null;

    // Case-insensitive search
    return songData.songs.find(
      (song) => song.title.toLowerCase() === title.toLowerCase()
    );
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

    return colorMap[hex] || "Unknown";
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

  showCopiedFeedback(button) {
    // Add copied class for styling
    button.classList.add('copied');
    
    // Change icon to checkmark
    const icon = button.querySelector('ion-icon');
    if (icon) {
      icon.setAttribute('name', 'checkmark-outline');
    }
    
    // Reset after 2 seconds
    setTimeout(() => {
      button.classList.remove('copied');
      if (icon) {
        icon.setAttribute('name', 'share-social-outline');
      }
    }, 2000);
  }

  fallbackCopy(text, button) {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make it invisible but still on the page
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    // Select and copy
    textArea.focus();
    textArea.select();
    
    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
    
    // Remove the temporary textarea
    document.body.removeChild(textArea);
    
    // Show feedback if successful
    if (successful) {
      this.showCopiedFeedback(button);
    }
  }
}
