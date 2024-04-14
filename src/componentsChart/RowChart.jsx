import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto"; // Importing Chart.js

const ChartComponent = () => {
  const chartRef = useRef(null); // Reference to the canvas where the chart will be drawn
  const [chart, setChart] = useState(null); // State to keep track of the chart instance

  useEffect(() => {
    // Function to fetch and prepare chart data
    const fetchChartData = async () => {
      console.log("Fetching data...");
      const response = await fetch("http://127.0.0.1:8000/dummy_data?n=100");
      const rawData = await response.json();
      console.log(rawData);

      const steps = rawData.map((txn) => txn.step); // Extract steps for labels
      const amounts = rawData.map((txn) => txn.amount); // Extract amounts for a dataset

      // Map background colors based on the amount value
      const backgroundColors = amounts.map((amount) =>
        amount < 800000 ? "red" : "rgba(75, 192, 192, 0.5)"
      );

      return {
        labels: steps,
        datasets: [
          {
            label: "Transaction Amounts",
            data: amounts,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: backgroundColors, // Apply conditional colors
            pointBackgroundColor: backgroundColors, // Same as above for the points
          },
        ],
      };
    };

    const initializeChart = async () => {
      const { labels, datasets } = await fetchChartData();

      const chartConfig = {
        type: "line",
        data: { labels, datasets },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
          },
          scales: {
            y: {
              // Ensure the y-axis starts at 0
              beginAtZero: true,
            },
          },
        },
      };

      if (chartRef.current) {
        if (chart) {
          chart.destroy(); // Ensure the existing chart is destroyed
        }
        const newChart = new Chart(chartRef.current, chartConfig);
        setChart(newChart);
      }
    };

    initializeChart();

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartComponent;
