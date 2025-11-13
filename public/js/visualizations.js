// D3.js Visualization Functions

class Visualizations {
    constructor() {
        this.margin = { top: 40, right: 40, bottom: 60, left: 60 };
        this.colors = d3.schemeSet3;
    }

    // Clear existing chart
    clearChart() {
        d3.select('#chart').selectAll('*').remove();
    }

    // Create Pie Chart
    createPieChart(data) {
        this.clearChart();

        const width = 800;
        const height = 600;
        const radius = Math.min(width, height) / 2 - 40;

        const svg = d3.select('#chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        // Convert data object to array
        const dataArray = Object.entries(data).map(([key, value]) => ({
            label: key,
            value: value
        }));

        // Color scale
        const color = d3.scaleOrdinal()
            .domain(dataArray.map(d => d.label))
            .range(this.colors);

        // Create pie layout
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        // Create arc generator
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const labelArc = d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius * 0.6);

        const outerArc = d3.arc()
            .innerRadius(radius * 1.1)
            .outerRadius(radius * 1.1);

        // Create pie slices
        const slices = svg.selectAll('.slice')
            .data(pie(dataArray))
            .enter()
            .append('g')
            .attr('class', 'slice');

        // Add paths (pie slices)
        slices.append('path')
            .attr('class', 'pie-slice')
            .attr('d', arc)
            .attr('fill', d => color(d.data.label))
            .on('mouseover', function(event, d) {
                d3.select(this).style('opacity', 0.8);
                showTooltip(event, `${d.data.label}: ${d.data.value} earthquakes (${((d.data.value / d3.sum(dataArray, d => d.value)) * 100).toFixed(1)}%)`);
            })
            .on('mouseout', function() {
                d3.select(this).style('opacity', 1);
                hideTooltip();
            })
            .transition()
            .duration(1000)
            .attrTween('d', function(d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function(t) {
                    return arc(interpolate(t));
                };
            });

        // Add percentage labels inside slices
        slices.append('text')
            .attr('class', 'slice-value')
            .attr('transform', d => `translate(${labelArc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .style('opacity', 0)
            .text(d => d.data.value > 0 ? d.data.value : '')
            .transition()
            .delay(1000)
            .duration(500)
            .style('opacity', 1);

        // Add labels outside with lines
        const labels = slices.append('text')
            .attr('class', 'slice-label')
            .attr('transform', d => {
                const pos = outerArc.centroid(d);
                pos[0] = radius * 1.15 * (midAngle(d) < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            })
            .attr('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
            .style('opacity', 0)
            .text(d => d.data.label)
            .transition()
            .delay(1000)
            .duration(500)
            .style('opacity', 1);

        // Add polylines
        slices.append('polyline')
            .attr('stroke', '#999')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none')
            .attr('points', d => {
                const pos = outerArc.centroid(d);
                pos[0] = radius * 1.15 * (midAngle(d) < Math.PI ? 1 : -1);
                return [labelArc.centroid(d), outerArc.centroid(d), pos];
            })
            .style('opacity', 0)
            .transition()
            .delay(1000)
            .duration(500)
            .style('opacity', 0.5);

        // Add title
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -radius - 20)
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .style('fill', '#495057')
            .text('Earthquake Magnitude Distribution');

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }
    }

    // Create Bar Chart
    createBarChart(data, title = 'Distribution') {
        this.clearChart();

        const container = document.getElementById('chart');
        const width = Math.min(container.clientWidth, 900);
        const height = 600;

        const svg = d3.select('#chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const chartWidth = width - this.margin.left - this.margin.right;
        const chartHeight = height - this.margin.top - this.margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // Convert data
        const dataArray = Object.entries(data).map(([key, value]) => ({
            label: key,
            value: value
        }));

        // Scales
        const x = d3.scaleBand()
            .domain(dataArray.map(d => d.label))
            .range([0, chartWidth])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(dataArray, d => d.value) * 1.1])
            .range([chartHeight, 0]);

        const color = d3.scaleOrdinal()
            .domain(dataArray.map(d => d.label))
            .range(this.colors);

        // Add axes
        g.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'middle')
            .attr('transform', 'rotate(-15)');

        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y).ticks(10));

        // Add bars
        g.selectAll('.bar')
            .data(dataArray)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.label))
            .attr('width', x.bandwidth())
            .attr('y', chartHeight)
            .attr('height', 0)
            .attr('fill', d => color(d.label))
            .on('mouseover', function(event, d) {
                d3.select(this).style('opacity', 0.8);
                showTooltip(event, `${d.label}: ${d.value} earthquakes`);
            })
            .on('mouseout', function() {
                d3.select(this).style('opacity', 1);
                hideTooltip();
            })
            .transition()
            .duration(1000)
            .attr('y', d => y(d.value))
            .attr('height', d => chartHeight - y(d.value));

        // Add value labels on bars
        g.selectAll('.bar-label')
            .data(dataArray)
            .enter()
            .append('text')
            .attr('class', 'bar-label')
            .attr('x', d => x(d.label) + x.bandwidth() / 2)
            .attr('y', d => y(d.value) - 5)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('fill', '#495057')
            .style('opacity', 0)
            .text(d => d.value)
            .transition()
            .delay(1000)
            .duration(500)
            .style('opacity', 1);

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .style('fill', '#495057')
            .text(title);

        // Add axis labels
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .text('Category');

        svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .text('Count');
    }

    // Create Scatter Plot
    createScatterPlot(data) {
        this.clearChart();

        const container = document.getElementById('chart');
        const width = Math.min(container.clientWidth, 900);
        const height = 600;

        const svg = d3.select('#chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const chartWidth = width - this.margin.left - this.margin.right;
        const chartHeight = height - this.margin.top - this.margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // Scales
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.magnitude) * 1.1])
            .range([0, chartWidth]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.depth) * 1.1])
            .range([chartHeight, 0]);

        // Color scale based on magnitude
        const colorScale = d3.scaleSequential()
            .domain([0, d3.max(data, d => d.magnitude)])
            .interpolator(d3.interpolateYlOrRd);

        // Add grid lines
        g.append('g')
            .attr('class', 'grid')
            .attr('opacity', 0.1)
            .call(d3.axisLeft(y)
                .tickSize(-chartWidth)
                .tickFormat(''));

        g.append('g')
            .attr('class', 'grid')
            .attr('opacity', 0.1)
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(x)
                .tickSize(-chartHeight)
                .tickFormat(''));

        // Add axes
        g.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(x));

        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y));

        // Add scatter points
        g.selectAll('.scatter-point')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'scatter-point')
            .attr('cx', d => x(d.magnitude))
            .attr('cy', d => y(d.depth))
            .attr('r', 0)
            .attr('fill', d => colorScale(d.magnitude))
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.7)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('r', 8)
                    .attr('opacity', 1);
                showTooltip(event, `Magnitude: ${d.magnitude}<br>Depth: ${d.depth} km`);
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('r', 5)
                    .attr('opacity', 0.7);
                hideTooltip();
            })
            .transition()
            .duration(1000)
            .delay((d, i) => i * 10)
            .attr('r', 5);

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .style('fill', '#495057')
            .text('Earthquake Magnitude vs Depth');

        // Add axis labels
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .text('Magnitude');

        svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .text('Depth (km)');
    }
}

// Tooltip functions
function showTooltip(event, content) {
    const tooltip = d3.select('#tooltip');
    tooltip
        .html(content)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 15) + 'px')
        .classed('visible', true);
}

function hideTooltip() {
    d3.select('#tooltip').classed('visible', false);
}

// Export for use in app.js
window.Visualizations = Visualizations;
