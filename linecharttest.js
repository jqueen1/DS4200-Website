// Load the data
const socialMediaTime = d3.csv("SocialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Correct date parser for "M/D/YYYY (Weekday)"
    const parseDate = d3.timeParse("%m/%d/%Y (%A)");

    // Convert strings to numbers and parse dates
    data.forEach(function(d) {
        d.date = parseDate(d.Date);  // Use correct column name
        d.AverageLikes = +d.AverageLikes;
    });

    // Define dimensions and margins
    const margin = {top: 50, right: 30, bottom: 50, left: 60},
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("#lineplot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3.scaleTime()
                   .domain(d3.extent(data, d => d.date))
                   .range([0, width]);

    const yScale = d3.scaleLinear()
                   .domain([0, d3.max(data, d => d.AverageLikes)]).nice()
                   .range([height, 0]);

    // Add gridlines
    const makeYGridlines = () => d3.axisLeft(yScale).ticks(5);
    
    svg.append("g")
       .attr("class", "grid")
       .call(makeYGridlines()
       .tickSize(-width)
       .tickFormat(""))
       .style("stroke-dasharray", "3,3")  // Dashed gridlines
       .style("stroke", "#ddd");

    // Draw x-axis
    svg.append("g")
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(xScale)
       .ticks(7)
       .tickFormat(d3.timeFormat("%-m/%-d")))
       .selectAll("text")
       .attr("transform", "rotate(-25)")
       .style("text-anchor", "end");

    // Draw y-axis
    svg.append("g")
       .call(d3.axisLeft(yScale));

    // Add x-axis label (moved below chart)
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height + 40)  
       .attr("text-anchor", "middle")
       .style("font-size", "14px")
       .style("font-weight", "bold")
       .text("Date");

    // Add y-axis label (moved to left)
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -height / 2)
       .attr("y", -50)  
       .attr("text-anchor", "middle")
       .style("font-size", "14px")
       .style("font-weight", "bold")
       .text("Average Likes");

    // Add chart title
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", -20)  
       .attr("text-anchor", "middle")
       .style("font-size", "18px")
       .style("font-weight", "bold")
       .text("Average Likes Over Time");

    // Draw the line with curveNatural
    const line = d3.line()
                   .x(d => xScale(d.date))
                   .y(d => yScale(d.AverageLikes))
                   .curve(d3.curveNatural);

    svg.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", "#007bff")
       .attr("stroke-width", 3)
       .attr("d", line)
       .style("filter", "drop-shadow(2px 2px 2px rgba(0,0,0,0.2))"); // Adds a shadow effect

    // Add circles at each data point
    svg.selectAll(".dot")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", d => xScale(d.date))
       .attr("cy", d => yScale(d.AverageLikes))
       .attr("r", 5)
       .attr("fill", "#ff4500")
       .attr("stroke", "white")
       .attr("stroke-width", 2);
});
