# Travel Photo Gallery - Implementation Strategy

## Overview
This document outlines the implementation strategy for building a travel photo gallery site with 6 core features: image display, search, copy functionality, comments, likes, and lazy loading.

## Data Structure
- **Source**: `./data/image.json` contains 13 image objects
- **Image Object**: `{ id, title, description, url, likes, comments }`
- **State Management**: Track likes and comments in memory during session

## Implementation Steps

### 1. Image Card Display
**Objective**: Render 13 image cards from JSON data

**Strategy**:
- Load `image.json` using `fetch()` API
- Create HTML structure for each image using template literals
- Insert cards into `#imageContainer`
- Each card structure:
  ```html
  <div class="image-card" data-id="{id}">
    <img data-src="{url}" src="{url}" alt="{title}" class="lazy" />
    <h3>{title}</h3>
    <p>{description}</p>
    <button class="like-btn">Likes: {likes}</button>
    <div class="comments">{existing comments}</div>
    <form class="comment-form">
      <input type="text" placeholder="Add a comment" />
      <button type="submit">Submit</button>
    </form>
  </div>
  ```

**Key Functions**:
- `loadImageData()` - Fetch and parse JSON
- `createImageCard(imageData)` - Generate HTML for single card
- `renderImageCards(images)` - Render all cards

### 2. Image Search
**Objective**: Filter images by title/description matching search terms

**Strategy**:
- Listen for search form submission
- Split search input by spaces for multi-term search
- Filter images where title OR description contains ALL search terms
- Re-render filtered results or show empty state

**Key Functions**:
- `handleSearch(event)` - Process search form submission
- `filterImages(images, searchTerms)` - Apply search logic
- `renderFilteredImages(filteredImages)` - Update display

**Search Logic**:
```javascript
searchTerms.every(term => 
  image.title.toLowerCase().includes(term.toLowerCase()) ||
  image.description.toLowerCase().includes(term.toLowerCase())
)
```

### 3. Image Copy Functionality
**Objective**: Copy image title to clipboard on image click

**Strategy**:
- Add click event listener to all images using event delegation
- Use `navigator.clipboard.writeText()` for modern browsers
- Show success alert with format: `'${title}'가 클립보드에 복사되었습니다.`

**Key Functions**:
- `handleImageClick(event)` - Handle image click events
- `copyToClipboard(text)` - Copy text to clipboard
- Event delegation on `#imageContainer`

### 4. Comment System
**Objective**: Allow users to add comments with timestamp, max 5 per image

**Strategy**:
- Listen for comment form submissions using event delegation
- Validate input (show alert if empty)
- Generate Korean timestamp format: `(O월 O일 HH:MM)`
- Limit to 5 comments per image
- Store comments in memory state
- Update DOM immediately after successful submission

**Key Functions**:
- `handleCommentSubmit(event)` - Process comment submissions
- `addComment(imageId, commentText)` - Add comment to state
- `generateTimestamp()` - Create Korean format timestamp
- `updateCommentsDisplay(imageId)` - Refresh comments UI

**Timestamp Format**:
```javascript
const now = new Date();
const month = now.getMonth() + 1;
const date = now.getDate();
const hours = now.getHours().toString().padStart(2, '0');
const minutes = now.getMinutes().toString().padStart(2, '0');
return `(${month}월 ${date}일 ${hours}:${minutes})`;
```

### 5. Like System
**Objective**: Allow users to like images, max 5 likes per image

**Strategy**:
- Listen for like button clicks using event delegation
- Increment like count in memory state
- Update button text immediately
- Limit to 5 likes total per image
- Show alert when limit reached

**Key Functions**:
- `handleLikeClick(event)` - Process like button clicks
- `incrementLikes(imageId)` - Update like count in state
- `updateLikeButton(imageId)` - Refresh like button display

### 6. Lazy Loading
**Objective**: Load images only when they enter viewport (1280x720 window)

**Strategy**:
- Initially set all images with `lazy` class and placeholder `data-src`
- Use Intersection Observer API to detect when images enter viewport
- Load actual image when observer triggers
- Remove `lazy` class and set `src` attribute

**Key Functions**:
- `initLazyLoading()` - Set up Intersection Observer
- `loadImage(img)` - Load actual image source
- Observer options for 1280x720 viewport considerations

**Intersection Observer Setup**:
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadImage(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
```

## State Management Strategy

### In-Memory State
```javascript
const appState = {
  originalImages: [], // Loaded from JSON
  currentImages: [], // Filtered for display
  likes: {}, // imageId: likeCount
  comments: {} // imageId: [comment objects]
};
```

### Comment Object Structure
```javascript
{
  text: "Comment text",
  timestamp: "(1월 30일 14:38)"
}
```

## Event Handling Strategy

### Event Delegation
- Use single event listener on `#imageContainer` for all dynamic content
- Handle clicks on images, like buttons, and form submissions
- Use `event.target.closest()` to identify specific elements

### Form Handling
- Prevent default form submission behavior
- Clear form inputs after successful operations
- Validate inputs before processing

## Error Handling

### Validation Messages
- Empty comment: "내용을 입력해주세요."
- Max comments: "하나의 이미지에는 5개의 댓글만 추가할 수 있습니다."
- Max likes: "하나의 이미지에는 5번의 좋아요만 누를 수 있습니다."

### Fallback Strategies
- Clipboard API fallback for older browsers
- Image loading error handling
- JSON loading error handling

## Performance Considerations

### Lazy Loading
- Reduce initial page load time
- Optimize for 1280x720 viewport
- Use placeholder images or loading states

### DOM Manipulation
- Minimize DOM queries by caching elements
- Use document fragments for multiple insertions
- Batch DOM updates where possible

### Memory Management
- Clean up event listeners if needed
- Avoid memory leaks in observer patterns

## Implementation Order
1. Set up basic data loading and card rendering
2. Implement search functionality
3. Add image copy feature
4. Implement comment system
5. Add like functionality
6. Implement lazy loading as final optimization

This strategy ensures a systematic approach to building all required features while maintaining good performance and user experience.