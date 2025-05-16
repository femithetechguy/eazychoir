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

    // Use event delegation for more reliable click handling
    const section = document.getElementById(this.sectionId);
    if (!section) return;

    section.addEventListener("click", (e) => {
      // Handle song links
      const songLink = e.target.closest(".song-link");
      if (songLink) {
        e.preventDefault();
        e.stopPropagation();

        const songId = songLink.getAttribute("data-song-id");
        const songTitle = songLink.getAttribute("data-song-title");

        console.log(`Song link clicked: ${songTitle} (ID: ${songId})`);
        this.showSongDetailsModal(songId, songTitle);
      }

      // Handle video links
      const videoLink = e.target.closest(".song-video-link");
      if (videoLink) {
        e.preventDefault();
        e.stopPropagation();

        const songItem = videoLink.closest(".song-item");
        if (songItem) {
          const songLink = songItem.querySelector(".song-link");
          if (songLink) {
            const songId = songLink.getAttribute("data-song-id");
            const songTitle = songLink.getAttribute("data-song-title");

            console.log(`Video link clicked for: ${songTitle}`);
            this.showSongDetailsModal(songId, songTitle);
          }
        }
      }
    });

    console.log("Song links initialized with event delegation");
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

      // Add the data-schedule-id attribute for sharing functionality
      row.setAttribute("data-schedule-id", scheduleId);

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

      // Add the data-schedule-id attribute for sharing functionality
      card.setAttribute("data-schedule-id", scheduleId);

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

  // Add this helper method to find songs by title
  findSongByTitle(title) {
    if (!window.songData || !window.songData.songs) {
      return null;
    }

    // Case-insensitive search
    const song = window.songData.songs.find(
      (song) => song.title.toLowerCase() === title.toLowerCase()
    );

    return song || null;
  }

  // Add this method to your ScheduleSection class
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
    // Standardize hex format (lowercase and with # if missing)
    const standardHex = hex.toLowerCase().startsWith("#")
      ? hex.toLowerCase()
      : `#${hex.toLowerCase()}`;

    const colorMap = {
      "#cccccc": "Gray",
      "#4a88f9": "Blue",
      "#ffffff": "White",
      "#e63946": "Red",
      "#000000": "Black",
      "#8b4513": "Brown",
      "#32a852": "Green",
      "#ffc0cb": "Pink",
      "#ffb703": "Yellow",
      "#8a4efc": "Purple",
      "#ffd700": "Gold",
    };

    return colorMap[standardHex] || "Unknown";
  }

  // Add the missing getColorNamesString method
  getColorNamesString(colors) {
    if (!colors || colors.length === 0) return "";

    const colorNames = colors.map((color) => {
      const name = this.getColorName(color);
      return name === "Unknown" ? `${name} (${color})` : name;
    });

    // If multiple colors, join with commas and "and"
    if (colorNames.length > 1) {
      const lastColor = colorNames.pop();
      return `${colorNames.join(", ")} and ${lastColor}`;
    }

    return colorNames[0];
  }

  // Add this method to your ScheduleSection class
  showShareSuccess(button) {
    // Check if button exists and is still in the DOM
    if (!button || !document.body.contains(button)) {
      console.warn("Share button not found or no longer in DOM");
      return;
    }

    try {
      // Add copied class for styling
      button.classList.add("copied");

      // Change icon to checkmark if icon exists
      const icon = button.querySelector("ion-icon");
      if (icon) {
        icon.setAttribute("name", "checkmark-outline");
      }

      // Reset after 2 seconds with DOM checks
      setTimeout(() => {
        // Store button reference in a variable to avoid closure issues
        const btn = button;

        // Check if button still exists in the DOM before modifying
        if (btn && document.body.contains(btn)) {
          try {
            btn.classList.remove("copied");

            // Check if icon still exists and is still in the button
            const currentIcon = btn.querySelector("ion-icon");
            if (currentIcon) {
              currentIcon.setAttribute("name", "share-social-outline");
            }
          } catch (err) {
            console.error("Error resetting button state:", err);
          }
        }
      }, 2000);
    } catch (error) {
      console.error("Error in showShareSuccess:", error);
    }
  }

  // Fix for share button in scheduleSection.js

  // Replace the current share functionality with this updated method
  setupShareButtons() {
    console.log("Setting up share buttons...");

    // Use event delegation instead of direct binding
    document.addEventListener("click", (e) => {
      // Find if a share button was clicked
      const shareBtn = e.target.closest(".share-btn");
      if (!shareBtn) return;

      e.preventDefault();
      e.stopPropagation();

      // Get the schedule ID from the closest row or card
      const row = shareBtn.closest("tr");
      const card = shareBtn.closest(".schedule-card");
      const scheduleId = row
        ? row.getAttribute("data-schedule-id")
        : card
        ? card.getAttribute("data-schedule-id")
        : null;

      if (!scheduleId) {
        console.error("Could not find schedule ID for share button");
        return;
      }

      // Generate shareable URL
      const shareUrl = `${window.location.origin}${window.location.pathname}?schedule=${scheduleId}`;
      console.log(`Sharing URL: ${shareUrl}`);

      // Try to use Web Share API if available (primarily for mobile)
      if (navigator.share) {
        navigator
          .share({
            title: "Choir Schedule",
            text: "Check out this choir schedule!",
            url: shareUrl,
          })
          .then(() => {
            console.log("Successfully shared");
            this.showShareSuccess(shareBtn);
          })
          .catch((error) => {
            console.log("Error sharing:", error);
            this.fallbackCopyToClipboard(shareUrl, shareBtn);
          });
      } else {
        // Fallback to clipboard for desktop
        this.fallbackCopyToClipboard(shareUrl, shareBtn);
      }
    });

    console.log("Share buttons setup complete");
  }

  // Update your mobile share button handler to use a more reliable clipboard method
  fallbackCopyToClipboard(text, button) {
    console.log("Using fallback clipboard method for:", text);

    // Try navigator.clipboard API first (works better on mobile)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("Text copied with Clipboard API");
          this.showShareSuccess(button);
        })
        .catch((err) => {
          console.error("Clipboard API failed:", err);
          // Fall back to textarea method
          this.legacyCopyToClipboard(text, button);
        });
    } else {
      // Use legacy method
      this.legacyCopyToClipboard(text, button);
    }
  }

  // Add a dedicated legacy method
  legacyCopyToClipboard(text, button) {
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Special handling for iOS
    textArea.contentEditable = true;
    textArea.readOnly = false;

    // Make it invisible but still on the page
    textArea.style.position = "fixed";
    textArea.style.left = "0";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);

    // Special handling for iOS
    const range = document.createRange();
    range.selectNodeContents(textArea);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    textArea.setSelectionRange(0, 999999);

    // Try to copy
    let successful = false;
    try {
      successful = document.execCommand("copy");
      console.log(successful ? "Legacy copy successful" : "Legacy copy failed");
    } catch (err) {
      console.error("Legacy copy error:", err);
    }

    // Clean up
    document.body.removeChild(textArea);

    // Show feedback
    if (successful && button) {
      this.showShareSuccess(button);
    } else {
      // If all methods fail, show alert with the URL
      alert("Copy this link: " + text);
    }
  }

  // Helper to setup the song links after schedule is rendered
  updateSectionContent(container) {
    // First update the section container
    const section = document.getElementById(this.sectionId);
    if (section) {
      section.innerHTML = "";
      section.appendChild(container);

      // Initialize song links after content is in the DOM
      console.log("Section content updated, initializing interactive elements");
      this.initSongLinks();

      // Add this line to specifically initialize share buttons
      setTimeout(() => {
        this.initShareButtons();
      }, 100);
    }
  }

  // Update your initShareButtons method with better error handling and cleanup
  initShareButtons() {
    console.log("Initializing share buttons specifically...");

    // Get all share buttons that are currently in the DOM
    const shareButtons = document.querySelectorAll(".share-btn");
    console.log(`Found ${shareButtons.length} share buttons to initialize`);

    // Store references to the bound event handlers for later cleanup
    if (!this.buttonHandlers) {
      this.buttonHandlers = new WeakMap();
    }

    // Add direct click listeners to each button (more reliable on mobile)
    shareButtons.forEach((btn) => {
      // Create bound handler function
      const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Safety check - if button is no longer in DOM, exit
        if (!document.body.contains(btn)) {
          console.warn("Button no longer in DOM, aborting share action");
          return;
        }

        console.log("Share button clicked directly");

        // Get the schedule ID from the closest row or card
        const row = btn.closest("tr");
        const card = btn.closest(".schedule-card");
        const scheduleId = row
          ? row.getAttribute("data-schedule-id")
          : card
          ? card.getAttribute("data-schedule-id")
          : null;

        if (!scheduleId) {
          console.error("Could not find schedule ID for share button");
          return;
        }

        // Generate shareable URL
        const shareUrl = `${window.location.origin}${window.location.pathname}?schedule=${scheduleId}`;
        console.log(`Sharing URL: ${shareUrl}`);

        // For mobile, try direct clipboard API first (most reliable)
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(shareUrl)
            .then(() => {
              // Another safety check before updating UI
              if (document.body.contains(btn)) {
                this.showShareSuccess(btn);
              }
            })
            .catch((err) => {
              console.error("Clipboard API failed:", err);
              // Try Web Share API next
              this.tryWebShare(shareUrl, btn);
            });
        } else {
          // Try Web Share API or fallback
          this.tryWebShare(shareUrl, btn);
        }
      };

      // Remove any existing listeners to prevent duplicates
      const oldHandler = this.buttonHandlers.get(btn);
      if (oldHandler) {
        btn.removeEventListener("click", oldHandler);
      }

      // Add new listener and store reference
      btn.addEventListener("click", handler);
      this.buttonHandlers.set(btn, handler);
    });

    console.log("Share buttons initialized with direct listeners");
  }

  // Helper method to try the Web Share API
  tryWebShare(url, button) {
    if (navigator.share) {
      navigator
        .share({
          title: "Choir Schedule",
          text: "Check out this choir schedule!",
          url: url,
        })
        .then(() => {
          console.log("Successfully shared");
          this.showShareSuccess(button);
        })
        .catch((error) => {
          console.log("Web Share API error:", error);
          this.legacyCopyToClipboard(url, button);
        });
    } else {
      // Use legacy method as last resort
      this.legacyCopyToClipboard(url, button);
    }
  }

  // Add this method to your ScheduleSection class
  showSongDetailsModal(songId, songTitle) {
    console.log(`Showing song details modal for: ${songTitle} (ID: ${songId})`);

    // Find the song in songData
    const song = window.songData?.songs?.find((s) => s.id === songId) || {
      title: songTitle,
      lyrics: "",
      url: "",
      author: [],
      category: [],
    };

    // Create the modal HTML
    const modalHtml = `
      <div class="song-modal-content">
        <div class="song-modal-header">
          <h3 class="song-modal-title">${song.title}</h3>
          <button class="song-modal-close" aria-label="Close">
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
        <div class="song-modal_columns">
          ${
            song.url
              ? `
            <div class="song-video-column">
              <div class="song-video-embed">
                <iframe width="100%" height="100%" 
                  src="https://www.youtube.com/embed/${this.getYouTubeId(
                    song.url
                  )}" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen>
                </iframe>
              </div>
            </div>
          `
              : ""
          }
          <div class="song-lyrics-column">
            <div class="song-details-meta">
              ${
                song.author && song.author.length > 0
                  ? `
                <p><strong>Author:</strong> ${song.author.join(", ")}</p>
              `
                  : ""
              }
              ${song.key ? `<p><strong>Key:</strong> ${song.key}</p>` : ""}
              ${
                song.category && song.category.length > 0
                  ? `
                <p><strong>Category:</strong> ${song.category.join(", ")}</p>
              `
                  : ""
              }
            </div>
            <div class="song-lyrics">
              ${
                song.lyrics
                  ? `<pre>${song.lyrics}</pre>`
                  : '<p class="no-lyrics">No lyrics available.</p>'
              }
            </div>
          </div>
        </div>
        <div class="song-actions">

          ${
            song.lyrics
              ? `
            <a href="#" class="song-action-btn song-copy-btn">
              <ion-icon name="copy-outline"></ion-icon>
              Copy Lyrics
            </a>
          `
              : ""
          }
        </div>
      </div>
    `;

    // Create or get the modal container
    let modal = document.querySelector(".song-modal");

    if (!modal) {
      modal = document.createElement("div");
      modal.className = "song-modal";
      document.body.appendChild(modal);
    }

    // Set the content and show the modal
    modal.innerHTML = modalHtml;
    modal.classList.add("visible");

    // Add event listeners for close button and background click
    const closeButton = modal.querySelector(".song-modal-close");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        this.closeSongModal();
      });
    }

    // Close on background click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeSongModal();
      }
    });

    // Set up copy lyrics button
    const copyButton = modal.querySelector(".song-copy-btn");
    if (copyButton) {
      copyButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.copySongLyrics(song.lyrics);
      });
    }

    // Prevent scrolling of the background
    document.body.classList.add("modal-open");

    // Add keyboard support for escape key
    document.addEventListener("keydown", this.handleModalKeyDown);
  }

  // Add these helper methods as well
  closeSongModal() {
    const modal = document.querySelector(".song-modal");
    if (modal) {
      modal.classList.remove("visible");

      // Wait for animation to complete
      setTimeout(() => {
        document.body.classList.remove("modal-open");
      }, 300);
    }

    // Remove keyboard event listener
    document.removeEventListener("keydown", this.handleModalKeyDown);
  }

  handleModalKeyDown = (e) => {
    // Close modal on Escape key
    if (e.key === "Escape") {
      this.closeSongModal();
    }
  };

  getYouTubeId(url) {
    if (!url) return "";

    // Extract YouTube video ID from various URL formats
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : "";
  }

  copySongLyrics(lyrics) {
    if (!lyrics) {
      alert("No lyrics available to copy.");
      return;
    }

    // Try to use the navigator.clipboard API first (modern browsers)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(lyrics)
        .then(() => {
          alert("Lyrics copied to clipboard!");
        })
        .catch((err) => {
          console.error("Clipboard API failed:", err);
          this.fallbackCopyToClipboard(lyrics);
        });
    } else {
      // Fallback for older browsers
      this.fallbackCopyToClipboard(lyrics);
    }
  }

  fallbackCopyToClipboard(text) {
    // Create a temporary textarea to copy from
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);

    // Select the text
    textarea.select();

    try {
      // Execute copy command
      const successful = document.execCommand("copy");
      console.log(successful ? "Lyrics copied to clipboard!" : "Copy failed");
      alert(
        successful
          ? "Lyrics copied to clipboard!"
          : "Could not copy lyrics. Please try again."
      );
    } catch (err) {
      console.error("Failed to copy lyrics:", err);
      alert("Could not copy lyrics. Please try again.");
    }

    // Clean up
    document.body.removeChild(textarea);
  }
}
