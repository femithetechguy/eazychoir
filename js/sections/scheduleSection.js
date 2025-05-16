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

  render() {
    const section = document.getElementById(this.sectionId);
    if (!section) return;

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

        // Create HTML for color swatches
        const colorSwatchesHTML = this.createColorSwatchesHTML(colors);

        // Get color names as a string
        const colorNamesString = this.getColorNamesString(colors);

        // Populate row with data in the revised order (closing before offering)
        row.innerHTML = `
          <td data-label="Date">
            <div class="date-cell">
              <span class="date-text">${formattedDate}</span>
              <span class="minister-mobile">${schedule.minister}</span>
            </div>
          </td>
          <td data-label="Minister">${schedule.minister}</td>
          <td data-label="Opening">${openingSongs}</td>
          <td data-label="Praise">${praiseSongs}</td>
          <td data-label="Closing">${closingSongs}</td>
          <td data-label="Offering">${offeringSongs}</td>
          <td data-label="Hymn">${hymnSongs}</td>
          <td data-label="Color">
            <div class="color-display">
              <div class="color-swatches-container">
                ${colorSwatchesHTML}
              </div>
              <span>${colorNamesString}</span>
            </div>
          </td>
        `;

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

      section.appendChild(container);
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
}
