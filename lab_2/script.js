// Налаштування SVG та відступів
const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 20, right: 20, bottom: 40, left: 50 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Група для графічних елементів
const gGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Фіксовані масштабування осей (за замовчуванням беремо домен для v0=50, angle=45)
// Розрахункові значення для v0=50, angle=45: дальність ~255 м, максимальна висота ~64 м.
// Тому для зручності задаємо домени, наприклад, x: [0, 300], y: [0, 100]
const xScale = d3.scaleLinear().domain([0, 300]).range([0, innerWidth]);

const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

// Малювання осей (вони залишаються статичними)
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

const xAxisGroup = gGroup
  .append("g")
  .attr("transform", `translate(0,${innerHeight})`)
  .attr("class", "axis")
  .call(xAxis);

const yAxisGroup = gGroup.append("g").attr("class", "axis").call(yAxis);

// Написи для осей
xAxisGroup
  .append("text")
  .attr("fill", "#000")
  .attr("x", innerWidth / 2)
  .attr("y", 35)
  .attr("text-anchor", "middle")
  .text("x (м)");

yAxisGroup
  .append("text")
  .attr("fill", "#000")
  .attr("transform", "rotate(-90)")
  .attr("x", -innerHeight / 2)
  .attr("y", -40)
  .attr("text-anchor", "middle")
  .text("y (м)");

// Лінійний генератор для траєкторії
const lineGenerator = d3
  .line()
  .x((d) => xScale(d.x))
  .y((d) => yScale(d.y));

// Шлях для траєкторії
const path = gGroup.append("path").attr("class", "line");

// Функція для оновлення графіку
function updateChart() {
  // Зчитування параметрів з форми
  const v0 = parseFloat(document.getElementById("v0").value);
  const angle = parseFloat(document.getElementById("angle").value);
  const g = parseFloat(document.getElementById("g").value);

  // Перетворення кута в радіани
  const theta = (angle * Math.PI) / 180;

  // Час польоту
  const tTotal = (2 * v0 * Math.sin(theta)) / g;

  // Дальність польоту
  const range = v0 * Math.cos(theta) * tTotal;

  // Максимальна висота
  const hMax = (v0 * Math.sin(theta)) ** 2 / (2 * g);

  // Оновлення значень в HTML
  document.getElementById("flightTime").textContent = tTotal.toFixed(2); // Округлення до 2 знаків після коми
  document.getElementById("range").textContent = range.toFixed(2);
  document.getElementById("maxHeight").textContent = hMax.toFixed(2);

  // Генеруємо дані траєкторії (100 точок)
  const numPoints = 100;
  const dt = tTotal / numPoints;
  let data = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i * dt;

    // Обчислення координат
    const x = v0 * Math.cos(theta) * t;
    const y = v0 * Math.sin(theta) * t - 0.5 * g * t * t;
    data.push({ x: x, y: y });
  }

  // Оновлення траєкторії
  path.datum(data).attr("d", lineGenerator);
}

// Початкове малювання траєкторії
updateChart();

// Прив'язка події до кнопки
document.getElementById("updateBtn").addEventListener("click", updateChart);
