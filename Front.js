const header = document.getElementById("header");
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const heroArt = document.getElementById("heroArt");
const overlay = document.getElementById("orbitOverlay");
const techPanel = document.getElementById("techPanel");
const techBtn = document.getElementById("techBtn");
const closeTech = document.getElementById("closeTech");
const demoModal = document.getElementById("demoModal");
const lightbox = document.getElementById("lightbox");
const formMsg = document.getElementById("formMsg");

window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 12);
});

navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
});

const sections = [...document.querySelectorAll("section[id]")];
const navLinks = [...nav.querySelectorAll("a")];

const setActive = () => {
    const y = window.scrollY + 120;
    let current = sections[0]?.id;
    sections.forEach((section) => {
        if (section.offsetTop <= y) current = section.id;
    });
    navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
};

window.addEventListener("scroll", setActive);
setActive();

for (let i = 0; i < 18; i += 1) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.left = `${8 + Math.random() * 84}%`;
    spark.style.top = `${8 + Math.random() * 84}%`;
    spark.style.animationDelay = `${Math.random() * 2}s`;
    overlay.appendChild(spark);
}

heroArt.addEventListener("mousemove", (event) => {
    const box = heroArt.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    overlay.style.transform = `translate(${x * 12}px, ${y * 10}px)`;
});

heroArt.addEventListener("mouseleave", () => {
    overlay.style.transform = "translate(0, 0)";
});

techBtn.addEventListener("click", () => {
    techPanel.hidden = !techPanel.hidden;
});

closeTech.addEventListener("click", () => {
    techPanel.hidden = true;
});

document.querySelectorAll("[data-open-demo]").forEach((btn) => {
    btn.addEventListener("click", () => {
        demoModal.hidden = false;
    });
});

document.querySelectorAll("[data-close-demo]").forEach((btn) => {
    btn.addEventListener("click", () => {
        demoModal.hidden = true;
    });
});

demoModal.addEventListener("click", (event) => {
    if (event.target === demoModal) demoModal.hidden = true;
});

document.getElementById("demoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    demoModal.hidden = true;
    event.target.reset();
});

document.getElementById("contactForm").addEventListener("submit", (event) => {
    event.preventDefault();
    formMsg.hidden = false;
    event.target.reset();
});

document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
        const img = lightbox.querySelector("img");
        img.src = item.dataset.full;
        img.alt = item.querySelector("img").alt;
        lightbox.hidden = false;
    });
});

document.getElementById("closeLightbox").addEventListener("click", () => {
    lightbox.hidden = true;
});

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.hidden = true;
});

const revealItems = document.querySelectorAll(".reveal");
const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
    });
}, { threshold: 0.2 });

revealItems.forEach((item) => reveal.observe(item));

const counters = document.querySelectorAll("[data-count]");
const countOnce = new Set();

const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const tick = (now) => {
        const progress = Math.min((now - start) / 1200, 1);
        el.textContent = Math.floor(target * progress).toLocaleString("pt-PT");
        if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};

const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting && !countOnce.has(entry.target)) {
            countOnce.add(entry.target);
            animateCount(entry.target);
        }
    });
}, { threshold: 0.6 });

counters.forEach((el) => countObserver.observe(el));

document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
        card.classList.add("show");
        card.scrollIntoView({ behavior: "smooth", block: "center" });
    });
});
