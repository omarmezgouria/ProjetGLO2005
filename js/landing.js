/**
 * ArtiConnect - Landing Page JavaScript
 * Handles specific functionality for the landing page
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize animations for landing page elements
  initLandingAnimations();

  // Set active navigation based on scroll position
  initScrollSpy();

  // Initialize testimonial slider (if needed)
  // initTestimonialSlider();

  // Handle registration type selection
  handleRegistrationType();
});

/**
 * Initialize animations for landing page elements
 */
function initLandingAnimations() {
  // Animate hero section elements when page loads
  const heroContent = document.querySelector(".hero__content");
  const heroImage = document.querySelector(".hero__image");

  if (heroContent) {
    setTimeout(() => {
      heroContent.classList.add("animate-fade-in-right");
    }, 300);
  }

  if (heroImage) {
    setTimeout(() => {
      heroImage.classList.add("animate-fade-in-left");
    }, 500);
  }

  // Animate sections when they come into view
  if (window.articonnect && window.articonnect.animateOnScroll) {
    window.articonnect.animateOnScroll(".step", "animate-fade-in-up");
    window.articonnect.animateOnScroll(
      ".split-content__text",
      "animate-fade-in-right"
    );
    window.articonnect.animateOnScroll(
      ".split-content__image",
      "animate-fade-in-left"
    );
    window.articonnect.animateOnScroll(".testimonial", "animate-fade-in-up");
  }
}

/**
 * Highlight active navigation item based on scroll position
 */
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navItems = document.querySelectorAll(".nav__link");

  if (!sections.length || !navItems.length) return;

  window.addEventListener("scroll", function () {
    let current = "";
    const headerHeight = document.querySelector(".header").offsetHeight;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - headerHeight - 100;
      const sectionHeight = section.offsetHeight;

      if (
        window.pageYOffset >= sectionTop &&
        window.pageYOffset < sectionTop + sectionHeight
      ) {
        current = section.getAttribute("id");
      }
    });

    navItems.forEach((navItem) => {
      navItem.classList.remove("nav__link--active");
      const href = navItem.getAttribute("href");

      if (href && href === `#${current}`) {
        navItem.classList.add("nav__link--active");
      }
    });
  });
}

/**
 * Initialize testimonial slider for mobile view
 */
/*
function initTestimonialSlider() {
    const testimonialContainer = document.querySelector('.testimonials__grid');
    const testimonials = document.querySelectorAll('.testimonial');
    
    // Only initialize slider on mobile
    if (window.innerWidth <= 768 && testimonialContainer && testimonials.length > 1) {
        // Simple slider implementation could go here
        // Or you could integrate a library like Swiper.js
    }
}
*/

/**
 * Handle registration type selection from URL parameters
 */
function handleRegistrationType() {
  if (window.articonnect && window.articonnect.getUrlParameter) {
    const userType = window.articonnect.getUrlParameter("type");

    // Store user type selection in localStorage for use on registration page
    if (userType && (userType === "artisan" || userType === "client")) {
      localStorage.setItem("articonnect_user_type", userType);
    }
  }
}

/**
 * Apply parallax effect to hero image
 */
function initParallaxEffect() {
  const heroSection = document.querySelector(".hero");

  if (!heroSection) return;

  window.addEventListener("scroll", function () {
    const scrollPosition = window.pageYOffset;
    const parallaxElements = document.querySelectorAll(".parallax");

    parallaxElements.forEach((element) => {
      const speed = element.getAttribute("data-speed") || 0.5;
      element.style.transform = `translateY(${scrollPosition * speed}px)`;
    });
  });
}

/**
 * Count up animation for statistics
 * @param {HTMLElement} element - Element containing the number to animate
 * @param {number} target - Target number to count to
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCountUp(element, target, duration = 2000) {
  let start = 0;
  const increment = target > 100 ? 1 : 0.1;
  const stepTime = Math.abs(Math.floor(duration / (target / increment)));

  const timer = setInterval(function () {
    start += increment;
    element.textContent =
      target > 100 ? Math.floor(start).toLocaleString() : start.toFixed(1);

    if (start >= target) {
      element.textContent =
        target > 100 ? target.toLocaleString() : target.toFixed(1);
      clearInterval(timer);
    }
  }, stepTime);
}

// Add CSS for animations
document.addEventListener("DOMContentLoaded", function () {
  const style = document.createElement("style");
  style.textContent = `
        .animate-fade-in-up {
            animation: fadeInUp 0.8s ease forwards;
        }
        
        .animate-fade-in-right {
            animation: fadeInRight 0.8s ease forwards;
        }
        
        .animate-fade-in-left {
            animation: fadeInLeft 0.8s ease forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInRight {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes fadeInLeft {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .hero__content, .hero__image, .step, .split-content__text, .split-content__image, .testimonial {
            opacity: 0;
        }
        
        .nav__link--active {
            color: var(--color-primary) !important;
            font-weight: var(--font-weight-semibold);
        }
    `;
  document.head.appendChild(style);
});
