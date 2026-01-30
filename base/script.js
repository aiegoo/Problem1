// Travel Photo Gallery Implementation
// Application state management
const appState = {
  originalImages: [],
  currentImages: [],
  likes: {},
  comments: {}
};

// DOM elements
const imageContainer = document.getElementById('imageContainer');

// Load image data from JSON file
async function loadImageData() {
  try {
    const response = await fetch('./data/image.json');
    const images = await response.json();
    return images;
  } catch (error) {
    console.error('Error loading image data:', error);
    return [];
  }
}

// Create HTML for a single image card
function createImageCard(imageData) {
  const existingComments = appState.comments[imageData.id] || [];
  const currentLikes = appState.likes[imageData.id] || imageData.likes;
  
  // Generate comments HTML
  const commentsHTML = existingComments
    .map(comment => `<li>${comment.text} <span class="comment-timestamp">${comment.timestamp}</span></li>`)
    .join('');

  return `
    <div class="image-card" data-id="${imageData.id}">
      <img
        data-src="${imageData.url}"
        src="./data/images/lazy-image.jpg"
        alt="${imageData.title}"
        class="lazy"
      />
      <h3>${imageData.title}</h3>
      <p>${imageData.description}</p>
      <button class="like-btn">Likes: ${currentLikes}</button>
      <div class="comments">
        ${commentsHTML}
      </div>
      <form class="comment-form">
        <input type="text" placeholder="Add a comment" />
        <button type="submit">Submit</button>
      </form>
    </div>
  `;
}

// Render all image cards to the container
function renderImageCards(images) {
  const cardsHTML = images.map(createImageCard).join('');
  imageContainer.innerHTML = cardsHTML;
}

// Initialize the application
async function initializeApp() {
  // Load image data
  appState.originalImages = await loadImageData();
  appState.currentImages = [...appState.originalImages];
  
  // Initialize likes and comments state
  appState.originalImages.forEach(image => {
    if (!appState.likes[image.id]) {
      appState.likes[image.id] = image.likes;
    }
    if (!appState.comments[image.id]) {
      appState.comments[image.id] = [...image.comments];
    }
  });
  
  // Render initial image cards
  renderImageCards(appState.currentImages);
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
