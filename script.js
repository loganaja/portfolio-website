// ========================================================
// 1. ASYNCHRONOUS SLIDE COMPONENT LOADER ENGINE
// ========================================================
const slideFiles = [
  'Slides/0-Home-Slide.html',                  // Index 0: Home Hub
  'Slides/1-TRA-MK1-Slide.html',               // Index 1: Trajan
  'Slides/2-TRA-MK2-Slide.html',               // Index 2: Trajan
  'Slides/3-TRA-MK3-Slide.html',               // Index 3: Trajan
  'Slides/4-TRA-Lapping4-Slide.html',          // Index 4: Trajan
  'Slides/5-TRA-Lapping5-Slide.html',          // Index 5: Trajan
  'Slides/6-TRA-Universal-Frames-Slide.html',   // Index 6: Trajan
  'Slides/7-TRA-Random-Jobs-Slide.html',       // Index 7: Trajan
  'Slides/8-BOE-Boeing-Placement-Slide.html',  // Index 8: Boeing
  'Slides/9-Uni-Payload-Slide.html',           // Index 9: Swinburne University
  'Slides/10-Per-FPV-Waypoint-Slide.html'      // Index 10: Personal Project
];

let activeIndex = 0;

// Centralized background controller to safely manage themes and custom accents
function updateBackgroundTheme(index) {
  const stage = document.getElementById('timeline-stage');
  if (!stage) return;

  if (index === 0) {
    stage.className = 'theme-home';
    document.documentElement.style.setProperty('--accent', '#3b82f6'); // Electric Blue
  } else if (index >= 1 && index <= 7) {
    stage.className = 'theme-trajan';                                 // Trajan Red
    document.documentElement.style.setProperty('--accent', '#D0202E'); 
  } else if (index === 8) {
    stage.className = 'theme-boeing';                                 // Boeing Blue
    document.documentElement.style.setProperty('--accent', '#0039A6'); 
  } else if (index === 9) {
    stage.className = 'theme-uni';                                    // Swinburne Red
    document.documentElement.style.setProperty('--accent', '#E5252A'); 
  } else if (index === 10) {
    stage.className = 'theme-personal';                               // FPV Purple
    document.documentElement.style.setProperty('--accent', '#a855f7'); 
  }
  
  // Dynamically update Navigation Button text for Slide 0
  const backText = document.querySelector('.nav-back-btn .nav-btn-text');
  const nextText = document.querySelector('.nav-next-btn .nav-btn-text');
  if (backText && nextText) {
      if (index === 0) {
          backText.innerText = "LATEST PROJECTS";
          nextText.innerText = "FIRST INTERNSHIP PROJECTS";
      } else {
          backText.innerText = "BACK";
          nextText.innerText = "NEXT";
      }
  }
}

async function loadTimelinePortfolio() {
  const stage = document.getElementById('timeline-stage');
  if (!stage) return; 
  
  stage.innerHTML = "";

  for (const file of slideFiles) {
    try {
      const response = await fetch(file + "?v=" + new Date().getTime());
      if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
      
      let htmlContent = await response.text();
      
      // Safely replace background-image with data-bg using regex to avoid DOMParser relative URL issues
      htmlContent = htmlContent.replace(/style="background-image:\s*(url\(['"]?[^'"]+['"]?\));?"/gi, 'data-bg="$1"');
      
      stage.insertAdjacentHTML('beforeend', htmlContent);
    } catch (err) {
      console.error(`Failed loading asset: ${file}`, err);
    }
  }

  const allSlides = stage.getElementsByTagName("article");
  for (let i = 0; i < allSlides.length; i++) {
    allSlides[i].setAttribute('data-index', i);
    allSlides[i].className = ''; 
    
    if (i === activeIndex) {
      allSlides[i].classList.add('active');
    } else if (i < activeIndex) {
      allSlides[i].classList.add('before');
    } else {
      allSlides[i].classList.add('after');
    }
  }

  updateBackgroundTheme(activeIndex);
  console.log(`Successfully mapped ${allSlides.length} timeline portfolio slides.`);
  
  // Initialize the parallax hover effect for the newly loaded images
  initParallaxHover();
  
  // Start sequential background loading
  loadImagesSequentially();
}

// ========================================================
// 1.5 STRICT SEQUENTIAL IMAGE LOADER (0 to 10)
// ========================================================
async function loadImagesSequentially() {
  const allPhotos = document.querySelectorAll('.photo-item[data-bg]');
  const totalImages = allPhotos.length;
  let imagesLoaded = 0;
  
  function updateProgress() {
    imagesLoaded++;
    const progressPercent = Math.min(100, Math.floor((imagesLoaded / totalImages) * 100));
    
    // Update CSS Variable for liquid height and progress bar width
    document.documentElement.style.setProperty('--progress', `${progressPercent}%`);
    
    // Update Percentage Text
    const percentText = document.getElementById('load-percentage');
    if (percentText) {
      percentText.innerText = `${progressPercent}%`;
    }
    
    if (imagesLoaded >= totalImages) {
      const loader = document.getElementById('global-loader');
      if (loader) {
        // Small delay so user sees 100% before it disappears
        setTimeout(() => {
          loader.classList.add('hidden');
          setTimeout(() => loader.remove(), 600);
        }, 400);
      }
    }
  }

  // If there are no images, just hide loader
  if (totalImages === 0) {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 600);
    }
    return;
  }

  const totalSlides = document.getElementsByTagName("article").length;
  for (let i = 0; i < totalSlides; i++) {
    const slide = document.querySelector(`article[data-index="${i}"]`);
    if (!slide) continue;
    
    const photos = slide.querySelectorAll('.photo-item[data-bg]');
    if (photos.length === 0) continue;
    
    // Load all images for this slide concurrently, but wait before moving to next slide
    await Promise.all(Array.from(photos).map(photo => {
      return new Promise(resolve => {
        const bgStr = photo.getAttribute('data-bg');
        const bgMatch = bgStr.match(/url\(['"]?(.*?)['"]?\)/);
        
        if (bgMatch && bgMatch[1]) {
          const img = new Image();
          img.onload = img.onerror = () => {
            photo.style.backgroundImage = bgStr;
            photo.removeAttribute('data-bg');
            updateProgress();
            resolve();
          };
          img.src = bgMatch[1];
        } else {
          photo.style.backgroundImage = bgStr;
          photo.removeAttribute('data-bg');
          updateProgress();
          resolve();
        }
      });
    }));
  }
}

// Initialize loading sequence
loadTimelinePortfolio();

// ========================================================
// 2. LIVE-EVALUATED CLASS SLIDER CONTROLLERS
// ========================================================
const handleLeftClick = () => {
  const totalSlides = document.getElementsByTagName("article");
  if (totalSlides.length === 0) return; 

  const nextIndex = activeIndex - 1 >= 0 ? activeIndex - 1 : totalSlides.length - 1;
  const currentSlide = document.querySelector(`article[data-index="${activeIndex}"]`),
        nextSlide = document.querySelector(`article[data-index="${nextIndex}"]`);
        
  if (!currentSlide || !nextSlide) return; 
        
  currentSlide.className = 'after';
  nextSlide.className = 'becoming-active-from-before';
  
  setTimeout(() => {
    nextSlide.className = 'active';
    activeIndex = nextIndex;
    updateBackgroundTheme(activeIndex);
  }, 50); 
}

const handleRightClick = () => {
  const totalSlides = document.getElementsByTagName("article");
  if (totalSlides.length === 0) return;

  const nextIndex = activeIndex + 1 <= totalSlides.length - 1 ? activeIndex + 1 : 0;
  const currentSlide = document.querySelector(`article[data-index="${activeIndex}"]`),
        nextSlide = document.querySelector(`article[data-index="${nextIndex}"]`);
  
  if (!currentSlide || !nextSlide) return;
  
  currentSlide.className = 'before';
  nextSlide.className = 'becoming-active-from-after';
  
  setTimeout(() => {
    nextSlide.className = 'active';
    activeIndex = nextIndex;
    updateBackgroundTheme(activeIndex);
  }, 50);
}

// ========================================================
// 3. CONTACT OVERLAY MODAL INTERACTION CONTROLLER
// ========================================================
const toggleContactModal = () => {
    const modal = document.getElementById("contact-modal");
    const body = document.body;
    if (!modal) return;
    
    if (modal.dataset.state === "closed" || !modal.dataset.state) {
        modal.dataset.state = "open";
        body.classList.add("modal-active"); 
    } else {
        modal.dataset.state = "closed";
        body.classList.remove("modal-active");
    }
}

// ========================================================
// 4. SLIDE-OUT METALLIC PROFILE DRAWER SYSTEM ENGINE
// ========================================================
const toggleProfileDrawer = () => {
    const drawer = document.getElementById("profile-drawer");
    const body = document.body;
    if (!drawer) return;
    
    if (drawer.dataset.state === "closed" || !drawer.dataset.state) {
        drawer.dataset.state = "open";
        body.classList.add("modal-active"); 
    } else {
        drawer.dataset.state = "closed";
        body.classList.remove("modal-active");
    }
}

// Global safety key escapes to tear down open modules easily
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById("contact-modal");
        const drawer = document.getElementById("profile-drawer");
        
        if (modal && modal.dataset.state === "open") toggleContactModal();
        if (drawer && drawer.dataset.state === "open") toggleProfileDrawer();
    }
});

// ========================================================
// 5. PORTFOLIO QUICK-JUMP SECTION NAVIGATOR
// ========================================================
const navigateToSection = (targetIndex) => {
  const totalSlides = document.getElementsByTagName("article");
  if (totalSlides.length === 0 || targetIndex === activeIndex) return;

  document.body.classList.add("menu-active");

  const currentSlide = document.querySelector(`article[data-index="${activeIndex}"]`),
        nextSlide = document.querySelector(`article[data-index="${targetIndex}"]`);

  if (!currentSlide || !nextSlide) {
    document.body.classList.remove("menu-active");
    return;
  }

  if (targetIndex > activeIndex) {
    currentSlide.className = 'before';
    nextSlide.className = 'becoming-active-from-after';
  } else {
    currentSlide.className = 'after';
    nextSlide.className = 'becoming-active-from-before';
  }

  setTimeout(() => {
    nextSlide.className = 'active';
    
    for (let i = 0; i < totalSlides.length; i++) {
      if (i !== targetIndex) {
        totalSlides[i].className = i < targetIndex ? 'before' : 'after';
      }
    }
    
    activeIndex = targetIndex;
    updateBackgroundTheme(activeIndex);
    document.body.classList.remove("menu-active");
  }, 50);
}

// ========================================================
// 6. 3D PARALLAX HOVER EFFECT FOR HOME SLIDE IMAGES
// ========================================================
function initParallaxHover() {
    const angle = 20;

    const lerp = (start, end, amount) => {
        return (1 - amount) * start + amount * end;
    };

    const remap = (value, oldMax, newMax) => {
        const newValue = ((value + oldMax) * (newMax * 2)) / (oldMax * 2) - newMax;
        return Math.min(Math.max(newValue, -newMax), newMax);
    };

    const cards = document.querySelectorAll('article .photo-item');
    cards.forEach((e) => {
        e.dataset.targetRotateX = 0;
        e.dataset.targetRotateY = 0;
        
        e.addEventListener("mousemove", (event) => {
            const rect = e.getBoundingClientRect();
            const centerX = (rect.left + rect.right) / 2;
            const centerY = (rect.top + rect.bottom) / 2;
            const posX = event.pageX - centerX;
            const posY = event.pageY - centerY;
            const x = remap(posX, rect.width / 2, angle);
            const y = remap(posY, rect.height / 2, angle);
            e.dataset.targetRotateY = x;
            e.dataset.targetRotateX = -y;
            e.dataset.targetScale = 1.25;
            e.style.zIndex = "50";
        });
        
        e.addEventListener("mouseout", (event) => {
            e.dataset.targetRotateY = 0;
            e.dataset.targetRotateX = 0;
            e.dataset.targetScale = 1;
            e.style.zIndex = "";
        });
    });
    
    const update = () => {
        cards.forEach((e) => {
            let currentY = parseFloat(e.style.getPropertyValue('--rotateY')) || 0;
            let currentX = parseFloat(e.style.getPropertyValue('--rotateX')) || 0;
            const targetY = parseFloat(e.dataset.targetRotateY) || 0;
            const targetX = parseFloat(e.dataset.targetRotateX) || 0;
            
            let currentScale = parseFloat(e.style.getPropertyValue('--scale')) || 1;
            const targetScale = parseFloat(e.dataset.targetScale) || 1;
            
            e.style.setProperty("--rotateY", lerp(currentY, targetY, 0.05) + "deg");
            e.style.setProperty("--rotateX", lerp(currentX, targetX, 0.05) + "deg");
            e.style.setProperty("--scale", lerp(currentScale, targetScale, 0.1));
        })
    }
    setInterval(update, 1000/60);
}