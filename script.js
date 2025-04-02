document.addEventListener('DOMContentLoaded', function() {
  // Initialize the sidebar with the table of contents
  generateTableOfContents();
  
  // Add smooth scrolling for all links
  addSmoothScrolling();
  
  // Add active state to the current section in the sidebar
  highlightActiveSection();
  
  // Mobile menu toggle functionality
  setupMobileMenu();
  
  // Add scroll-to-top button
  addScrollToTopButton();
});

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
    const headers = document.querySelectorAll('h1, h2');
    let currentH1Item = null;
    let currentH1List = null;
    
    headers.forEach(header => {
      // Create the list item with a link
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      
      // Generate an ID for the header if it doesn't have one
      if (!header.id) {
        header.id = header.textContent.toLowerCase().replace(/\s+/g, '-');
      }
      
      link.href = `#${header.id}`;
      link.textContent = header.textContent;
      
      // Handle nesting for h2 under h1
      if (header.tagName === 'H1') {
        listItem.appendChild(link);
        toc.appendChild(listItem);
        
        // Create a new sublist for upcoming h2s
        currentH1Item = listItem;
        currentH1List = document.createElement('ul');
        currentH1Item.appendChild(currentH1List);
      } else if (header.tagName === 'H2' && currentH1List) {
        link.classList.add('h2-link');
        listItem.appendChild(link);
        currentH1List.appendChild(listItem);
      }
    });
    
    outline.replaceChild(toc, existingToc);
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
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Calculate header height for offset
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
        
        // Scroll to the element with offset
        window.scrollTo({
          top: targetElement.offsetTop - headerHeight - 20,
          behavior: 'smooth'
        });
        
        // Update the URL
        history.pushState(null, null, `#${targetId}`);
        
        // If on mobile, close the menu
        const outline = document.querySelector('.outline');
        if (window.innerWidth < 768 && outline.classList.contains('show')) {
          outline.classList.remove('show');
        }
      }
    });
  });
}

/**
 * Highlights the currently active section in the table of contents
 */
function highlightActiveSection() {
  const sections = document.querySelectorAll('section[id], div.chart-container[id]');
  const tocLinks = document.querySelectorAll('.outline a');
  
  if (sections.length === 0 || tocLinks.length === 0) return;
  
  // Debounce function to prevent excessive calculations
  let isScrolling = false;
  
  window.addEventListener('scroll', function() {
    if (!isScrolling) {
      isScrolling = true;
      setTimeout(() => {
        // Get the current scroll position plus some offset
        const scrollPosition = window.scrollY + 100;
        
        // Find the current section
        let currentSection = null;
        
        sections.forEach(section => {
          if (section.offsetTop <= scrollPosition) {
            currentSection = section;
          }
        });
        
        // Highlight the corresponding link in the TOC
        if (currentSection) {
          tocLinks.forEach(link => {
            link.classList.remove('active');
            
            if (link.getAttribute('href') === `#${currentSection.id}`) {
              link.classList.add('active');
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
  
  if (menuToggle && outline) {
    menuToggle.addEventListener('click', function() {
      outline.classList.toggle('show');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
      if (window.innerWidth < 768) {
        const isClickInside = outline.contains(event.target) || menuToggle.contains(event.target);
        
        if (!isClickInside && outline.classList.contains('show')) {
          outline.classList.remove('show');
        }
      }
    });
  }
}

/**
 * Adds a scroll-to-top button
 */
function addScrollToTopButton() {
  // Create button element
  const scrollButton = document.createElement('button');
  scrollButton.id = 'scroll-top-button';
  scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
  scrollButton.title = 'Scroll to top';
  
  // Style the button with CSS
  scrollButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    border: none;
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    z-index: 999;
  `;
  
  // Add hover effect
  scrollButton.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-3px)';
    this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  });
  
  scrollButton.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  });
  
  // Add click behavior
  scrollButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Show button only when scrolled down
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      scrollButton.style.display = 'flex';
    } else {
      scrollButton.style.display = 'none';
    }
  });
  
  // Add to the document
  document.body.appendChild(scrollButton);
}