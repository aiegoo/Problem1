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
  
  // Re-observe lazy images after rendering new content
  setTimeout(() => reObserveLazyImages(), 100);
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

// ============ STEP 6: LAZY LOADING SYSTEM ============

// Intersection Observer for lazy loading
let lazyImageObserver;

// Initialize lazy loading with Intersection Observer
function initializeLazyLoading() {
  // Check if Intersection Observer is supported
  if ('IntersectionObserver' in window) {
    lazyImageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImage(img);
          lazyImageObserver.unobserve(img);
        }
      });
    }, {
      // Optimized for 1280x720 viewport
      threshold: 0.1,
      rootMargin: '100px' // Preload for better UX
    });

    // Initial observation after a short delay
    setTimeout(() => observeLazyImages(), 500);
  } else {
    // Fallback: load all images immediately if Intersection Observer not supported
    loadAllImagesImmediately();
  }
}

// Observe all images with lazy class
function observeLazyImages() {
  const lazyImages = document.querySelectorAll('img.lazy');
  lazyImages.forEach(img => {
    lazyImageObserver.observe(img);
  });
}

// Load actual image and remove lazy class
function loadImage(img) {
  // Set actual src from data-src
  if (img.dataset.src) {
    img.src = img.dataset.src;
    
    // Add loading transition
    img.onload = () => {
      img.classList.remove('lazy');
      img.classList.add('loaded');
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', img.dataset.src);
      img.classList.remove('lazy');
      img.classList.add('error');
    };
  }
}

// Fallback: load all images immediately
function loadAllImagesImmediately() {
  const lazyImages = document.querySelectorAll('img.lazy');
  lazyImages.forEach(loadImage);
}

// Re-observe lazy images after new content is added (for search functionality)
function reObserveLazyImages() {
  if (lazyImageObserver) {
    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => {
      lazyImageObserver.observe(img);
    });
  }
}

// ============ END STEP 6 ============

// ============ ADDITIONAL OPTIMIZATION GOALS ============

// 1. 반응형 디자인 검증
function initializeResponsiveDesign() {
  // Add viewport meta tag if not present
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(viewport);
  }
  
  // Monitor screen size changes and adjust layout
  window.addEventListener('resize', handleScreenResize);
  handleScreenResize(); // Initial check
}

function handleScreenResize() {
  const width = window.innerWidth;
  const container = document.getElementById('imageContainer');
  
  // Adjust grid layout based on screen size
  if (width <= 768) {
    container.style.gridTemplateColumns = '1fr'; // Mobile: 1 column
  } else if (width <= 1024) {
    container.style.gridTemplateColumns = 'repeat(2, 1fr)'; // Tablet: 2 columns
  } else {
    container.style.gridTemplateColumns = 'repeat(3, 1fr)'; // Desktop: 3 columns
  }
}

// 2. 접근성(A11y) 개선
function initializeAccessibility() {
  // Add ARIA labels and roles
  const searchForm = document.getElementById('search-form');
  const searchInput = searchForm.querySelector('input[type="text"]');
  const imageContainer = document.getElementById('imageContainer');
  
  // Enhance search accessibility
  searchInput.setAttribute('aria-label', '이미지 검색');
  searchInput.setAttribute('aria-describedby', 'search-help');
  
  // Add search help text
  const searchHelp = document.createElement('div');
  searchHelp.id = 'search-help';
  searchHelp.className = 'sr-only';
  searchHelp.textContent = '이미지 제목 또는 설명으로 검색할 수 있습니다. 여러 단어는 공백으로 구분하세요.';
  searchForm.appendChild(searchHelp);
  
  // Add main content role
  imageContainer.setAttribute('role', 'main');
  imageContainer.setAttribute('aria-label', '여행 사진 갤러리');
  
  // Add keyboard navigation support
  addKeyboardNavigation();
}

function addKeyboardNavigation() {
  // Enable keyboard navigation for images
  document.addEventListener('keydown', (event) => {
    if (event.target.classList.contains('image-card')) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const img = event.target.querySelector('img');
        if (img) {
          handleImageClick({ target: img });
        }
      }
    }
  });
  
  // Make image cards focusable
  const updateImageCardAccessibility = () => {
    const imageCards = document.querySelectorAll('.image-card');
    imageCards.forEach((card, index) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `이미지 ${index + 1}: ${card.querySelector('h3').textContent} - 클릭하여 제목 복사`);
    });
  };
  
  // Update accessibility after content changes
  const observer = new MutationObserver(updateImageCardAccessibility);
  observer.observe(imageContainer, { childList: true, subtree: true });
  updateImageCardAccessibility();
}

// 3. 에러 처리 강화
function initializeEnhancedErrorHandling() {
  // Global error handler
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  
  // Network status monitoring
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Initial network status check
  if (!navigator.onLine) {
    showNetworkStatus(false);
  }
}

function handleGlobalError(event) {
  console.error('Global error:', event.error);
  showErrorNotification('예상치 못한 오류가 발생했습니다. 페이지를 새로고침해 주세요.');
}

function handleUnhandledRejection(event) {
  console.error('Unhandled promise rejection:', event.reason);
  showErrorNotification('데이터 로딩 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
}

function handleOffline() {
  showNetworkStatus(false);
}

function handleOnline() {
  showNetworkStatus(true);
  // Retry failed operations
  if (appState.originalImages.length === 0) {
    initializeApp();
  }
}

function showNetworkStatus(isOnline) {
  const statusDiv = document.getElementById('network-status') || createNetworkStatusDiv();
  
  if (isOnline) {
    statusDiv.textContent = '인터넷 연결이 복구되었습니다.';
    statusDiv.className = 'network-status online';
    setTimeout(() => statusDiv.remove(), 3000);
  } else {
    statusDiv.textContent = '인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.';
    statusDiv.className = 'network-status offline';
  }
}

function createNetworkStatusDiv() {
  const statusDiv = document.createElement('div');
  statusDiv.id = 'network-status';
  statusDiv.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    padding: 10px; text-align: center; font-weight: bold;
  `;
  document.body.appendChild(statusDiv);
  return statusDiv;
}

function showErrorNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 1001;
    background: #f44336; color: white; padding: 15px; border-radius: 4px;
    max-width: 300px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 5000);
}

// 4. 성능 측정 및 최적화
function initializePerformanceMonitoring() {
  // Performance timing measurement
  if ('performance' in window) {
    measureInitialLoadTime();
    monitorScrollPerformance();
    monitorMemoryUsage();
  }
  
  // Image loading performance
  let imageLoadTimes = [];
  
  const originalLoadImage = loadImage;
  loadImage = function(img) {
    const startTime = performance.now();
    
    // Enhance original function with timing
    const originalOnLoad = img.onload;
    img.onload = function() {
      const loadTime = performance.now() - startTime;
      imageLoadTimes.push(loadTime);
      
      // Log performance metrics periodically
      if (imageLoadTimes.length % 5 === 0) {
        const avgLoadTime = imageLoadTimes.reduce((a, b) => a + b, 0) / imageLoadTimes.length;
        console.log(`Image loading performance - Average: ${avgLoadTime.toFixed(2)}ms`);
      }
      
      if (originalOnLoad) originalOnLoad.call(this);
    };
    
    return originalLoadImage.call(this, img);
  };
}

function measureInitialLoadTime() {
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Initial page load time: ${loadTime.toFixed(2)}ms`);
    
    // Log performance metrics
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        console.log('Performance metrics:', {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 'N/A'
        });
      }
    }
  });
}

function monitorScrollPerformance() {
  let scrollStartTime;
  let frameCount = 0;
  
  const measureFPS = () => {
    frameCount++;
    requestAnimationFrame(measureFPS);
  };
  
  window.addEventListener('scroll', () => {
    if (!scrollStartTime) {
      scrollStartTime = performance.now();
      frameCount = 0;
      measureFPS();
      
      setTimeout(() => {
        const duration = (performance.now() - scrollStartTime) / 1000;
        const fps = frameCount / duration;
        if (fps < 50) {
          console.warn(`Scroll performance warning: ${fps.toFixed(1)} FPS`);
        }
        scrollStartTime = null;
      }, 1000);
    }
  });
}

function monitorMemoryUsage() {
  if (performance.memory) {
    setInterval(() => {
      const memory = performance.memory;
      const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
      const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
      
      console.log(`Memory usage: ${usedMB}MB / ${totalMB}MB`);
      
      // Warning if memory usage is high
      if (memory.usedJSHeapSize / memory.totalJSHeapSize > 0.9) {
        console.warn('High memory usage detected');
      }
    }, 30000); // Check every 30 seconds
  }
}

// Initialize all optimization features
function initializeOptimizations() {
  initializeResponsiveDesign();
  initializeAccessibility();
  initializeEnhancedErrorHandling();
  initializePerformanceMonitoring();
}

// ============ END ADDITIONAL OPTIMIZATIONS ============

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize optimization features first
  initializeOptimizations();
  
  // Initialize main app functionality
  initializeApp();
  initializeSearch();
  initializeImageCopy();
  initializeComments();
  initializeLikes();
  initializeLazyLoading();
});
