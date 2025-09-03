// KNN Regression Demo (Vanilla JS)

const canvas = document.getElementById('plot');
const ctx = canvas.getContext('2d');
const kSelect = document.getElementById('k-select');
const scatterBtn = document.getElementById('scatter-btn');
const classifyBtn = document.getElementById('classify-btn');


const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const POINT_RADIUS = 8;
const UNKNOWN_RADIUS = 10;
const N_POINTS = 30;

let points = [];
let unknownPoint = null;
let neighbors = [];
let hoverPoint = null;

function normalRandom(mean = 0.5, std = 0.18) {
    // Box-Muller transform
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return Math.max(0, Math.min(1, mean + std * num));
}

function randomPoints(n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
        // x, y in [0,1], value in [0,1]
        pts.push({
            x: normalRandom(),
            y: normalRandom(),
            value: normalRandom(),
        });
    }
    return pts;
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // Draw known points
    for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x * WIDTH, p.y * HEIGHT, POINT_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = '#1976d2';
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        // Value label only on hover
        if (hoverPoint && hoverPoint.type === 'known' && hoverPoint.point === p) {
            ctx.fillStyle = '#222';
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.value.toFixed(2), p.x * WIDTH, p.y * HEIGHT - 14);
        }
    }
    // Draw neighbors (if any)
    if (neighbors.length > 0) {
        for (const p of neighbors) {
            ctx.beginPath();
            ctx.arc(p.x * WIDTH, p.y * HEIGHT, POINT_RADIUS + 3, 0, 2 * Math.PI);
            ctx.strokeStyle = '#43a047';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
    // Draw unknown point
    if (unknownPoint) {
        ctx.beginPath();
        ctx.arc(unknownPoint.x * WIDTH, unknownPoint.y * HEIGHT, UNKNOWN_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = '#e53935';
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        // If classified, show value only on hover or always if classified
        if (unknownPoint.value !== undefined && (
            (hoverPoint && hoverPoint.type === 'unknown') || unknownPoint.value !== undefined
        )) {
            ctx.fillStyle = '#222';
            ctx.font = 'bold 15px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(unknownPoint.value.toFixed(2), unknownPoint.x * WIDTH, unknownPoint.y * HEIGHT - 16);
        }
    }
}
function getPointAtMouse(mx, my) {
    // mx, my in canvas coordinates
    // Check known points
    for (const p of points) {
        const dx = mx - p.x * WIDTH;
        const dy = my - p.y * HEIGHT;
        if (dx * dx + dy * dy <= POINT_RADIUS * POINT_RADIUS + 8) {
            return { type: 'known', point: p };
        }
    }
    // Check unknown point
    if (unknownPoint) {
        const dx = mx - unknownPoint.x * WIDTH;
        const dy = my - unknownPoint.y * HEIGHT;
        if (dx * dx + dy * dy <= UNKNOWN_RADIUS * UNKNOWN_RADIUS + 8) {
            return { type: 'unknown', point: unknownPoint };
        }
    }
    return null;
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const found = getPointAtMouse(mx, my);
    if (found !== hoverPoint) {
        hoverPoint = found;
        draw();
    }
});

canvas.addEventListener('mouseleave', () => {
    hoverPoint = null;
    draw();
});

function scatterInitialPoints() {
    points = randomPoints(N_POINTS);
    unknownPoint = null;
    neighbors = [];
    classifyBtn.disabled = true;
    draw();
}

function getKNN(x, y, k) {
    // Return k nearest neighbors to (x, y)
    return points
        .map(p => ({...p, dist: Math.hypot(p.x - x, p.y - y)}))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, k);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / WIDTH;
    const y = (e.clientY - rect.top) / HEIGHT;
    unknownPoint = { x, y };
    neighbors = [];
    classifyBtn.disabled = false;
    draw();
});

scatterBtn.addEventListener('click', () => {
    scatterInitialPoints();
});

classifyBtn.addEventListener('click', () => {
    if (!unknownPoint) return;
    const k = parseInt(kSelect.value, 10);
    neighbors = getKNN(unknownPoint.x, unknownPoint.y, k);
    // Regression: average value of neighbors
    const avg = neighbors.reduce((sum, p) => sum + p.value, 0) / k;
    unknownPoint.value = avg;
    draw();
});

// Initial scatter
scatterInitialPoints();
