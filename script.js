// ---------- CANVAS SETUP ----------
const sky = document.getElementById("sky");
const fireworks = document.getElementById("fireworks");
const sctx = sky.getContext("2d");
const fctx = fireworks.getContext("2d");

function resize() {
    sky.width = fireworks.width = window.innerWidth;
    sky.height = fireworks.height = window.innerHeight;
}
resize();
window.onresize = resize;

// ---------- STARS ----------
const stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * sky.width,
    y: Math.random() * sky.height,
    r: Math.random() * 1.5,
    a: Math.random()
}));

function drawStars() {
    sctx.clearRect(0, 0, sky.width, sky.height);
    sctx.fillStyle = "white";
    stars.forEach(star => {
        star.a += (Math.random() - 0.5) * 0.05;
        sctx.globalAlpha = Math.abs(star.a);
        sctx.beginPath();
        sctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        sctx.fill();
    });
    requestAnimationFrame(drawStars);
}
drawStars();

// ---------- REALISTIC FIREWORKS ----------
const rockets = [];
const particles = [];

class Rocket {
    constructor() {
        this.x = Math.random() * fireworks.width;
        this.y = fireworks.height;
        this.vy = - (6 + Math.random() * 3);
        this.color = `hsl(${Math.random() * 360},100%,60%)`;
    }

    update() {
        this.y += this.vy;
        this.vy += 0.05; // gravity
        if (this.vy >= 0) {
            explode(this.x, this.y, this.color);
            return false;
        }
        return true;
    }

    draw() {
        fctx.fillStyle = this.color;
        fctx.fillRect(this.x, this.y, 3, 8);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 100;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // gravity
        this.life--;
        return this.life > 0;
    }

    draw() {
        fctx.globalAlpha = this.life / 100;
        fctx.fillStyle = this.color;
        fctx.beginPath();
        fctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        fctx.fill();
        fctx.globalAlpha = 1;
    }
}

function explode(x, y, color) {
    for (let i = 0; i < 60; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function launchRocket() {
    rockets.push(new Rocket());
}

setInterval(launchRocket, 600);

// ---------- DRAW LOOP ----------
function drawFireworks() {
    fctx.clearRect(0, 0, fireworks.width, fireworks.height);

    for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].draw();
        if (!rockets[i].update()) rockets.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw();
        if (!particles[i].update()) particles.splice(i, 1);
    }

    requestAnimationFrame(drawFireworks);
}

drawFireworks();

// ---------- LOCATION (SAFE & OPTIONAL) ----------
const locationText = document.getElementById("locationText");

async function getAccurateLocation() {
    try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        const city = data.city || "";
        const region = data.region || "";
        const country = data.country_name || "";
        const flag = data.country_code
            ? String.fromCodePoint(...[...data.country_code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
            : "";

        const time = new Date().toLocaleTimeString("en-US", {
            timeZone: data.timezone,
            hour: "2-digit",
            minute: "2-digit"
        });

        locationText.innerHTML = `
            🎉 Happy New Year 2026 to our friends in <b>${city}, ${region}, ${country}</b> ${flag}<br>
            🕛 Local Time: ${time}
        `;
    } catch {
        locationText.innerText =
            "🎉 Happy New Year 2026 to our friends around the world 🌍";
    }
}

getAccurateLocation();

function requestExactLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        async pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            // Reverse lookup (city-level only, safe)
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            const data = await res.json();

            const city =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                "your area";

            locationText.innerHTML =
                `🎉 Happy New Year 2026 to our friends in <b>${city}</b> 🌟<br>
                 Thank you for celebrating with us!`;
        },
        () => {
            // user denied
        }
    );
}


