let chartData;
const alphaSlider = document.getElementById('alpha-slider');
const alphaValueDisplay = document.getElementById('alpha-value'); // Reference to the span element
let originalAmountSqrtSum = [];

// Fetch the chart data from the JSON file located in 'assets/data/'
fetch('/assets/data/plotly_chart_data.json')
    .then(response => response.json())
    .then(data => {
        chartData = data;

        // Store a copy of the original 'amount_sqrt_sum' data for consistent calculations
        originalAmountSqrtSum = chartData.data[2].y.slice();  // Store original values

        // Modify the layout to have a fixed width of 1000px and height of 600px
        chartData.layout.width = 1000;
        chartData.layout.height = 600;

        // Render the initial chart
        Plotly.newPlot('plotly-chart', chartData.data, chartData.layout);
    });

// Function to update the chart when the slider is adjusted
alphaSlider.addEventListener('input', updateChart);

function updateChart() {
    const alphaValue = parseFloat(alphaSlider.value);

    // Update the displayed alpha value
    alphaValueDisplay.textContent = alphaValue.toFixed(1); // Update the span with the current slider value

    // Recalculate 'proper_qf' based on the original 'amount_sqrt_sum' data
    chartData.data[2].y = originalAmountSqrtSum.map((val, idx) => {
        const sqrtSum = val;  // Use the original amount_sqrt_sum value
        const relativeMF = chartData.data[1].y[idx];  // Get the corresponding relative_MF value
        return Math.min(alphaValue * sqrtSum, relativeMF);  // Apply the alpha scaling and cap at relative_MF
    });

    // Update the chart with new data
    Plotly.react('plotly-chart', chartData.data, chartData.layout);
}