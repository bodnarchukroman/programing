// --- 1. ВХІДНІ ДАНІ (Вимога: 5, 10, 20 точок) ---
const dataSets = {
    '5': [ {x: 1, y: 2}, {x: 2, y: 4}, {x: 3, y: 3}, {x: 4, y: 5}, {x: 5, y: 7} ],
    '10': [ {x: 0.5, y: 1.2}, {x: 1, y: 2.5}, {x: 1.5, y: 2.1}, {x: 2, y: 3.6}, {x: 2.5, y: 3.0}, {x: 3, y: 5.1}, {x: 3.5, y: 4.5}, {x: 4, y: 4.8}, {x: 4.5, y: 6.9}, {x: 5, y: 6.2} ],
    '20': [ {x: 0.2, y: 0.8}, {x: 0.5, y: 1.2}, {x: 0.8, y: 1.5}, {x: 1, y: 2.5}, {x: 1.2, y: 2.2}, {x: 1.5, y: 3.1}, {x: 1.8, y: 2.9}, {x: 2, y: 3.6}, {x: 2.2, y: 3.2}, {x: 2.5, y: 4.0}, {x: 2.8, y: 3.8}, {x: 3, y: 5.1}, {x: 3.2, y: 4.8}, {x: 3.5, y: 5.5}, {x: 3.8, y: 5.0}, {x: 4, y: 4.8}, {x: 4.2, y: 5.2}, {x: 4.5, y: 5.9}, {x: 4.8, y: 6.0}, {x: 5, y: 6.2} ]
};

const canvas = document.getElementById('plotCanvas');
const ctx = canvas.getContext('2d');
let currentPoints = [];
let minX, maxX, minY, maxY;
let animationId;

// --- 2. МАТЕМАТИЧНЕ ЯДРО ---
function getLagrangeValue(x, points) {
    let result = 0;
    for (let i = 0; i < points.length; i++) {
        let term = points[i].y;
        for (let j = 0; j < points.length; j++) {
            if (i !== j) term = term * (x - points[j].x) / (points[i].x - points[j].x);
        }
        result += term;
    }
    return result;
}

function calculateLSMCoefficients(points, degree) {
    const n = points.length;
    const m = degree + 1;
    let matrix = Array(m).fill(0).map(() => Array(m + 1).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) {
            let sumX = 0;
            for (let k = 0; k < n; k++) sumX += Math.pow(points[k].x, i + j);
            matrix[i][j] = sumX;
        }
        let sumY = 0;
        for (let k = 0; k < n; k++) sumY += points[k].y * Math.pow(points[k].x, i);
        matrix[i][m] = sumY;
    }
    return solveGauss(matrix);
}

function solveGauss(matrix) {
    let n = matrix.length;
    for (let i = 0; i < n; i++) {
        let maxEl = Math.abs(matrix[i][i]), maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(matrix[k][i]) > maxEl) { maxEl = Math.abs(matrix[k][i]); maxRow = k; }
        }
        for (let k = i; k < n + 1; k++) {
            let tmp = matrix[maxRow][k]; matrix[maxRow][k] = matrix[i][k]; matrix[i][k] = tmp;
        }
        for (let k = i + 1; k < n; k++) {
            let c = -matrix[k][i] / matrix[i][i];
            for (let j = i; j < n + 1; j++) {
                if (i === j) matrix[k][j] = 0; else matrix[k][j] += c * matrix[i][j];
            }
        }
    }
    let x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = matrix[i][n] / matrix[i][i];
        for (let k = i - 1; k >= 0; k--) matrix[k][n] -= matrix[k][i] * x[i];
    }
    return x;
}

function getLSMValue(x, coeffs) {
    return coeffs.reduce((sum, coeff, i) => sum + coeff * Math.pow(x, i), 0);
}

// --- 3. ЛОГІКА МАСШТАБУВАННЯ (Вимога: Автомасштабування) ---
function calculateScale() {
    minX = Math.min(...currentPoints.map(p => p.x));
    maxX = Math.max(...currentPoints.map(p => p.x));
    minY = Math.min(...currentPoints.map(p => p.y));
    maxY = Math.max(...currentPoints.map(p => p.y));

    // Відступи, щоб графік не прилипав до країв
    let padX = (maxX - minX) * 0.1 || 1;
    let padY = (maxY - minY) * 0.2 || 1;

    minX -= padX; maxX += padX;
    minY -= padY; maxY += padY;
}

function toScreenX(x) { return ((x - minX) / (maxX - minX)) * canvas.width; }
function toScreenY(y) { return canvas.height - ((y - minY) / (maxY - minY)) * canvas.height; }

// --- 4. ВІЗУАЛІЗАЦІЯ ТА АНІМАЦІЯ ---
function drawBase() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Осі та сітка
    ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1;
    for(let i=0; i<=10; i++) {
        let x = minX + (maxX - minX) * (i/10);
        let y = minY + (maxY - minY) * (i/10);
        
        ctx.beginPath(); ctx.moveTo(toScreenX(x), 0); ctx.lineTo(toScreenX(x), canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, toScreenY(y)); ctx.lineTo(canvas.width, toScreenY(y)); ctx.stroke();
    }

    // Експериментальні точки
    ctx.fillStyle = '#e74c3c';
    currentPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(toScreenX(p.x), toScreenY(p.y), 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function startAnimation() {
    if (animationId) cancelAnimationFrame(animationId);
    currentPoints = dataSets[document.getElementById('datasetSelect').value];
    calculateScale();
    drawBase();

    const method = document.getElementById('methodSelect').value;
    let currentX = currentPoints[0].x;
    const step = (currentPoints[currentPoints.length - 1].x - currentPoints[0].x) / 100;
    
    ctx.beginPath();
    ctx.strokeStyle = method === 'lagrange' ? '#2980b9' : '#27ae60';
    ctx.lineWidth = 2;
    
    let coeffs = [];
    if (method === 'mnk') {
        const degree = parseInt(document.getElementById('polyDegree').value);
        
        // Перевірка коректності степеня полінома
        if (degree >= currentPoints.length) {
            alert(`Помилка! Степінь полінома (${degree}) має бути меншою за кількість точок (${currentPoints.length}).`);
            return;
        }

        coeffs = calculateLSMCoefficients(currentPoints, degree);
        
        // Перевірка на NaN (якщо матриця вироджена)
        if(coeffs.some(isNaN)) {
            document.getElementById('errorMsg').style.display = 'inline';
            return;
        }
        document.getElementById('errorMsg').style.display = 'none';
    }

    // Анімація малювання кривої
    function animateCurve() {
        if (currentX > currentPoints[currentPoints.length - 1].x) {
            if (method === 'mnk') drawResiduals(coeffs);
            return;
        }

        let calcY = method === 'lagrange' ? getLagrangeValue(currentX, currentPoints) : getLSMValue(currentX, coeffs);
        
        if (currentX === currentPoints[0].x) ctx.moveTo(toScreenX(currentX), toScreenY(calcY));
        else ctx.lineTo(toScreenX(currentX), toScreenY(calcY));
        
        ctx.stroke();
        currentX += step;
        animationId = requestAnimationFrame(animateCurve);
    }
    animateCurve();
}

function drawResiduals(coeffs) {
    ctx.strokeStyle = 'rgba(231, 76, 60, 0.5)'; // Напівпрозорий червоний для залишків
    ctx.setLineDash([5, 5]); // Пунктирна лінія
    
    currentPoints.forEach(p => {
        let calcY = getLSMValue(p.x, coeffs);
        ctx.beginPath();
        ctx.moveTo(toScreenX(p.x), toScreenY(p.y));
        ctx.lineTo(toScreenX(p.x), toScreenY(calcY));
        ctx.stroke();
    });
    ctx.setLineDash([]); // Повертаємо суцільну лінію
}

function resetAndDraw() {
    currentPoints = dataSets[document.getElementById('datasetSelect').value];
    calculateScale();
    drawBase();
}

// Початковий запуск
resetAndDraw();

// Оновлено логіку анімацій