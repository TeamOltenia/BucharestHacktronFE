import React, { useRef, useState } from "react";
import Chart from "chart.js/auto";

const ChartComponent = () => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [merchantId, setMerchantId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const inputStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    border: "none",
    padding: "10px",
    margin: "0 15px 15px 0",
    borderRadius: "5px",
    marginLeft: "30px",
  };

  const buttonStyle = {
    backgroundColor: "rgb(75, 192, 192)",
    border: "none",
    color: "white",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "5px",
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!merchantId) {
      alert("Please enter the Merchant ID");
      return;
    }

    console.log("Fetching data...");
    const apiUrl = `http://127.0.0.1:8000/data/${merchantId}?merchant=${merchantId}`;
    const response = await fetch(apiUrl);
    const rawData = await response.json();

    const filteredData = rawData.filter((txn) => {
      const txnDate = new Date(txn.unix_time * 1000);
      const startCondition = startDate ? txnDate >= new Date(startDate) : true;
      const endCondition = endDate ? txnDate <= new Date(endDate) : true;
      return startCondition && endCondition;
    });

    const amt = filteredData.map((txn) => txn.amt);
    const totalAmount = amt.reduce((acc, curr) => acc + curr, 0); // Sum up all amounts

    const unix_time = filteredData.map((txn) => {
      const date = new Date(txn.unix_time * 1000);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    });

    const is_fraud = filteredData.map((txn) => txn.is_fraud);
    const backgroundColors = is_fraud.map((fraudFlag) =>
      fraudFlag ? "red" : "rgba(75, 192, 192, 0.5)"
    );
    const pointRadii = is_fraud.map((fraudFlag) => (fraudFlag ? 7 : 3));

    const chartData = {
      labels: unix_time,
      datasets: [
        {
          label: `Amount`,
          data: amt,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: backgroundColors,
          pointBackgroundColor: backgroundColors,
          pointRadius: pointRadii,
        },
      ],
    };

    if (chartRef.current) {
      if (chart) {
        chart.destroy();
      }
      const newChart = new Chart(chartRef.current, {
        type: "line",
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: {
              display: true,
              text: `Total Amount: $${totalAmount.toFixed(2)}`,
              font: {
                size: 30,
                color: "white", // Set title font size larger. Adjust this value to make it even bigger.
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
      setChart(newChart);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Merchant ID"
          value={merchantId}
          onChange={(e) => setMerchantId(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Show Chart
        </button>
      </form>
      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartComponent;
