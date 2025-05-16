import { blogData } from '../data/blogData.js';

export default class BlogSection {
  constructor() {
    this.sectionId = 'blog-section';
    this.data = blogData;
    this.activeArticle = null;
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
      
      // If we have an active article, show it
      if (options.articleId) {
        this.renderSingleArticle(container, options.articleId);
        section.appendChild(container);
        return;
      }
      
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
      allFilter.addEventListener('click', () => this.filterArticles(null));
      filterContainer.appendChild(allFilter);
      
      data.categories.forEach(category => {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-btn';
        filterBtn.textContent = category;
        filterBtn.addEventListener('click', () => this.filterArticles(category));
        filterContainer.appendChild(filterBtn);
      });
      
      container.appendChild(filterContainer);
      
      // Add articles
      const articlesContainer = document.createElement('div');
      articlesContainer.className = 'articles-container';
      
      data.articles.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        articleCard.setAttribute('data-tags', article.tags.join(','));
        articleCard.innerHTML = `
          <div class="article-image">
            <img src="${article.imageUrl}" alt="${article.title}">
          </div>
          <div class="article-info">
            <h2>${article.title}</h2>
            <p class="article-meta">By ${article.author} | ${article.date}</p>
            <p class="article-excerpt">${article.excerpt}</p>
            <div class="article-tags">
              ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <button class="read-more" data-article-id="${article.id}">Read More</button>
          </div>
        `;
        articlesContainer.appendChild(articleCard);
      });
      
      container.appendChild(articlesContainer);
      section.appendChild(container);
      
      // Add event listeners to read more buttons
      section.querySelectorAll('.read-more').forEach(button => {
        button.addEventListener('click', () => {
          const articleId = parseInt(button.getAttribute('data-article-id'));
          this.render({ articleId });
        });
      });
    });
  }
  
  renderSingleArticle(container, articleId) {
    this.loadData().then(data => {
      const article = data.articles.find(a => a.id === articleId);
      if (!article) {
        container.innerHTML = '<div class="error">Article not found</div>';
        return;
      }
      
      const articleView = document.createElement('div');
      articleView.className = 'single-article-view';
      
      // Back button
      const backBtn = document.createElement('button');
      backBtn.className = 'back-btn';
      backBtn.innerHTML = '<ion-icon name="arrow-back-outline"></ion-icon> Back to Articles';
      backBtn.addEventListener('click', () => {
        this.render();
      });
      articleView.appendChild(backBtn);
      
      // Article content
      const articleContent = document.createElement('div');
      articleContent.className = 'article-content';
      articleContent.innerHTML = `
        <div class="article-header">
          <h1>${article.title}</h1>
          <p class="article-meta">By ${article.author} | ${article.date}</p>
          <div class="article-tags">
            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
        <div class="article-image">
          <img src="${article.imageUrl}" alt="${article.title}">
        </div>
        <div class="article-body">
          <p>${article.content}</p>
        </div>
      `;
      articleView.appendChild(articleContent);
      
      container.appendChild(articleView);
    });
  }
  
  filterArticles(category) {
    const articleCards = document.querySelectorAll('.article-card');
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
    
    // Filter articles
    articleCards.forEach(card => {
      const tags = card.getAttribute('data-tags').split(',');
      if (category === null || tags.includes(category)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }
}