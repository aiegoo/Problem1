# Travel Photo Gallery - Implementation Strategy

## 구현 진행 상황 (Implementation Progress)

### 📋 마일스톤 체크리스트
- [x] **1단계: 이미지 카드 표시** ✅ 완료 (2026.01.30)
  - JSON 데이터 로딩 구현
  - 13개 이미지 카드 렌더링 
  - 레이지 로딩 준비 (placeholder 적용)
  - 상태 관리 시스템 구축

- [x] **2단계: 이미지 검색 기능** ✅ 완료 (2026.01.30) - 3개 요구사항 모두 충족
  - ✅ 제목/설명에서 검색 문자 포함된 이미지 표시
  - ✅ 띄어쓰기 구분 다중 검색어 지원 (예: "image 3" → "Image 3")
  - ✅ 검색 결과 없을 시 빈 화면 표시
  - 고도화: 통합 텍스트 검색 로직 적용

- [x] **3단계: 이미지 복사 기능** ✅ 완료 (2026.01.30) - 모든 요구사항 충족
  - ✅ 임의의 이미지 클릭 시 동작
  - ✅ 이미지 제목을 클립보드에 복사
  - ✅ 한국어 다이얼로그 창 표시: `'(제목)'가 클립보드에 복사되었습니다.`
  - 고도화: 최신 브라우저 API + 구버전 호환성 지원

- [x] **4단계: 댓글 작성 기능** ✅ 완료 (2026.01.30) - 모든 요구사항 충족
  - ✅ 빈 댓글 제출 시 알림: `내용을 입력해주세요.`
  - ✅ 댓글 입력창 초기화 및 댓글 영역 표시
  - ✅ 한국어 타임스탬프 생성: `(O월 O일 00:00)` 형식
  - ✅ 댓글 5개 제한 로직 및 초과 시 알림
  - 고도화: 실시간 댓글 업데이트 및 상태 관리

- [ ] **5단계: 좋아요 기능**
  - 좋아요 버튼 클릭 처리
  - 카운트 증가 및 화면 업데이트
  - 좋아요 5번 제한 로직
  - 상태 관리 연동

- [ ] **6단계: 레이지 로딩 구현**
  - Intersection Observer 설정
  - 뷰포트 진입 감지
  - 고해상도 이미지 로딩 최적화
  - 부드러운 전환 효과

### 🎯 추가 최적화 목표
- [ ] 반응형 디자인 검증
- [ ] 접근성(A11y) 개선
- [ ] 에러 처리 강화
- [ ] 성능 측정 및 최적화

---

## Overview
This document outlines the implementation strategy for building a travel photo gallery site with 6 core features: image display, search, copy functionality, comments, likes, and lazy loading.

## Data Structure
- **Source**: `./data/image.json` contains 13 image objects
- **Image Object**: `{ id, title, description, url, likes, comments }`
- **State Management**: Track likes and comments in memory during session
- **Image Assets**: All images are high-resolution (3000+ pixels), ranging from 3178×2084 to 5304×7952
- **Lazy Placeholder**: `lazy-image.jpg` (4000×6000) available for loading states

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
    <img data-src="{url}" src="./data/images/lazy-image.jpg" alt="{title}" class="lazy" />
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
- Initially set all images with `lazy` class and use `lazy-image.jpg` as placeholder
- Use Intersection Observer API to detect when images enter viewport
- Given image sizes (3178×2084 to 5304×7952), lazy loading is critical for performance
- Load actual high-resolution image when observer triggers
- Remove `lazy` class and set `src` attribute, maintaining aspect ratio

**Key Functions**:
- `initLazyLoading()` - Set up Intersection Observer
- `loadImage(img)` - Load actual image source and handle transitions
- Observer options optimized for large images and 1280x720 viewport

**Intersection Observer Setup**:
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
}, { 
  threshold: 0.1,
  rootMargin: '50px' // Preload slightly before entering viewport
});
```

**Performance Considerations**:
- Use `lazy-image.jpg` as consistent placeholder for all cards
- Implement smooth transitions when images load
- Consider image compression/optimization for web display
- Prioritize above-the-fold images for immediate loading

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
- **Critical for performance**: Images range from 3178×2084 to 5304×7952 pixels
- Use `lazy-image.jpg` as consistent placeholder to reduce initial load
- Optimize for 1280x720 viewport with appropriate preloading margins
- Implement progressive loading with smooth transitions

### DOM Manipulation
- Cache elements to minimize DOM queries
- Use document fragments for multiple insertions
- Batch DOM updates where possible
- Consider CSS transforms for smooth image transitions

### Memory Management
- Clean up event listeners if needed
- Avoid memory leaks in observer patterns
- Dispose of large image objects when appropriate

### Image Optimization
- High-resolution images (3000+ pixels) will be significantly downsized for web display
- Consider implementing responsive image loading based on viewport size
- Use CSS to maintain aspect ratios during loading transitions
- Implement error handling for failed image loads

## Implementation Order
1. Set up basic data loading and card rendering
2. Implement search functionality
3. Add image copy feature
4. Implement comment system
5. Add like functionality
6. Implement lazy loading as final optimization

This strategy ensures a systematic approach to building all required features while maintaining good performance and user experience.