const canvas = document.getElementById('trajectoryCanvas');
    const ctx = canvas.getContext('2d');
    
    function drawGrid() {
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;
      ctx.font = '12px font-size';
      ctx.fillStyle = '#555';
      
      for (let x = 0; x <= canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        ctx.fillText(x, x + 2, canvas.height - 2);
      }
      
      for (let y = 0; y <= canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        ctx.fillText(canvas.height - y, 2, y - 2);
      }
    }
    
    // Функція для малювання траєкторії
    function drawTrajectory() {
      const x0 = parseFloat(document.getElementById('x0').value);
      const y0 = parseFloat(document.getElementById('y0').value);
      const angleDeg = parseFloat(document.getElementById('angle').value);
      const speed = parseFloat(document.getElementById('speed').value);
      const acceleration = parseFloat(document.getElementById('acceleration').value);
      const color = document.getElementById('color').value;

      // Переводимо градуси в радіани
      const angleRad = angleDeg * Math.PI / 180;
      const dirX = Math.cos(angleRad);
      const dirY = Math.sin(angleRad);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const startX = x0;
      const startY = canvas.height - y0;
      ctx.moveTo(startX, startY);
      
      let t = 0;
      const dt = 0.1;
      const maxTime = 10;
      
      // Цикл для обчислення координат траєкторії
      while (t <= maxTime) {
        const s = speed * t + 0.5 * acceleration * t * t;
        const physX = x0 + dirX * s;
        const physY = y0 + dirY * s;
        
        const canvasX = physX;
        const canvasY = canvas.height - physY;
        
        ctx.lineTo(canvasX, canvasY);
        
        if (canvasX < 0 || canvasX > canvas.width || canvasY < 0 || canvasY > canvas.height) {
          break;
        }
        t += dt;
      }
      ctx.stroke();
    }
    
    // Обробник для кнопки "Побудувати траєкторію"
    document.getElementById('drawButton').addEventListener('click', drawTrajectory);
    document.getElementById('clearButton').addEventListener('click', function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
    });
    
    drawGrid();


    