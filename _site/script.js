document.addEventListener('DOMContentLoaded', function() {
  // Initialize the sidebar with the table of contents
  generateTableOfContents();
  
  // Add smooth scrolling for all links
  addSmoothScrolling();
  
  // Add active state to the current section in the sidebar
  highlightActiveSection();
  
  // Setup TOC toggle functionality
  setupTocToggle();
  
  // Mobile menu toggle functionality
  setupMobileMenu();
  
  // Add scroll-to-top button
  addScrollToTopButton();

  // Initialize image zoom functionality
  setupImageZoom();

  // Setup header mobile menu
  setupHeaderMobileMenu();

  // Setup header dropdown toggle (Previous Epochs)
  setupHeaderDropdownToggle();

  // Setup footer visibility
  setupFooterVisibility();
  
  // Setup header scroll effects
  setupHeaderScrollEffects();
  
  // Ensure mobile menu is properly initialized on page load
  initializeMobileMenu();
  
  // Special handler for TOC h2 links
  setupTocH2ClickHandler();
});

/**
 * Initialize the mobile menu state based on screen size
 */
function initializeMobileMenu() {
  // Function no longer needed with new implementation
}

/**
 * Generates a table of contents based on all h1 and h2 elements
 * Note: If already manually created, this function won't overwrite it
 */
function generateTableOfContents() {
  // Only run if the outline exists but doesn't have existing content
  const outline = document.querySelector('.outline');
  const existingToc = document.querySelector('.outline ul');
  
  if (outline && existingToc && existingToc.children.length === 0) {
    const toc = document.createElement('ul');
    const headers = document.querySelectorAll('.main-content h1, .main-content h2');
    let currentH1Item = null;
    let currentH1List = null;
    
    headers.forEach(header => {
      // Create the list item with a link
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      
      // Generate an ID for the header if it doesn't have one
      if (!header.id) {
        // Create a more reliable ID by removing all special characters and spaces
        header.id = header.textContent.trim().toLowerCase()
          .replace(/[^\w\s-]/g, '')  // Remove special characters
          .replace(/\s+/g, '-')      // Replace spaces with hyphens
          .replace(/-+/g, '-');      // Replace multiple hyphens with single hyphen
      }
      
      // Ensure we have a valid ID (avoid empty IDs)
      if (!header.id || header.id === '') {
        header.id = 'heading-' + Math.random().toString(36).substring(2, 9);
      }
      
      link.href = `#${header.id}`;
      // Preserve the exact original heading text including any numbers and special characters
      link.textContent = header.textContent;
      
      // Handle nesting for h2 under h1
      if (header.tagName === 'H1') {
        listItem.appendChild(link);
        toc.appendChild(listItem);
        
        // Create a new sublist for upcoming h2s
        currentH1Item = listItem;
        currentH1List = document.createElement('ul');
        currentH1List.className = 'toc-submenu';
        currentH1Item.appendChild(currentH1List);
      } else if (header.tagName === 'H2' && currentH1List) {
        link.classList.add('h2-link');
        listItem.appendChild(link);
        currentH1List.appendChild(listItem);
      }
    });
    
    outline.replaceChild(toc, existingToc);
    
    // Debug: Log all header IDs to console for troubleshooting
    console.log('Generated TOC with the following header IDs:');
    headers.forEach(header => {
      console.log(`${header.tagName}: ${header.textContent} -> ID: ${header.id}`);
    });
  }
}

/**
 * Adds smooth scrolling behavior to all anchor links
 */
function addSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the target element
      const targetId = this.getAttribute('href').substring(1);
      let targetElement = document.getElementById(targetId);
      
      // If we can't find the element, try different approaches
      if (!targetElement) {
        console.error(`Target element with ID "${targetId}" not found, trying alternate approaches...`);
        
        // Try finding by selector
        const potentialTargets = document.querySelectorAll(`[id="${targetId}"]`);
        if (potentialTargets.length > 0) {
          targetElement = potentialTargets[0];
          console.log(`Found element with ID "${targetId}" using querySelectorAll`);
        }
      }
      
      if (targetElement) {
        // Calculate header height for offset
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
        
        // Get the position with a slight delay to ensure correct calculations
        setTimeout(() => {
          // Get the element's position relative to the viewport
          const elementPosition = targetElement.getBoundingClientRect().top;
          
          // Calculate the scroll position
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 30;
          
          // Scroll to the element
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Update the URL
          history.pushState(null, null, `#${targetId}`);
          
          // Debug info
          console.log(`Scrolling to element with ID: ${targetId}, position: ${offsetPosition}`);
        }, 10);
        
        // If on mobile, close the menu
        const outline = document.querySelector('.outline');
        if (window.innerWidth < 768 && outline.classList.contains('show')) {
          outline.classList.remove('show');
        }
      } else {
        console.error(`Could not find element with ID "${targetId}" using any method`);
      }
    });
  });
}

/**
 * Highlights the currently active section in the table of contents
 */
function highlightActiveSection() {
  // Select all section elements with IDs and all headings with IDs
  const sections = document.querySelectorAll('section[id], div.chart-container[id], h1[id], h2[id]');
  const tocLinks = document.querySelectorAll('.outline a');
  
  if (sections.length === 0 || tocLinks.length === 0) return;
  
  // Map to store IDs and their corresponding elements
  const idMap = new Map();
  sections.forEach(section => {
    idMap.set(section.id, section);
  });
  
  console.log("Trackable sections/headings:", Array.from(idMap.keys()));
  
  // Debounce function to prevent excessive calculations
  let isScrolling = false;
  
  window.addEventListener('scroll', function() {
    if (!isScrolling) {
      isScrolling = true;
      setTimeout(() => {
        // Get the current scroll position plus some offset for header
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
        const scrollPosition = window.scrollY + headerHeight + 50;
        
        // Find the current section
        let currentSection = null;
        let minDistance = Infinity;
        
        sections.forEach(section => {
          const distance = Math.abs(section.getBoundingClientRect().top - headerHeight);
          if (section.offsetTop <= scrollPosition && distance < minDistance) {
            currentSection = section;
            minDistance = distance;
          }
        });
        
        // Highlight the corresponding link in the TOC
        if (currentSection) {
          tocLinks.forEach(link => {
            link.classList.remove('active');
            
            if (link.getAttribute('href') === `#${currentSection.id}`) {
              link.classList.add('active');
              // Optionally scroll the TOC to show the active link
              link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
          });
        }
        
        isScrolling = false;
      }, 100);
    }
  });
}

/**
 * Sets up the mobile menu toggle behavior
 */
function setupMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const outline = document.querySelector('.outline');
  
  // Create overlay element if it doesn't exist
  let overlay = document.querySelector('.toc-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'toc-overlay';
    document.body.appendChild(overlay);
  }
  
  if (menuToggle && outline) {
    menuToggle.addEventListener('click', function() {
      outline.classList.toggle('show');
      overlay.classList.toggle('show');
      
      // Toggle body scroll
      if (outline.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Close sidebar when clicking on overlay
    overlay.addEventListener('click', function() {
      outline.classList.remove('show');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
      if (window.innerWidth < 768) {
        const isClickInside = outline.contains(event.target) || menuToggle.contains(event.target) || event.target === overlay;
        
        if (!isClickInside && outline.classList.contains('show')) {
          outline.classList.remove('show');
          overlay.classList.remove('show');
          document.body.style.overflow = '';
        }
      }
    });
  }
}

/**
 * Adds a scroll-to-top button
 */
function addScrollToTopButton() {
  // Remove any existing scroll button
  const existingButton = document.getElementById('scroll-top-button');
  if (existingButton) {
    existingButton.remove();
  }
  
  // Create the button element
  const scrollButton = document.createElement('button');
  scrollButton.id = 'scroll-top-button';
  scrollButton.title = 'Scroll to top';
  scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
  
  // Append to body - this ensures it's not affected by other containers
  document.body.appendChild(scrollButton);
  
  // Show the button when scrolling down
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      scrollButton.classList.add('visible');
    } else {
      scrollButton.classList.remove('visible');
    }
  });
  
  // Scroll to top when clicked - with aggressive handling
  scrollButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Force scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    return false;
  }, true);
  
  // Force the button to have a high z-index
  scrollButton.style.zIndex = '9999999';
}

/**
 * Sets up image zoom functionality for chart images
 */
function setupImageZoom() {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <img class="modal-image" src="" alt="Zoomed chart">
    </div>
  `;
  document.body.appendChild(modal);

  // Add click event listeners to all chart images
  // Handle both direct img elements with chart-image class and nested img elements within chart-image containers
  document.querySelectorAll('img.chart-image, .chart-image img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function() {
      const modalImg = modal.querySelector('.modal-image');
      modalImg.src = this.src;
      modalImg.alt = this.alt;
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal when clicking the close button
  modal.querySelector('.close-modal').addEventListener('click', function() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  });

  // Close modal when clicking outside the image
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
}

/**
 * Sets up the header mobile menu toggle behavior
 */
function setupHeaderMobileMenu() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  
  if (!mobileMenuToggle || !siteNav) {
    console.log('Mobile menu elements not found');
    return;
  }

  // Toggle menu on hamburger click
  mobileMenuToggle.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent click from propagating to document
    mobileMenuToggle.classList.toggle('active');
    siteNav.classList.toggle('is-active');
    
    // Toggle body scroll when menu is open
    if (siteNav.classList.contains('is-active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Close menu when clicking a link
  siteNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('active');
      siteNav.classList.remove('is-active');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (siteNav.classList.contains('is-active') && !siteNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      mobileMenuToggle.classList.remove('active');
      siteNav.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  });

  // Update menu visibility on resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 850) {
      mobileMenuToggle.classList.remove('active');
      siteNav.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  });
}

/**
 * Sets up click-to-toggle behavior for header dropdowns (e.g., Previous Epochs)
 */
function setupHeaderDropdownToggle() {
  const dropdowns = document.querySelectorAll('.site-nav .dropdown');
  if (!dropdowns || dropdowns.length === 0) return;

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    if (!toggle || !menu) return;

    // Toggle open/closed on click
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Close any other open dropdowns first
      document.querySelectorAll('.site-nav .dropdown.open').forEach(openDd => {
        if (openDd !== dropdown) openDd.classList.remove('open');
      });

      dropdown.classList.toggle('open');
    });

    // Close when clicking a menu link
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        dropdown.classList.remove('open');
      });
    });
  });

  // Close when clicking outside
  document.addEventListener('click', function(e) {
    document.querySelectorAll('.site-nav .dropdown.open').forEach(openDd => {
      if (!openDd.contains(e.target)) openDd.classList.remove('open');
    });
  });
}

/**
 * Sets up the TOC toggle functionality for all screen sizes
 */
function setupTocToggle() {
  const tocToggle = document.getElementById('toc-toggle');
  const outline = document.querySelector('.outline');
  
  if (tocToggle && outline) {
    // Check if there's a saved state in localStorage
    const isCollapsed = localStorage.getItem('tocCollapsed') === 'true';
    if (isCollapsed) {
      outline.classList.add('collapsed');
    }
    
    tocToggle.addEventListener('click', function() {
      outline.classList.toggle('collapsed');
      // Save the state to localStorage
      localStorage.setItem('tocCollapsed', outline.classList.contains('collapsed'));
    });
  }
}

/**
 * Sets up footer visibility based on scroll position
 */
function setupFooterVisibility() {
  const footer = document.querySelector('.site-footer');
  const body = document.querySelector('body');
  if (!footer || !body) return;

  let lastScrollTop = 0;
  const threshold = 100; // pixels from bottom to show footer

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

    if (distanceFromBottom <= threshold) {
      footer.classList.add('visible');
      body.classList.add('footer-visible'); // Add class to body when footer is visible
    } else {
      footer.classList.remove('visible');
      body.classList.remove('footer-visible'); // Remove class when footer is not visible
    }

    lastScrollTop = scrollTop;
  });
  
  // Initialize on page load
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
  
  if (distanceFromBottom <= threshold) {
    footer.classList.add('visible');
    body.classList.add('footer-visible');
  } else {
    footer.classList.remove('visible');
    body.classList.remove('footer-visible');
  }
}

/**
 * Adds shrinking header effect on scroll
 */
function setupHeaderScrollEffects() {
  const header = document.querySelector('.site-header');
  const outline = document.querySelector('.outline');
  let lastScrollY = 0;
  
  if (!header) return;
  
  // Add scroll event listener
  window.addEventListener('scroll', function() {
    const currentScrollY = window.scrollY;
    
    // Add scrolled class when scrolling down
    if (currentScrollY > 50) {
      header.classList.add('scrolled');
      // Adjust TOC position to match scrolled header height
      if (outline) {
        outline.style.top = '60px'; // Match scrolled header height
      }
    } else {
      header.classList.remove('scrolled');
      // Reset TOC position to match regular header height
      if (outline) {
        outline.style.top = window.innerWidth <= 768 ? '56px' : '70px';
      }
    }
    
    lastScrollY = currentScrollY;
  });
}

/**
 * Special handler for h2 links in the TOC to ensure they work reliably
 */
function setupTocH2ClickHandler() {
  // Add specific handling for the h2 links
  document.querySelectorAll('.outline a.h2-link').forEach(h2Link => {
    h2Link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        console.log(`Special handling for h2 link: ${targetId}`);
        
        // Calculate header height with extra buffer
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
        const extraBuffer = 60; // Extra space to ensure good positioning
        
        // Use a more reliable scrolling method
        const yOffset = -1 * (headerHeight + extraBuffer);
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
        
        // Highlight the element temporarily for visibility
        targetElement.style.transition = 'background-color 1s';
        const originalColor = targetElement.style.backgroundColor;
        targetElement.style.backgroundColor = 'rgba(92, 158, 255, 0.1)';
        
        // Reset after animation
        setTimeout(() => {
          targetElement.style.backgroundColor = originalColor;
        }, 2000);
        
        // Update the URL
        history.pushState(null, null, `#${targetId}`);
      } else {
        console.error(`Target h2 element "${targetId}" not found`);
      }
    });
  });
}