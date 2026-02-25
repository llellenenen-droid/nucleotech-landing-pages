// === PARTICLE SYSTEM ===
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = 0;
let mouseY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }

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
        this.x += this.speedX;
        this.y += this.speedY;

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
            this.x -= dx * 0.005;
            this.y -= dy * 0.005;
            this.opacity = Math.min(this.opacity + 0.02, 0.8);
        } else {
            this.opacity = Math.max(this.opacity - 0.005, 0.1);
        }

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
        ctx.fill();
    }
}

const particleCount = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 15000));
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
                const opacity = (1 - dist / 120) * 0.15;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(77, 201, 246, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    drawConnections();
    requestAnimationFrame(animate);
}

animate();

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.addEventListener('touchmove', (e) => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
});

// === UTM TRACKING ===
function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        source: params.get('utm_source') || 'direct',
        medium: params.get('utm_medium') || 'none',
        campaign: params.get('utm_campaign') || 'none',
        content: params.get('utm_content') || 'none'
    };
}

const ctaButton = document.getElementById('whatsapp-cta');
if (ctaButton) {
    const utm = getUTMParams();
    const whatsappBase = 'https://wa.me/5511980782216';
    const message = encodeURIComponent(
        `Olá! Vi o vosso anúncio e gostaria de saber mais sobre a secretária virtual.\n\n[origem: pressel | source: ${utm.source} | campaign: ${utm.campaign}]`
    );
    ctaButton.href = `${whatsappBase}?text=${message}`;

    ctaButton.addEventListener('click', () => {
        const eventData = {
            event: 'whatsapp_click',
            page: 'pressel',
            timestamp: new Date().toISOString(),
            utm: utm,
            userAgent: navigator.userAgent
        };

        // Enviar para o n8n (descomentar quando o webhook estiver pronto)
        // fetch('https://n8n.nucleotech.site/webhook/lead-tracking', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(eventData)
        // }).catch(() => {});

        console.log('CTA Click:', eventData);
    });
}
