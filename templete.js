// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers / Likes to numbers 
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
  // const margin = {top: 20, right: 30, bottom: 40, left: 50}, 
  //       width = 600, 
  //       height = 400;

  
  const margin = {top: 20, right: 30, bottom: 40, left: 50},
  width = 600 - margin.left - margin.right,  // Calculate inner width
  height = 400 - margin.top - margin.bottom; // Calculate inner height


    // Create the SVG container
  const svg = d3.select("#boxplot").append("svg") 
      .attr("width", width + margin.left + margin.right)  // Total width
      .attr("height", height + margin.top + margin.bottom) // Total height
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);


    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform
    

    //Domain for x-scale: unique list of platforms  
    const xScale = d3.scaleBand()
          .domain([...new Set(data.map(d => d.Platform))])
          .range([margin.left, width - margin.right])
          .padding(0.3);
    

    // Domain for y-scale: from 0 to max Likes
    const yScale = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.Likes)])
          .range([height - margin.bottom, margin.top]);


    // Draw the x-axis 
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));


   // Draw the y-axis
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));


    // Add x-axis label
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .text("Platform");

    // Add y-axis label
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("Likes");

      // Compute boxplot statistics for each platform using a rollup function

      const rollupFunction = function(groupData) {
        const sorted = groupData.map(d => d.Likes).sort(d3.ascending);
          return {
              min: d3.min(sorted),
              q1: d3.quantile(sorted, 0.25),
              median: d3.quantile(sorted, 0.5),
              q3: d3.quantile(sorted, 0.75),
              max: d3.max(sorted)
          };
  };

    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);
    /*
    This line uses the d3.rollup function to group the data by platform and then calculate
    the summary statistics (min, q1, median, q3, max) for the 'Likes' within each group.

    It iterates over the result of the d3.rollup operation and for each platform
    like Facebook or Twitter, it provides access to the quartiles.
    */

    
      // For each platform, draw the vertical whisker, box, and median line       
        
        quantilesByGroups.forEach((quartiles, Platform) => {
          const x = xScale(Platform);
          /*
Thi get's the x-coordinate for the current platform's boxplot by using the xScale
scale, which is a band scale, to map the platform name to an x-position on the SVG.
*/
          const boxWidth = xScale.bandwidth();
          /*
 This gets the width of each band which is each platform's allocated space from the xScale and
  uses it to determine the width of the box and the positioning of elements within the box.
          */

          const center = x + boxWidth / 2;
          /*
     It calculates the horizontal center of the box and used  for drawing elements
     that should be centered within the box, such as the whiskers and median line.
          */


          
          // Draw vertical lines (whiskers) from min to max
          // Whiskers
          svg.append("line")
              .attr("x1", center)
              .attr("x2", center)
              .attr("y1", yScale(quartiles.min))
              .attr("y2", yScale(quartiles.max))
              .attr("stroke", "black");
          
          // Box -  Draw box from q3 (top) to q1 (bottom)
          svg.append("rect")
              .attr("x", x)
              .attr("y", yScale(quartiles.q3))
              .attr("width", boxWidth)
              .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
              .attr("fill", "steelblue")
              .attr("stroke", "black");

          
          // Draw median line inside the box
          svg.append("line")
              .attr("x1", x)
              .attr("x2", x + boxWidth)
              .attr("y1", yScale(quartiles.median))
              .attr("y2", yScale(quartiles.median))
              .attr("stroke", "white");
    });
});

//2 : Grouped Bar Chart for socialMediaAvg.cs
// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("SocialMediaAvg.csv");


socialMediaAvg.then(function(data) {

    // Convert string values to numbers (assume column name "AverageLikes")
    data.forEach(function(d) {
      d.AverageLikes = +d.AverageLikes;
  });
  
     // Define dimensions and margins for the SVG
    const margin = {top: 30, right: 150, bottom: 50, left: 50},
    width = 600 - margin.left - margin.right,  // Width of the actual bar chart
    height = 400 - margin.top - margin.bottom;

// Create SVG container with extra width for the legend
const svg = d3.select("#barplot")
.append("svg")
.attr("width", width + margin.left + margin.right + 150)  // Increase total width
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

 // Get unique platforms and post types
 const platforms = [...new Set(data.map(d => d.Platform))];
 const postTypes = [...new Set(data.map(d => d.PostType))];

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

     // x0 for platforms
    const x0 = d3.scaleBand()
              .domain(platforms)
              .range([0,width])
              .padding(0.2); // Padding between platform groups

    // x1 for post types within each platform
    const x1 = d3.scaleBand()
              .domain(postTypes)
              .range([0, x0.bandwidth()])
              .padding(0.05); //Padding between bars within a group

    // y for average likes
    const y = d3.scaleLinear()
              .domain([0, d3.max(data, d => d.AverageLikes)]).nice()
              .range([height,0]);
      
      // Define color scale
    const color = d3.scaleOrdinal()
    .domain(postTypes)
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);
      
      

       // Add x-axis
    svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x0));

     // Add y-axis
     svg.append("g")
    .call(d3.axisLeft(y));


    // Add x-axis label
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Platform");


    // Add y-axis label
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .text("Average Likes");

    // Group bars by platform
    const bars = svg.selectAll(".bar-group")
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("transform", d => `translate(${x0(d.Platform)}, 0)`);

// Draw bars
bars.append("rect")
.attr("x", d => x1(d.PostType)) // Inside the group
.attr("y", d => y(d.AverageLikes))
.attr("width", x1.bandwidth())
.attr("height", d => y(0) - y(d.AverageLikes))  // Correct height
.attr("fill", d => color(d.PostType));



    // Add legend (shifted to the right)
    const legend = svg.append("g")
                      .attr("transform", `translate(${width + 20}, ${margin.top})`); // Move further right
                      postTypes.forEach((type, i) => {
                        legend.append("rect")
                              .attr("x", 0)
                              .attr("y", i * 20)
                              .attr("width", 12)
                              .attr("height", 12)
                              .attr("fill", color(type));
                
                        legend.append("text")
                              .attr("x", 20)
                              .attr("y", i * 20 + 10)
                              .text(type)
                              .attr("alignment-baseline", "middle");
                    });
});

// 3. LINE CHART: socialMediaTime.csv
// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("SocialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers and parse the date
    const parseDate = d3.timeParse("%m/%d/%Y (%A)");
          data.forEach(function(d) {
          d.date = parseDate(d.Date);
          d.AverageLikes = +d.AverageLikes;
  });
    

    // Define the dimensions and margins for the SVG
    const margin = {top: 50, right: 30, bottom: 50, left: 60},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    
    // Create the SVG container
    const svg = d3.select("#lineplot")
                  .append("svg")
                  .attr("width",  width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);
    

    // Set up scales for x and y axes  
    const xScale = d3.scaleTime()
                   .domain(d3.extent(data, d => d.date))
                   .range([0, width]);

    const yScale = d3.scaleLinear()
                   .domain([0, d3.max(data, d => d.AverageLikes)]).nice()
                   .range([height, 0]);

    // Draw the axis, you can rotate the text in the x-axis here

    //.call(d3.axisBottom().scale(xScale))
    svg.append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(xScale)
     .ticks(7)
     .tickFormat(d3.timeFormat("%-m/%-d")))
     .selectAll("text")
     .attr("transform", "rotate(-25)")
     .attr("text-anchor", "end");

     // 
  svg.append("g")
     .call(d3.axisLeft().scale(yScale));

    // Add x-axis label
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Date");

    // Add y-axis label
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

    // Draw the line and path. Remember to use curveNatural.
     const line = d3.line()
                 .x(d => xScale(d.date))
                 .y(d => yScale(d.AverageLikes))
                 .curve(d3.curveNatural);

      svg.append("path")
               .datum(data)
               .attr('fill', 'none')
               .attr("stroke", "black")
               .attr("stroke-width", 3)
               .attr("d", line)

});


 