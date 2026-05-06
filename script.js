// Функція для перевірки правильності введених даних користувачем
function validateInputs() {
  // Отримуємо значення з полів форми та обрізаємо пробіли
  const nInput = +document.getElementById("itemCount").value.trim();
  const weightsInput = document.getElementById("weights").value.trim();
  const valuesInput = document.getElementById("values").value.trim();
  const WInput = +document.getElementById("maxWeight").value.trim();

  // Перевіряємо, чи всі поля заповнені
  if (!nInput || !weightsInput || !valuesInput || !WInput) {
    document.getElementById("error").innerHTML = "❗ Заповніть всі поля";
    return false;
  }

  // Перетворюємо введені значення на числа
  const n = nInput;
  const W = WInput;
  const weights = weightsInput.split(",").map(Number);
  const values = valuesInput.split(",").map(Number);

  // Перевіряємо, чи всі значення є коректними числами
  if (isNaN(n) || isNaN(W) || weights.some(isNaN) || values.some(isNaN)) {
    document.getElementById("error").innerHTML =
      "❗ Некоректні числові значення";
    return false;
  }

  // Перевіряємо, чи кількість ваг і цінностей відповідає кількості предметів
  if (weights.length !== n || values.length !== n) {
    document.getElementById(
      "error"
    ).innerHTML = `❗ Очікується ${n} предметів. Введено: ${weights.length} ваг, ${values.length} цінностей`;
    return false;
  }

  // Якщо все коректно, повертаємо об'єкт з даними
  document.getElementById("error").innerHTML = "";
  return { n, W, weights, values };
}

// Основна функція для розв'язання задачі про рюкзак
async function solveKnapsack() {
  // Перевіряємо введені дані
  const validation = validateInputs();
  if (!validation) return;

  // Розпаковуємо дані
  const { n, W, weights, values } = validation;

  // Ініціалізуємо таблицю динамічного програмування dp[n+1][W+1]
  const dp = Array(n + 1)
    .fill()
    .map(() => Array(W + 1).fill(0));

  // Створюємо сітку для відображення таблиці
  const grid = document.createElement("div");
  grid.className = "grid-table";
  grid.style.gridTemplateColumns = `repeat(${W + 2}, auto)`; // +2 для стовпчика з номерами рядків

  // Додаємо заголовки стовпців (0, 1, 2, ..., W)
  ["i \\ w", ...Array.from({ length: W + 1 }, (_, i) => i)].forEach(
    (val, idx) => {
      const header = createGridCell(val, true);
      header.style.gridColumn = idx + 1;
      grid.appendChild(header);
    }
  );

  // Додаємо заголовки рядків і створюємо клітинки для кожного елемента таблиці
  for (let i = 0; i <= n; i++) {
    const rowHeader = createGridCell(i, true);
    rowHeader.style.gridRow = i + 2;
    grid.appendChild(rowHeader);

    for (let w = 0; w <= W; w++) {
      const cell = createGridCell("0", false); // Ініціалізація значення клітинки нулем
      cell.id = `cell-${i}-${w}`;
      cell.style.gridRow = i + 2;
      cell.style.gridColumn = w + 2;
      grid.appendChild(cell);
    }
  }

  // Додаємо створену сітку в DOM
  document.getElementById("dpTable").innerHTML = "";
  document.getElementById("dpTable").appendChild(grid);

  // Обчислюємо таблицю dp поступово з візуалізацією
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= W; w++) {
      await new Promise((resolve) => setTimeout(resolve, 150)); // Затримка для візуалізації
      const cell = document.getElementById(`cell-${i}-${w}`);

      cell?.classList.add("highlight"); // Підсвітка активної клітинки
      await new Promise((resolve) => setTimeout(resolve, 20)); // Коротка затримка для ефекту

      if (weights[i - 1] > w) {
        // Якщо предмет не вміщається, значення як у попередньому рядку
        dp[i][w] = dp[i - 1][w];
      } else {
        // Обираємо максимум між тим, щоб не брати предмет і взяти його
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        );
      }

      // Оновлюємо текст у клітинці
      cell ? (cell.textContent = dp[i][w]) : null;
      cell?.classList.remove("highlight"); // Знімаємо підсвітку після обчислення
    }
  }

  // Відновлюємо, які саме предмети увійшли до оптимального рішення
  let res = dp[n][W];
  let currentWeight = W;
  const selectedItems = [];

  for (let i = n; i > 0 && res > 0; i--) {
    if (res !== dp[i - 1][currentWeight]) {
      selectedItems.push({ i, w: currentWeight });
      res -= values[i - 1];
      currentWeight -= weights[i - 1];
    }
  }

  // Підсвічуємо клітинки, що відповідають вибраним предметам
  selectedItems.reverse().forEach(({ i, w }) => {
    const cell = document.getElementById(`cell-${i}-${w}`);
    cell?.classList.add("highlight-selected");
  });

  // Виводимо результат розв'язку
  document.getElementById("result").innerHTML = `
        <h3>Результат:</h3>
        <p>Максимальна цінність: ${dp[n][W]}</p>
        <p>Обрані предмети: ${selectedItems
          .map((item) => item.i)
          .join(", ")}</p>
    `;
}

// Функція для створення клітинки таблиці (звичайної або заголовкової)
function createGridCell(content, isHeader) {
  const cell = document.createElement("div");
  cell.className = `grid-cell ${isHeader ? "grid-header" : ""}`;
  cell.textContent = content;
  return cell;
}

// Функція для очищення результатів (таблиця, результат, повідомлення про помилки)
function clearResults() {
  const dpTable = document.getElementById("dpTable");
  dpTable.innerHTML = "";

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  document.getElementById("error").innerHTML = "";

  // Можна також очищати поля вводу за потреби (закоментовано)
  // document.getElementById("itemCount").value = "";
  // document.getElementById("maxWeight").value = "";
  // document.getElementById("weights").value = "";
  // document.getElementById("values").value = "";
}
