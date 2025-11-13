// Main Application Logic

class QuakeVizApp {
    constructor() {
        this.viz = new Visualizations();
        this.baseURL = window.location.origin;
        this.currentData = null;
        this.init();
    }

    init() {
        // Initialize event listeners
        document.getElementById('generateBtn').addEventListener('click', () => this.generateVisualization());
        document.getElementById('refreshBtn').addEventListener('click', () => this.generateVisualization());
        document.getElementById('vizType').addEventListener('change', () => this.updateLimitControl());
        
        // Load initial visualization
        this.generateVisualization();
        this.updateLimitControl();
    }

    updateLimitControl() {
        const vizType = document.getElementById('vizType').value;
        const limitControl = document.getElementById('limitControl');
        
        // Only show limit control for scatter plot
        if (vizType === 'scatter') {
            limitControl.style.display = 'flex';
        } else {
            limitControl.style.display = 'none';
        }
    }

    async fetchData(endpoint, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.baseURL}/api/${endpoint}${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            this.showError('Failed to fetch data. Please try again.');
            return null;
        }
    }

    async generateVisualization() {
        const vizType = document.getElementById('vizType').value;
        const limit = document.getElementById('dataLimit').value;

        // Show loading state
        this.showLoading();

        try {
            let data;
            switch (vizType) {
                case 'pie':
                    data = await this.fetchData('magnitude-distribution');
                    if (data) {
                        this.viz.createPieChart(data);
                        this.updateStats(data, 'Magnitude Distribution');
                    }
                    break;

                case 'bar':
                    data = await this.fetchData('magnitude-distribution');
                    if (data) {
                        this.viz.createBarChart(data, 'Earthquake Magnitude Distribution');
                        this.updateStats(data, 'Magnitude Distribution');
                    }
                    break;

                case 'scatter':
                    data = await this.fetchData('magnitude-vs-depth', { limit });
                    if (data) {
                        this.viz.createScatterPlot(data);
                        this.updateScatterStats(data);
                    }
                    break;

                case 'depthBar':
                    data = await this.fetchData('depth-distribution');
                    if (data) {
                        this.viz.createBarChart(data, 'Earthquake Depth Distribution');
                        this.updateStats(data, 'Depth Distribution');
                    }
                    break;
            }
            
            this.currentData = data;
        } catch (error) {
            console.error('Error generating visualization:', error);
            this.showError('Failed to generate visualization.');
        }
    }

    updateStats(data, title) {
        const statsDiv = document.getElementById('stats');
        
        const entries = Object.entries(data);
        const total = entries.reduce((sum, [_, value]) => sum + value, 0);
        const max = Math.max(...entries.map(([_, value]) => value));
        const maxCategory = entries.find(([_, value]) => value === max)[0];

        statsDiv.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Total Earthquakes</div>
                <div class="stat-value">${total}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Categories</div>
                <div class="stat-value">${entries.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Most Common</div>
                <div class="stat-value">${maxCategory}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Highest Count</div>
                <div class="stat-value">${max}</div>
            </div>
        `;
    }

    updateScatterStats(data) {
        const statsDiv = document.getElementById('stats');
        
        const magnitudes = data.map(d => d.magnitude);
        const depths = data.map(d => d.depth);
        
        const avgMagnitude = (magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length).toFixed(2);
        const avgDepth = (depths.reduce((a, b) => a + b, 0) / depths.length).toFixed(2);
        const maxMagnitude = Math.max(...magnitudes).toFixed(2);
        const maxDepth = Math.max(...depths).toFixed(2);

        statsDiv.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Data Points</div>
                <div class="stat-value">${data.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Avg Magnitude</div>
                <div class="stat-value">${avgMagnitude}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Max Magnitude</div>
                <div class="stat-value">${maxMagnitude}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Avg Depth</div>
                <div class="stat-value">${avgDepth} km</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Max Depth</div>
                <div class="stat-value">${maxDepth} km</div>
            </div>
        `;
    }

    showLoading() {
        document.getElementById('chart').innerHTML = '<div class="loading">Loading visualization</div>';
        document.getElementById('stats').innerHTML = '<div class="loading">Loading statistics</div>';
    }

    showError(message) {
        document.getElementById('chart').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new QuakeVizApp();
});
