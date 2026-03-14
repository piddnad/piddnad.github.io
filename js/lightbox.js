document.addEventListener('DOMContentLoaded', function () {
    // Select all images in post content
    var images = Array.from(document.querySelectorAll('.post-content img'));
    if (images.length === 0) return;

    var currentIndex = 0;

    // Create lightbox overlay
    var lightbox = document.createElement('div');
    lightbox.id = 'lightbox-overlay';
    lightbox.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">
        <svg class="lightbox-nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>
      <img id="lightbox-img" src="" alt="">
      <button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">
        <svg class="lightbox-nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9.5 5.5L16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>
    </div>
    <button class="lightbox-close" type="button" aria-label="Close image viewer">&times;</button>
    <div class="lightbox-thumbnails"></div>
  `;
    document.body.appendChild(lightbox);

    var lightboxImg = document.getElementById('lightbox-img');
    var thumbnailsContainer = document.querySelector('.lightbox-thumbnails');
    var closeBtn = document.querySelector('.lightbox-close');
    var prevBtn = document.querySelector('.lightbox-prev');
    var nextBtn = document.querySelector('.lightbox-next');

    // Generate Thumbnails
    images.forEach(function (img, index) {
        var thumb = document.createElement('img');
        thumb.src = img.src;
        thumb.classList.add('lightbox-thumb');
        thumb.dataset.index = index;
        thumb.addEventListener('click', function (e) {
            e.stopPropagation();
            showImage(index);
        });
        thumbnailsContainer.appendChild(thumb);
    });

    var thumbnails = document.querySelectorAll('.lightbox-thumb');

    // Update Image Function
    function showImage(index) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentIndex = index;

        var img = images[currentIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;

        // Update active thumbnail
        thumbnails.forEach(function (t) { t.classList.remove('active'); });
        if (thumbnails[currentIndex]) {
            thumbnails[currentIndex].classList.add('active');
            thumbnails[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    // Open lightbox
    images.forEach(function (img, index) {
        img.style.cursor = 'zoom-in'; // Indicate clickable
        img.addEventListener('click', function () {
            showImage(index);
            lightbox.style.display = 'flex';
            setTimeout(function () { lightbox.classList.add('active'); }, 10); // Fade in
        });
    });

    // Navigation Functions
    function showNext() { showImage(currentIndex + 1); }
    function showPrev() { showImage(currentIndex - 1); }

    // Event Listeners
    nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        showNext();
    });

    prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        showPrev();
    });

    // Close lightbox functions
    function closeLightbox() {
        lightbox.classList.remove('active');
        setTimeout(function () { lightbox.style.display = 'none'; }, 300);
    }

    // Close on click close button
    closeBtn.addEventListener('click', closeLightbox);

    // Close on click outside image
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content') || e.target.classList.contains('lightbox-thumbnails')) {
            closeLightbox();
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', function (e) {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        }
    });
});
