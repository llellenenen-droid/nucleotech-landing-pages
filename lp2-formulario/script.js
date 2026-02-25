// === PARTICLES (same as LP1) ===
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [], mouseX = 0, mouseY = 0;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.hue = Math.random() * 40 + 190;
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        const dx = mouseX - this.x, dy = mouseY - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 150) { this.x -= dx * 0.005; this.y -= dy * 0.005; this.opacity = Math.min(this.opacity + 0.02, 0.8); }
        else { this.opacity = Math.max(this.opacity - 0.005, 0.1); }
        if (this.x < 0) this.x = canvas.width; if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height; if (this.y > canvas.height) this.y = 0;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
        ctx.fill();
    }
}

const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 15000));
for (let i = 0; i < count; i++) particles.push(new Particle());

function drawConn() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < 120) {
                ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(77,201,246,${(1-d/120)*0.15})`; ctx.lineWidth = 0.5; ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConn();
    requestAnimationFrame(animate);
}
animate();
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
document.addEventListener('touchmove', e => { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; });

// === UTM ===
function getUTM() {
    const p = new URLSearchParams(window.location.search);
    return { source: p.get('utm_source')||'direct', campaign: p.get('utm_campaign')||'none', medium: p.get('utm_medium')||'none' };
}

// === FORM SUBMIT ===
const WEBHOOK_URL = 'https://n8n.nucleotech.site/webhook/lead-formulario';

function validateField(wrapper, input) {
    const isEmpty = !input.value.trim();
    const isEmailInvalid = input.type === 'email' && !input.value.includes('@');
    wrapper.classList.toggle('error', isEmpty || isEmailInvalid);
    return !isEmpty && !isEmailInvalid;
}

document.getElementById('lead-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const whatsappInput = document.getElementById('whatsapp');
    const emailInput = document.getElementById('email');
    const negocioInput = document.getElementById('negocio');

    const w1 = validateField(whatsappInput.closest('.input-wrapper'), whatsappInput);
    const w2 = validateField(emailInput.closest('.input-wrapper'), emailInput);
    const w3 = validateField(negocioInput.closest('.input-wrapper'), negocioInput);
    if (!w1 || !w2 || !w3) return;

    const btn = document.getElementById('submit-btn');
    btn.querySelector('.btn-text').style.display = 'none';
    btn.querySelector('.btn-loading').style.display = 'inline-flex';
    btn.disabled = true;

    const utm = getUTM();
    const payload = {
        whatsapp: whatsappInput.value.trim().replace(/\s/g, ''),
        email: emailInput.value.trim(),
        negocio: negocioInput.value.trim(),
        origem: 'formulario',
        utm_source: utm.source,
        utm_campaign: utm.campaign,
        utm_medium: utm.medium,
        timestamp: new Date().toISOString()
    };

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.warn('Webhook error (non-blocking):', err);
    }

    // Show success regardless — don't block UX on webhook errors
    document.getElementById('form-screen').style.display = 'none';
    document.getElementById('success-screen').style.display = 'flex';
});