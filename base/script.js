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
  if (images.length === 0) {
    // Show blank screen when no results (requirement 3)
    imageContainer.innerHTML = '';
    return;
  }
  
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

// ============ STEP 2: IMAGE SEARCH FUNCTIONALITY ============

// Get search form elements
const searchForm = document.getElementById('search-form');
const searchInput = searchForm.querySelector('input[type="text"]');

// Handle search form submission
function handleSearch(event) {
  event.preventDefault();
  
  const searchTerm = searchInput.value.trim();
  
  if (searchTerm === '') {
    // Show all images if search is empty
    appState.currentImages = [...appState.originalImages];
  } else {
    // Filter images based on search terms
    const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
    appState.currentImages = filterImages(appState.originalImages, searchTerms);
  }
  
  // Re-render filtered results
  renderImageCards(appState.currentImages);
}

// Filter images based on search terms (ALL terms must be found in title OR description combined)
function filterImages(images, searchTerms) {
  return images.filter(image => {
    const combinedText = `${image.title} ${image.description}`.toLowerCase();
    return searchTerms.every(term => combinedText.includes(term));
  });
}

// Initialize search functionality
function initializeSearch() {
  searchForm.addEventListener('submit', handleSearch);
}

// ============ END STEP 2 ============

// ============ STEP 3: IMAGE COPY FUNCTIONALITY ============

// Handle image click for copying title to clipboard
function handleImageClick(event) {
  const img = event.target;
  if (img.tagName === 'IMG') {
    const imageCard = img.closest('.image-card');
    const imageId = parseInt(imageCard.dataset.id);
    const imageData = appState.originalImages.find(image => image.id === imageId);
    
    if (imageData) {
      copyToClipboard(imageData.title);
    }
  }
}

// Copy text to clipboard using modern API with fallback
async function copyToClipboard(text) {
  try {
    // Modern clipboard API (preferred)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      alert(`'${text}'가 클립보드에 복사되었습니다.`);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        alert(`'${text}'가 클립보드에 복사되었습니다.`);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        alert('클립보드 복사에 실패했습니다.');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    alert('클립보드 복사에 실패했습니다.');
  }
}

// Initialize image copy functionality
function initializeImageCopy() {
  imageContainer.addEventListener('click', handleImageClick);
}

// ============ END STEP 3 ============

// ============ STEP 4: COMMENT SYSTEM ============

// Handle comment form submission
function handleCommentSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  if (form.classList.contains('comment-form')) {
    const input = form.querySelector('input[type="text"]');
    const commentText = input.value.trim();
    
    if (commentText === '') {
      alert('내용을 입력해주세요.');
      return;
    }
    
    const imageCard = form.closest('.image-card');
    const imageId = parseInt(imageCard.dataset.id);
    
    // Check if image already has 5 comments
    const currentComments = appState.comments[imageId] || [];
    if (currentComments.length >= 5) {
      alert('하나의 이미지에는 5개의 댓글만 추가할 수 있습니다.');
      return;
    }
    
    // Add comment to state
    addComment(imageId, commentText);
    
    // Clear input
    input.value = '';
    
    // Update comments display
    updateCommentsDisplay(imageId);
  }
}

// Add comment to state with Korean timestamp
function addComment(imageId, commentText) {
  if (!appState.comments[imageId]) {
    appState.comments[imageId] = [];
  }
  
  const timestamp = generateKoreanTimestamp();
  const comment = {
    text: commentText,
    timestamp: timestamp
  };
  
  appState.comments[imageId].push(comment);
}

// Generate Korean timestamp format: (O월 O일 00:00)
function generateKoreanTimestamp() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return `(${month}월 ${date}일 ${hours}:${minutes})`;
}

// Update comments display for a specific image
function updateCommentsDisplay(imageId) {
  const imageCard = document.querySelector(`.image-card[data-id="${imageId}"]`);
  if (!imageCard) return;
  
  const commentsContainer = imageCard.querySelector('.comments');
  const comments = appState.comments[imageId] || [];
  
  const commentsHTML = comments
    .map(comment => `<li>${comment.text} <span class="comment-timestamp">${comment.timestamp}</span></li>`)
    .join('');
  
  commentsContainer.innerHTML = commentsHTML;
}

// Initialize comment system
function initializeComments() {
  imageContainer.addEventListener('submit', handleCommentSubmit);
}

// ============ END STEP 4 ============

// ============ STEP 5: LIKE SYSTEM ============

// Handle like button clicks
function handleLikeClick(event) {
  const button = event.target;
  if (button.classList.contains('like-btn')) {
    const imageCard = button.closest('.image-card');
    const imageId = parseInt(imageCard.dataset.id);
    
    const currentLikes = appState.likes[imageId] || 0;
    
    if (currentLikes >= 5) {
      alert('하나의 이미지에는 5번의 좋아요만 누를 수 있습니다.');
      return;
    }
    
    // Increment likes count
    appState.likes[imageId] = currentLikes + 1;
    
    // Update button display
    updateLikeButton(imageId);
  }
}

// Update like button display for specific image
function updateLikeButton(imageId) {
  const imageCard = document.querySelector(`.image-card[data-id="${imageId}"]`);
  if (!imageCard) return;
  
  const likeButton = imageCard.querySelector('.like-btn');
  const currentLikes = appState.likes[imageId] || 0;
  
  likeButton.textContent = `Likes: ${currentLikes}`;
}

// Initialize like system
function initializeLikes() {
  imageContainer.addEventListener('click', handleLikeClick);
}

// ============ END STEP 5 ============

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  initializeSearch();
  initializeImageCopy();
  initializeComments();
  initializeLikes();
});
