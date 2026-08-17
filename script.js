// ===== TYPING EFFECT =====
const texts = [
  "Software IV&V Engineer",
  "Radar System Validation Specialist",
  "Black Box Testing Expert",
  "Java & Automation Enthusiast"
];

let count = 0;
let index = 0;
let currentText = "";
let letter = "";
let isDeleting = false;

function type() {
  const typingEl = document.getElementById("typing");
  if (!typingEl) return;

  if (count === texts.length) {
    count = 0;
  }

  currentText = texts[count];

  if (isDeleting) {
    letter = currentText.slice(0, --index);
  } else {
    letter = currentText.slice(0, ++index);
  }

  typingEl.textContent = letter;

  let typeSpeed = 80;

  if (isDeleting) {
    typeSpeed /= 2;
  }

  if (!isDeleting && letter.length === currentText.length) {
    typeSpeed = 2000; // Pause at end
    isDeleting = true;
  } else if (isDeleting && letter.length === 0) {
    isDeleting = false;
    count++;
    typeSpeed = 500; // Pause before next string
  }

  setTimeout(type, typeSpeed);
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  type();

  // ===== MOBILE HAMBURGER MENU TOGGLE =====
  const hamburger = document.getElementById("hamburger");
  const navLinksContainer = document.getElementById("navLinks");
  const navItems = document.querySelectorAll(".nav-links a");

  if (hamburger && navLinksContainer) {
    hamburger.addEventListener("click", () => {
      navLinksContainer.classList.toggle("active");
      const icon = hamburger.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
      }
    });

    // Close menu automatically when clicking any link
    navItems.forEach((link) => {
      link.addEventListener("click", () => {
        navLinksContainer.classList.remove("active");
        const icon = hamburger.querySelector("i");
        if (icon) {
          icon.classList.add("fa-bars");
          icon.classList.remove("fa-times");
        }
      });
    });
  }

  // ===== DEVICE ANALYTICS TRACKER =====
  trackAndDisplayDeviceVisits();
});

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
});

// ===== INTERSECTION OBSERVER FOR SCROLL ANIMATIONS =====
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, observerOptions);

const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => observer.observe(el));

// ===== ACTIVE NAVIGATION HIGHLIGHT =====
const sections = document.querySelectorAll(".section, .hero");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (window.scrollY >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// ===== DEVICE DETECTION & COUNTERS =====
function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "Tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return "Mobile";
  }
  return "Desktop";
}

function trackAndDisplayDeviceVisits() {
  const currentDevice = detectDeviceType();
  const currentDeviceEl = document.getElementById("current-device-type");
  if (currentDeviceEl) {
    currentDeviceEl.textContent = currentDevice;
  }

  // Load existing data or set default base counts
  let stats = JSON.parse(localStorage.getItem("portfolio_device_stats")) || {
    Mobile: 42,
    Desktop: 68,
    Tablet: 9
  };

  // Increment visit once per browser session
  const sessionKey = "has_logged_visit_session";
  if (!sessionStorage.getItem(sessionKey)) {
    stats[currentDevice] = (stats[currentDevice] || 0) + 1;
    localStorage.setItem("portfolio_device_stats", JSON.stringify(stats));
    sessionStorage.setItem(sessionKey, "true");
  }

  // Animate count numbers
  animateCounter("mobile-count", stats.Mobile);
  animateCounter("desktop-count", stats.Desktop);
  animateCounter("tablet-count", stats.Tablet);
}

function animateCounter(elementId, targetNumber) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let current = 0;
  const increment = Math.ceil(targetNumber / 30) || 1;
  const timer = setInterval(() => {
    current += increment;
    if (current >= targetNumber) {
      el.textContent = targetNumber;
      clearInterval(timer);
    } else {
      el.textContent = current;
    }
  }, 35);
}