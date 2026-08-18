const API_BASE_URL = "https://volunteers-backend-35oe.onrender.com";

// Clear any outdated local mock cache
try {
  localStorage.removeItem("portfolio_device_stats");
} catch (e) {}

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

async function trackAndDisplayDeviceVisits() {
  const currentDevice = detectDeviceType();
  const currentDeviceEl = document.getElementById("current-device-type");
  if (currentDeviceEl) {
    currentDeviceEl.textContent = currentDevice;
  }

  const sessionKey = "has_recorded_device_visit";
  const hasRecordedSession = sessionStorage.getItem(sessionKey);

  try {
    let stats = null;

    if (!hasRecordedSession) {
      // 1. First visit in this browser session -> record increment
      const response = await fetch(`${API_BASE_URL}/api/visits/track?deviceType=${currentDevice}`, {
        method: "POST"
      });
      if (response.ok) {
        stats = await response.json();
        sessionStorage.setItem(sessionKey, "true");
      }
    }

    // 2. If already logged in this session or POST returned null, fetch live stats
    if (!stats) {
      const statsRes = await fetch(`${API_BASE_URL}/api/visits/stats`);
      if (statsRes.ok) {
        stats = await statsRes.json();
      }
    }

    // 3. Render real database totals
    if (stats) {
      animateCounter("mobile-count", stats.Mobile ?? 0);
      animateCounter("desktop-count", stats.Desktop ?? 0);
      animateCounter("tablet-count", stats.Tablet ?? 0);
    }
  } catch (error) {
    console.error("Backend tracking sync error:", error);
  }
}

function animateCounter(elementId, targetNumber) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let current = 0;
  const target = Number(targetNumber) || 0;
  const increment = Math.ceil(target / 25) || 1;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = current;
    }
  }, 30);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", trackAndDisplayDeviceVisits);
} else {
  trackAndDisplayDeviceVisits();
}

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
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", type);
} else {
  type();
}

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