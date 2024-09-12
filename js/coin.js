document.addEventListener("DOMContentLoaded", () => {
  const cryptoList = document.getElementById("cryptoList");
  const cryptoSearch = document.getElementById("cryptoSearch");
  const cryptoChart = document.getElementById("cryptoChart");
  const cryptoLogo = document.getElementById("cryptoLogo");
  const cryptoName = document.getElementById("cryptoName");
  const cryptoPrice = document.getElementById("cryptoPrice");
  let chart = null;
  let priceInterval = null;

  // Función para obtener criptomonedas desde la API
  async function fetchCryptos() {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd"
      );
      const data = await response.json();
      renderCryptoList(data);
      // Mostrar automáticamente el gráfico de la criptomoneda "pepe"
      const pepeCrypto = data.find((crypto) => crypto.id === "pepe");
      if (pepeCrypto) {
        showCryptoDetails(pepeCrypto);
        showCryptoChart(pepeCrypto.id);
      }
    } catch (error) {
      console.error("Error fetching cryptocurrencies:", error);
    }
  }

  // Renderiza la lista de criptomonedas en el DOM con íconos
  function renderCryptoList(cryptos) {
    cryptoList.innerHTML = "";
    cryptos.forEach((crypto) => {
      const listItem = document.createElement("li");
      const img = document.createElement("img");
      img.src = crypto.image;
      img.alt = crypto.name;
      img.classList.add("crypto-icon");

      const span = document.createElement("span");
      span.textContent = crypto.name;

      listItem.appendChild(img);
      listItem.appendChild(span);
      listItem.dataset.id = crypto.id;
      listItem.dataset.name = crypto.name;
      listItem.dataset.image = crypto.image;
      listItem.addEventListener("click", () => {
        showCryptoDetails(crypto);
        showCryptoChart(crypto.id);
      });
      cryptoList.appendChild(listItem);
    });
  }

  // Muestra los detalles de la criptomoneda seleccionada y actualiza el precio cada 30 segundos
  function showCryptoDetails(crypto) {
    cryptoLogo.src = crypto.image;
    cryptoName.textContent = crypto.name;
    updatePrice(crypto.id);

    if (priceInterval) clearInterval(priceInterval);

    priceInterval = setInterval(() => {
      updatePrice(crypto.id);
    }, 30000); // 30 segundos
  }

  // Actualiza el precio de la criptomoneda
  async function updatePrice(id) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
      );
      const data = await response.json();
      const price = data[id].usd;
      cryptoPrice.textContent = `Precio actual: $${price}`;
    } catch (error) {
      console.error("Error fetching cryptocurrency price:", error);
    }
  }

  // Muestra el gráfico de la criptomoneda seleccionada
  async function showCryptoChart(id) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=210`
      );
      const data = await response.json();

      // Convertir precios a formato semanal
      const weeklyData = aggregateWeeklyData(data.prices);

      const labels = weeklyData.map((data) =>
        new Date(data.date).toLocaleDateString()
      );
      const prices = weeklyData.map((data) => data.price);

      if (chart) {
        chart.destroy();
      }

      chart = new Chart(cryptoChart, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Precio en USD",
              data: prices,
              borderColor: "#669934",
              backgroundColor: "rgba(102, 153, 52, 0.2)",
              borderWidth: 2,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              beginAtZero: false,
            },
            y: {
              beginAtZero: false,
            },
          },
          plugins: {
            zoom: {
              zoom: {
                enabled: true,
                mode: "x",
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching cryptocurrency chart:", error);
    }
  }

  // Agrega datos semanales a partir de los datos diarios
  function aggregateWeeklyData(dailyData) {
    const weeklyData = [];
    let weekStart = null;
    let weekPrices = [];

    dailyData.forEach((data) => {
      const date = new Date(data[0]);
      const week = getWeek(date);

      if (weekStart === null) {
        weekStart = week;
      }

      if (week !== weekStart) {
        const avgPrice =
          weekPrices.reduce((acc, price) => acc + price, 0) / weekPrices.length;
        weeklyData.push({ date: weekStart.start, price: avgPrice });
        weekPrices = [];
        weekStart = week;
      }

      weekPrices.push(data[1]);
    });

    if (weekPrices.length > 0) {
      const avgPrice =
        weekPrices.reduce((acc, price) => acc + price, 0) / weekPrices.length;
      weeklyData.push({ date: weekStart.start, price: avgPrice });
    }

    return weeklyData;
  }

  // Obtiene el inicio de la semana
  function getWeek(date) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return { start: start.toISOString().split("T")[0] };
  }

  // Filtra la lista de criptomonedas según la búsqueda
  function filterCryptos() {
    const searchTerm = cryptoSearch.value.toLowerCase();
    const items = cryptoList.querySelectorAll("li");
    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(searchTerm) ? "" : "none";
    });
  }

  cryptoSearch.addEventListener("input", filterCryptos);

  fetchCryptos();
});
