import React, { useRef, useState } from "react";
import Chart from "chart.js/auto";

const ChartComponent = () => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [merchantId, setMerchantId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const inputStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Semi-transparent input background
    border: "none", // Remove default border
    padding: "10px",
    margin: "0 15px 15px 0", // 15px right and bottom margin
    borderRadius: "5px", // Rounded corners
    marginLeft: "30px",
  };

  const buttonStyle = {
    backgroundColor: "rgb(75, 192, 192)", // Same as chart borderColor
    border: "none",
    color: "white",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "5px", // Rounded corners
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!merchantId) {
      alert("Please enter the Merchant ID");
      return;
    }

    console.log("Fetching data...");
    const apiUrl = `http://127.0.0.1:8000/data/{id}?merchant=${merchantId}`;
    const response = await fetch(apiUrl.replace("{id}", merchantId)); // Ensure the ID is included in the URL
    const rawData = await response.json();

    console.log("API Response:", rawData); // Check what the API response actually looks like

    // Filter transactions based on startDate and endDate
    const filteredData = rawData.filter((txn) => {
      const txnDate = new Date(txn.unix_time * 1000);
      return txnDate >= new Date(startDate) && txnDate <= new Date(endDate);
    });

    const amt = filteredData.map((txn) => txn.amt);
    const unix_time = filteredData.map((txn) => {
      const date = new Date(txn.unix_time * 1000);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    });
    const is_fraud = filteredData.map((txn) => txn.is_fraud);

    const backgroundColors = is_fraud.map((fraudFlag) =>
      fraudFlag ? "red" : "rgba(75, 192, 192, 0.5)"
    );

    const chartData = {
      labels: unix_time,
      datasets: [
        {
          label: "Amounts",
          data: amt,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: backgroundColors,
          pointBackgroundColor: backgroundColors,
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
