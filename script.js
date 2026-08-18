const API_BASE_URL = "https://volunteers-backend-35oe.onrender.com";

// Clear outdated local storage mock stats
try {
  localStorage.removeItem("portfolio_device_stats");
} catch (e) {}

// ===== TYPEWRITER EFFECT =====
function initTypewriter() {
  const typingEl = document.getElementById("typing");
  if (!typingEl) return;

  const roles = [
    "Software IV&V Engineer",
    "Radar System Validation Specialist",
    "Black Box Testing Expert",
    "Java & Automation Enthusiast"
  ];
  let count = 0;
  let index = 0;
  let isDeleting = false;

  function type() {
    if (count >= roles.length) count = 0;
    const currentText = roles[count];

    if (isDeleting) {
      typingEl.textContent = currentText.substring(0, index - 1);
      index--;
    } else {
      typingEl.textContent = currentText.substring(0, index + 1);
      index++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && index === currentText.length) {
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && index === 0) {
      isDeleting = false;
      count++;
      speed = 400;
    }

    setTimeout(type, speed);
  }

  type();
}

// ===== DEVICE DETECTION & LIVE API TRACKING =====
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
      const response = await fetch(`${API_BASE_URL}/api/visits/track?deviceType=${currentDevice}`, {
        method: "POST"
      });
      if (response.ok) {
        stats = await response.json();
        sessionStorage.setItem(sessionKey, "true");
      }
    }

    if (!stats) {
      const statsRes = await fetch(`${API_BASE_URL}/api/visits/stats`);
      if (statsRes.ok) {
        stats = await statsRes.json();
      }
    }

    if (stats) {
      animateCounter("mobile-count", stats.Mobile ?? 0);
      animateCounter("desktop-count", stats.Desktop ?? 0);
      animateCounter("tablet-count", stats.Tablet ?? 0);
    }
  } catch (error) {
    console.error("Backend tracking sync error:", error);
  }
}

// Make accessible to console
window.trackAndDisplayDeviceVisits = trackAndDisplayDeviceVisits;
window.detectDeviceType = detectDeviceType;

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

// ===== DOM INITIALIZATION =====
function initApp() {
  initTypewriter();
  trackAndDisplayDeviceVisits();

  // Mobile Hamburger Toggle
  const hamburger = document.getElementById("hamburger");
  const navLinksContainer = document.getElementById("navLinks");
  const navItems = document.querySelectorAll(".nav-links a");

  if (hamburger && navLinksContainer) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      navLinksContainer.classList.toggle("active");
      const icon = hamburger.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
      }
    });

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

  // Intersection Observer for Scroll Animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          entry.target.classList.remove("hidden");
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".hidden, .section, .hero").forEach((el) => observer.observe(el));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
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