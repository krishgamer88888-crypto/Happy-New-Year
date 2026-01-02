const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// 🔥 Firework Particle
class Particle {
    constructor(x, y, angle, speed, color) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.color = color;
        this.gravity = 0.05;
    }

    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.015;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 🎆 Firework Rocket
class Firework {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetY = Math.random() * canvas.height * 0.5;
        this.speed = 6;
        this.exploded = false;
        this.particles = [];
        this.color = `hsl(${Math.random() * 360},100%,60%)`;
    }

    update() {
        if (!this.exploded) {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
                this.exploded = true;
            }
        } else {
            this.particles.forEach(p => p.update());
            this.particles = this.particles.filter(p => p.alpha > 0);
        }
    }

    draw() {
        if (!this.exploded) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, 3, 10);
        } else {
            this.particles.forEach(p => p.draw());
        }
    }

    explode() {
        for (let i = 0; i < 120; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.particles.push(
                new Particle(this.x, this.y, angle, speed, this.color)
            );
        }
    }
}

let fireworks = [];

setInterval(() => {
    fireworks.push(new Firework());
}, 600);

// 🎥 Animation Loop
function animate() {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach(f => f.update());
    fireworks.forEach(f => f.draw());

    fireworks = fireworks.filter(f => !f.exploded || f.particles.length > 0);

    requestAnimationFrame(animate);
}

animate();
