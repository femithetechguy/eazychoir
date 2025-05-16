import { requestData } from '../data/requestData.js';

export default class RequestSection {
  constructor() {
    this.sectionId = 'request-section';
    this.data = requestData;
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
      
      // Create a two-column layout
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'request-content-wrapper';
      
      // Form column
      const formColumn = document.createElement('div');
      formColumn.className = 'request-form-column';
      
      const form = document.createElement('form');
      form.id = 'request-form';
      form.className = 'request-form';
      
      // Create form fields
      data.formFields.forEach(field => {
        const fieldWrapper = document.createElement('div');
        fieldWrapper.className = 'form-field';
        
        const label = document.createElement('label');
        label.setAttribute('for', field.id);
        label.textContent = field.label;
        if (field.required) {
          label.innerHTML += ' <span class="required">*</span>';
        }
        fieldWrapper.appendChild(label);
        
        let input;
        if (field.type === 'textarea') {
          input = document.createElement('textarea');
        } else {
          input = document.createElement('input');
          input.type = field.type;
        }
        
        input.id = field.id;
        input.name = field.id;
        input.placeholder = field.placeholder;
        if (field.required) {
          input.required = true;
        }
        
        fieldWrapper.appendChild(input);
        form.appendChild(fieldWrapper);
      });
      
      // Add submit button
      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.className = 'submit-btn';
      submitBtn.textContent = data.submitText;
      form.appendChild(submitBtn);
      
      // Add form submission handler
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(form);
      });
      
      formColumn.appendChild(form);
      contentWrapper.appendChild(formColumn);
      
      // Recent requests column
      const recentColumn = document.createElement('div');
      recentColumn.className = 'recent-requests-column';
      
      const recentHeader = document.createElement('h2');
      recentHeader.textContent = 'Recent Requests';
      recentColumn.appendChild(recentHeader);
      
      const requestsList = document.createElement('div');
      requestsList.className = 'recent-requests-list';
      
      data.recentRequests.forEach(request => {
        const requestItem = document.createElement('div');
        requestItem.className = 'recent-request-item';
        requestItem.innerHTML = `
          <h3>${request.songTitle}</h3>
          <p>Requested by: ${request.requester}</p>
          <p class="request-date">${request.date}</p>
        `;
        requestsList.appendChild(requestItem);
      });
      
      recentColumn.appendChild(requestsList);
      contentWrapper.appendChild(recentColumn);
      
      container.appendChild(contentWrapper);
      section.appendChild(container);
    });
  }
  
  handleFormSubmit(form) {
    // Get form data
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    // In a real app, you would send this data to a server
    console.log('Form submitted:', data);
    
    // Show success message
    form.innerHTML = `
      <div class="success-message">
        <ion-icon name="checkmark-circle-outline"></ion-icon>
        <h2>Thank You!</h2>
        <p>Your song request for "${data.songTitle}" has been submitted successfully.</p>
        <button id="new-request-btn" class="submit-btn">Submit Another Request</button>
      </div>
    `;
    
    // Add event listener to reset form
    document.getElementById('new-request-btn').addEventListener('click', () => {
      this.render();
    });
  }
}