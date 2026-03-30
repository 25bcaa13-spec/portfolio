// Spider Theme Portfolio - JavaScript

// ============================================
// SPIDER WEB CANVAS ANIMATION
// ============================================
const canvas = document.getElementById('spiderCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let connections = [];

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

// Particle class for web nodes
class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(192, 192, 192, 0.5)';
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const numParticles = Math.floor((width * height) / 15000);
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const opacity = (1 - distance / 150) * 0.3;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(108, 52, 131, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    drawConnections();
    requestAnimationFrame(animate);
}

// Initialize canvas
resizeCanvas();
initParticles();
animate();

window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

// ============================================
// SMOOTH SCROLL FOR NAVIGATION
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// HEADER SCROLL EFFECT
// ============================================
const header = document.querySelector('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.background = 'rgba(10, 10, 10, 0.98)';
        header.style.boxShadow = '0 5px 30px rgba(108, 52, 131, 0.4)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(108, 52, 131, 0.3)';
    }

    lastScroll = currentScroll;
});

// ============================================
// VISITOR COUNT - FETCH FROM BACKEND
// ============================================
async function fetchVisitorCount() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        if (data.success) {
            const countElement = document.getElementById('visitorCount');
            animateCounter(countElement, data.visitors);
        }
    } catch (error) {
        console.log('Could not fetch visitor count:', error);
        // If backend is not available, show a default
        document.getElementById('visitorCount').textContent = '∞';
    }
}

function animateCounter(element, target) {
    let current = 0;
    const increment = Math.ceil(target / 50);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = current;
    }, 30);
}

// Fetch visitor count on page load
fetchVisitorCount();

// ============================================
// CONTACT FORM SUBMISSION
// ============================================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Basic validation
    if (!name || !email || !message) {
        showMessage('Please fill in all fields.', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('🕷️ Message sent successfully! I\'ll catch up with you soon.', 'success');
            contactForm.reset();
        } else {
            showMessage(data.error || 'Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showMessage('Could not connect to server. Please try again later.', 'error');
    }
});

function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = 'form-message ' + type;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        formMessage.className = 'form-message';
    }, 5000);
}

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for fade-in effect
document.querySelectorAll('section').forEach(section => {
    if (section.id !== 'home') {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    }
});

// ============================================
// PROFILE PHOTO ERROR HANDLING
// ============================================
const profilePhoto = document.getElementById('profilePhoto');

profilePhoto.onerror = function() {
    // If profile photo fails to load, show a placeholder
    this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="48" fill="%231a1a2e" stroke="%236c3483" stroke-width="2"/%3E%3Ccircle cx="50" cy="40" r="15" fill="%236c3483"/%3E%3Cpath d="M25 80 Q50 55 75 80" fill="%236c3483"/%3E%3Ctext x="50" y="95" text-anchor="middle" fill="%23c0c0c0" font-size="8"%3E🕷️%3C/text%3E%3C/svg%3E';
};

// ============================================
// TYPING EFFECT FOR TAGLINE (Optional)
// ============================================
const taglines = ['Web Developer', 'Designer', 'Code Weaver', 'Problem Solver'];
let taglineIndex = 0;
let charIndex = 0;
let isDeleting = false;
const taglineElement = document.querySelector('.tagline');

function typeEffect() {
    const currentTagline = taglines[taglineIndex];

    if (isDeleting) {
        taglineElement.textContent = currentTagline.substring(0, charIndex - 1) + ' | ...';
        charIndex--;
    } else {
        taglineElement.textContent = currentTagline.substring(0, charIndex + 1) + ' | Designer | Code Weaver';
        charIndex++;
    }

    // Complete word
    if (!isDeleting && charIndex === currentTagline.length) {
        setTimeout(() => {
            isDeleting = true;
        }, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        taglineIndex = (taglineIndex + 1) % taglines.length;
    }

    // Typing speed
    const speed = isDeleting ? 50 : 100;
    // Disabled by default - uncomment to enable typing effect
    // setTimeout(typeEffect, speed);
}

// Uncomment to enable typing effect
// typeEffect();

console.log('🕷️ Spider Portfolio loaded successfully!');
