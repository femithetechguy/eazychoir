import { scheduleData } from "../data/scheduleData.js";

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

      // Create schedule table container with horizontal scroll capability for mobile
      const tableContainer = document.createElement("div");
      tableContainer.className = "table-container";

      // Create schedule table
      const table = document.createElement("table");
      table.className = "schedule-table";

      // Create table header with the revised order
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

      // Sort schedules by date
      const sortedSchedules = [...data.schedules].sort(
        (a, b) => a.date - b.date
      );

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

        // Create the row HTML with clickable date cell
        row.innerHTML = `
          <td data-label="Date" class="date-cell">
            <div class="clickable-date">${formattedDate}</div>
            <div class="share-actions">
              <button class="share-btn" title="Share this schedule">
                <ion-icon name="share-social-outline"></ion-icon>
              </button>
              <div class="share-link-container">
                <input type="text" class="share-link" value="${window.location.origin}${window.location.pathname}?schedule=${scheduleId}" readonly />
                <button class="copy-link-btn" title="Copy link">
                  <ion-icon name="copy-outline"></ion-icon>
                </button>
              </div>
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
        const dateCell = row.querySelector(".clickable-date");
        dateCell.addEventListener("click", () => {
          // Remove highlight from all rows
          tbody.querySelectorAll("tr").forEach((r) => {
            r.classList.remove("row-highlighted");
          });

          // Add highlight to this row
          row.classList.add("row-highlighted");

          // Scroll to center if needed
          row.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });

        // Add click event to share button
        const shareBtn = row.querySelector(".share-btn");
        shareBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent row highlight when clicking share

          // Toggle share link container visibility
          const shareLinkContainer = row.querySelector(".share-link-container");
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

        // Add click event to copy button
        const copyBtn = row.querySelector(".copy-link-btn");
        copyBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const shareLink = row.querySelector(".share-link");
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

        // Add the row to the table body
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      tableContainer.appendChild(table);
      container.appendChild(tableContainer);

      // Add mobile view for collapsible cards
      const mobileContainer = document.createElement("div");
      mobileContainer.className = "mobile-schedule-container";

      // Create mobile cards for each schedule
      sortedSchedules.forEach((schedule, index) => {
        const card = document.createElement("div");
        card.className = "schedule-card";

        // Normalize color to array if it's not already
        const colors = Array.isArray(schedule.color)
          ? schedule.color
          : [schedule.color];

        // Apply card color styles
        if (colors.length > 1) {
          card.style.borderLeft = `4px solid`;
          card.style.borderImage = `linear-gradient(to bottom, ${colors.join(
            ", "
          )}) 1`;
        } else {
          card.style.borderLeft = `4px solid ${colors[0]}`;
        }

        // Format date
        const formattedDate = new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(schedule.date);

        // Create color display HTML
        const colorSwatchesHTML = this.createColorSwatchesHTML(colors);
        const colorNamesString = this.getColorNamesString(colors);

        // Create card header (always visible)
        const cardHeader = document.createElement("div");
        cardHeader.className = "card-header";
        cardHeader.innerHTML = `
          <div class="card-title">
            <span class="date-text">${formattedDate}</span>
            <span class="minister-text">${schedule.minister}</span>
          </div>
          <div class="color-display">
            <div class="color-swatches-container">
              ${colorSwatchesHTML}
            </div>
          </div>
          <button class="toggle-button" aria-label="Toggle details">
            <ion-icon name="chevron-down-outline"></ion-icon>
          </button>
        `;

        // Create card content (collapsible)
        const cardContent = document.createElement("div");
        cardContent.className = "card-content collapsed";
        cardContent.innerHTML = `
          <div class="song-section">
            <div class="song-label">Opening:</div>
            <div class="song-content">${this.formatSongList(
              schedule.songList.opening
            )}</div>
          </div>
          <div class="song-section">
            <div class="song-label">Praise:</div>
            <div class="song-content">${this.formatSongList(
              schedule.songList.praise
            )}</div>
          </div>
          <div class="song-section">
            <div class="song-label">Closing:</div>
            <div class="song-content">${this.formatSongList(
              schedule.songList.closing
            )}</div>
          </div>
          <div class="song-section">
            <div class="song-label">Offering:</div>
            <div class="song-content">${this.formatSongList(
              schedule.songList.offering
            )}</div>
          </div>
          <div class="song-section">
            <div class="song-label">Hymn:</div>
            <div class="song-content">${this.formatSongList(
              schedule.songList.hymn
            )}</div>
          </div>
          <div class="song-section">
            <div class="song-label">Color:</div>
            <div class="song-content">${colorNamesString}</div>
          </div>
        `;

        // Assemble card
        card.appendChild(cardHeader);
        card.appendChild(cardContent);
        mobileContainer.appendChild(card);
      });

      // Add mobile container to main container
      container.appendChild(mobileContainer);

      // Add toggle functionality for mobile cards
      setTimeout(() => {
        const toggleButtons = container.querySelectorAll(".toggle-button");
        toggleButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            const card = e.target.closest(".schedule-card");
            const content = card.querySelector(".card-content");
            const icon = card.querySelector(".toggle-button ion-icon");

            content.classList.toggle("collapsed");

            if (content.classList.contains("collapsed")) {
              icon.setAttribute("name", "chevron-down-outline");
            } else {
              icon.setAttribute("name", "chevron-up-outline");
            }
          });
        });
      }, 100);

      // Add download/print button
      const actionButtons = document.createElement("div");
      actionButtons.className = "schedule-actions";
      actionButtons.innerHTML = `
        <button class="action-button print-button">
          <ion-icon name="print-outline"></ion-icon> Print Schedule
        </button>
        <button class="action-button">
          <ion-icon name="calendar-outline"></ion-icon> Add to Calendar
        </button>
      `;
      container.appendChild(actionButtons);

      // Add print functionality
      const printButton = actionButtons.querySelector(".print-button");
      if (printButton) {
        printButton.addEventListener("click", () => {
          window.print();
        });
      }

      // Add highlighting functionality for search results
      if (searchTerm) {
        // Highlight results in the table
        const tableRows = document.querySelectorAll(
          "#schedule-section tbody tr"
        );
        tableRows.forEach((row) => {
          const rowText = row.textContent.toLowerCase();
          const dateCell = row.querySelector('[data-label="Date"]');
          const dateText = dateCell ? dateCell.textContent.toLowerCase() : "";

          // Check if search term is in any part of the row OR if it matches date patterns
          if (
            rowText.includes(searchTerm.toLowerCase()) ||
            this.matchesDateSearch(dateText, searchTerm.toLowerCase())
          ) {
            row.classList.add("search-highlight");

            // Highlight the specific matching text
            this.highlightText(row, searchTerm);

            // If it's a date search, specifically highlight the date cell
            if (this.matchesDateSearch(dateText, searchTerm.toLowerCase())) {
              dateCell.classList.add("date-highlight");
            }

            // Expand mobile card if we're on mobile
            if (window.innerWidth <= 768) {
              const date = dateCell.textContent;
              const mobileCards = document.querySelectorAll(".schedule-card");

              mobileCards.forEach((card) => {
                const cardDate = card.querySelector(".date-text").textContent;
                if (cardDate === date) {
                  const content = card.querySelector(".card-content");
                  const icon = card.querySelector(".toggle-button ion-icon");

                  content.classList.remove("collapsed");
                  icon.setAttribute("name", "chevron-up-outline");

                  // Highlight the specific matching text
                  this.highlightText(content, searchTerm);

                  // Highlight date in card header
                  this.highlightText(
                    card.querySelector(".card-header"),
                    searchTerm
                  );

                  // Scroll to this card
                  card.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              });
            }
          }
        });
      }

      section.appendChild(container);

      // Check for URL parameter to highlight specific schedule or use passed option
      setTimeout(() => {
        // First check if we have a scheduleId in the options (from App.loadSection)
        const scheduleIdFromOptions = options.highlightSchedule;
        
        // Then check URL parameters as fallback
        const urlParams = new URLSearchParams(window.location.search);
        const scheduleIdFromUrl = urlParams.get("schedule");
        
        // Use whichever ID is available
        const scheduleId = scheduleIdFromOptions || scheduleIdFromUrl;

        if (scheduleId) {
          const targetRow = document.getElementById(scheduleId);
          if (targetRow) {
            // Remove highlights from all rows first
            document.querySelectorAll('tr.row-highlighted').forEach(row => {
              row.classList.remove('row-highlighted');
            });
            
            // Highlight the target row
            targetRow.classList.add("row-highlighted");

            // Scroll to it with a slight delay to ensure rendering is complete
            setTimeout(() => {
              targetRow.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              
              // If on mobile, also expand the corresponding card
              if (window.innerWidth <= 768) {
                const dateText = targetRow.querySelector('[data-label="Date"] .clickable-date').textContent;
                const mobileCards = document.querySelectorAll(".schedule-card");
                
                mobileCards.forEach(card => {
                  const cardDateText = card.querySelector('.date-text').textContent;
                  if (cardDateText === dateText) {
                    // Highlight the card
                    card.classList.add('row-highlighted');
                    
                    // Expand the card
                    const content = card.querySelector('.card-content');
                    const icon = card.querySelector('.toggle-button ion-icon');
                    content.classList.remove('collapsed');
                    icon.setAttribute('name', 'chevron-up-outline');
                    
                    // Scroll to the card
                    card.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }
                });
              }
            }, 300);
          }
        }
      }, 500); // Delay to ensure DOM is ready
    });
  }

  // Helper method to format a list of songs
  formatSongList(songs) {
    if (!songs || !Array.isArray(songs) || songs.length === 0) {
      return '<span class="no-song">None</span>';
    }

    return songs.map((song) => `<div class="song-item">${song}</div>`).join("");
  }

  // Helper function to create HTML for color swatches
  createColorSwatchesHTML(colors) {
    if (colors.length === 1) {
      return `<div class="color-swatch" style="background-color: ${colors[0]}"></div>`;
    } else {
      // For multiple colors, create multiple swatches
      return colors
        .map(
          (color) =>
            `<div class="color-swatch" style="background-color: ${color}"></div>`
        )
        .join("");
    }
  }

  // Helper function to get color names as a string
  getColorNamesString(colors) {
    const colorNames = colors.map((color) => this.getColorName(color));

    if (colorNames.length === 1) {
      return colorNames[0];
    } else {
      // Join with ampersand for two colors, commas and ampersand for more
      return colorNames.length === 2
        ? colorNames.join(" & ")
        : colorNames.slice(0, -1).join(", ") +
            " & " +
            colorNames[colorNames.length - 1];
    }
  }

  // Helper function to get color names
  getColorName(hex) {
    const colors = {
      "#4a88f9": "Blue",
      "#32a852": "Green",
      "#e63946": "Red",
      "#ffb703": "Yellow",
      "#8338ec": "Purple",
      "#ffffff": "White",
      "#000000": "Black",
      "#8B4513": "Brown",
      "#FFC0CB": "Pink",
      "#cccccc": "Gray",
    };

    return colors[hex.toLowerCase()] || "Custom";
  }

  // Add this helper method to highlight text
  highlightText(element, term) {
    const nodes = [...element.childNodes];

    nodes.forEach((node) => {
      // If it's a text node
      if (node.nodeType === 3) {
        const text = node.textContent;
        const lowerText = text.toLowerCase();
        const lowerTerm = term.toLowerCase();

        if (lowerText.includes(lowerTerm)) {
          const parts = text.split(new RegExp(`(${term})`, "gi"));
          const fragment = document.createDocumentFragment();

          parts.forEach((part) => {
            if (part.toLowerCase() === lowerTerm) {
              const mark = document.createElement("mark");
              mark.textContent = part;
              fragment.appendChild(mark);
            } else {
              fragment.appendChild(document.createTextNode(part));
            }
          });

          const parent = node.parentNode;
          parent.replaceChild(fragment, node);
        }
      }
      // If it's an element node, recursively process its children
      else if (
        node.nodeType === 1 &&
        node.childNodes &&
        node.childNodes.length > 0
      ) {
        this.highlightText(node, term);
      }
    });
  }

  // Add this helper method to match date searches
  matchesDateSearch(dateText, searchTerm) {
    // Convert both to lowercase for case-insensitive comparison
    dateText = dateText.toLowerCase();
    searchTerm = searchTerm.toLowerCase();

    // Check for direct inclusion first
    if (dateText.includes(searchTerm)) {
      return true;
    }

    // Check for month names, full and abbreviated
    const months = [
      "january",
      "jan",
      "february",
      "feb",
      "march",
      "mar",
      "april",
      "apr",
      "may",
      "june",
      "jun",
      "july",
      "jul",
      "august",
      "aug",
      "september",
      "sep",
      "sept",
      "october",
      "oct",
      "november",
      "nov",
      "december",
      "dec",
    ];

    // Check for day names, full and abbreviated
    const days = [
      "sunday",
      "sun",
      "monday",
      "mon",
      "tuesday",
      "tue",
      "tues",
      "wednesday",
      "wed",
      "thursday",
      "thu",
      "thur",
      "thurs",
      "friday",
      "fri",
      "saturday",
      "sat",
    ];

    // Check for month matches
    for (const month of months) {
      if (searchTerm.includes(month) && dateText.includes(month)) {
        return true;
      }
    }

    // Check for day matches
    for (const day of days) {
      if (searchTerm.includes(day) && dateText.includes(day)) {
        return true;
      }
    }

    // Check for year matches (4-digit number)
    const yearMatch = /\b(20\d{2})\b/.exec(searchTerm);
    if (yearMatch && dateText.includes(yearMatch[1])) {
      return true;
    }

    // Check for day of month (1-31)
    const dayMatch = /\b([1-9]|[12]\d|3[01])\b/.exec(searchTerm);
    if (dayMatch) {
      // Look for the day in the date text, ensuring it's not part of a larger number
      const dayRegex = new RegExp(
        `\\b${dayMatch[1]}\\b|\\b${dayMatch[1]}(st|nd|rd|th)\\b`
      );
      if (dayRegex.test(dateText)) {
        return true;
      }
    }

    return false;
  }

  // Add helper method to create unique ID for schedule
  createScheduleId(schedule) {
    const dateStr = new Date(schedule.date).toISOString().split("T")[0];
    const ministerSlug = schedule.minister
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    return `schedule-${dateStr}-${ministerSlug}`;
  }
}
