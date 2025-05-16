import { scheduleData } from '../data/scheduleData.js';

export default class ScheduleSection {
  constructor() {
    this.sectionId = 'schedule-section';
    this.data = scheduleData;
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
      
      // Add header
      const header = document.createElement('div');
      header.className = 'section-header';
      header.innerHTML = `
        <h1>${data.title}</h1>
        <p class="subtitle">${data.description}</p>
      `;
      container.appendChild(header);
      
      // Add events
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'events-container';
      
      data.events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = `event-card ${event.featured ? 'featured' : ''}`;
        eventCard.innerHTML = `
          <div class="event-date">
            <span class="date">${event.date}</span>
            <span class="time">${event.time}</span>
          </div>
          <div class="event-details">
            <h3>${event.title}</h3>
            <p class="event-location"><ion-icon name="location-outline"></ion-icon> ${event.location}</p>
            <p class="event-description">${event.description}</p>
          </div>
        `;
        eventsContainer.appendChild(eventCard);
      });
      
      container.appendChild(eventsContainer);
      section.appendChild(container);
    });
  }
}