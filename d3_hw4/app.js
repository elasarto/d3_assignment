var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
//and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);;

  chartGroup.append("rect")
  .attr("width", "823")
  .attr("height", "400")
  .attr("fill", "azure");
// Initial Params
var chosenXAxis = "excellentHealth"

// function used for updating x-scale var upon click on axis label
function xScale(d3Data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(d3Data, d => d[chosenXAxis]) * 0.8,
      d3.max(d3Data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width])

  return xLinearScale

};

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale)

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis)

  return xAxis
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis, textGroup) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))

  textGroup.transition()
    .duration(1000)
    .remove()


  return circlesGroup
};

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup, textGroup) {

  if (chosenXAxis == "excellentHealth") {
    var label = "Excellent Health"
  } else {
    var label = "Poor Health"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`<b>${d.state}</b><br>${label}: ${d[chosenXAxis]}%<br>No Healthcare: ${d.noHealthCare}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup
}

// Retrieve data from the CSV file and execute everything below
d3.csv("d3_data.csv", function (err, d3Data) {
  if (err) throw err;

  d3Data.forEach(function (data) {
    data.state = data.state;
    data.stateAbbr = data.stateAbbr;
    data.excellentHealth = +data.excellentHealth;
    data.veryGoodHealth = +data.veryGoodHealth;
    data.goodHealth = +data.goodHealth;
    data.fairHealth = +data.fairHealth;
    data.poorHealth = +data.poorHealth;
    data.noHealthCare = +data.noHealthCare;
    data.yesHealthCare = +data.yesHealthCare;
  });
  
  console.log(d3Data);


  // xLinearScale function above csv import
  var xLinearScale = xScale(d3Data, chosenXAxis)

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(d3Data, d => d.noHealthCare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis)

  // append y axis
  chartGroup.append("g")
    .call(leftAxis)

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(d3Data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.noHealthCare))
    .attr("r", 10)
    .attr("fill", "tomato")
    .attr("opacity", ".5")

    var textGroup = chartGroup.selectAll("text")
    .data(d3Data, function(d) { return d.stateAbbr;})
    .enter()
    .append("text")
    .text(function(d) { return d.stateAbbr;})
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.noHealthCare))
    // .attr("r", "10")
    .attr('text-anchor', 'middle')
    // .style('font-size', d => d.radius * 0.4 + 'px')
    .attr("class", "state-text")
    .attr('alignment-baseline', 'middle')
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr('fill-opacity', .95)
    .attr("fill", "grey")
    
    // textGroup.selectAll("text")
    // .on('click', function(d) {
    //   textGroup.selectAll("text")
    //   .transition()
    //   .duration(1000)
    //   .text(function(d) {return d.stateAbbr;})
    //   .attr("x", d => xLinearScale(d[chosenXAxis]))
    //   .attr("y", d => yLinearScale(d.noHealthCare))
    //   .attr('text-anchor', 'middle')
    // // .style('font-size', d => d.radius * 0.4 + 'px')
    //   .attr("class", "state-text")
    //   .attr('alignment-baseline', 'middle')
    //   .attr("font-family", "sans-serif")
    //   .attr("font-size", "11px")
    //   .attr('fill-opacity', .95)
    //   .attr("fill", "grey")
    // })

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width/2}, ${height + 20})`)

  var excellentHealthLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "excellentHealth") //value to grab for event listener
    .classed("active", true)
    .text("Excellent Health");

  var poorHealthLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "poorHealth") //value to grab for event listener
    .classed("inactive", true)
    .text("Poor Health");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -70)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("No HealthCare");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup)

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value")
      if (value != chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(d3Data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, textGroup);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis == "poorHealth") {
          poorHealthLabel
            .classed("active", true)
            .classed("inactive", false)
          excellentHealthLabel
            .classed("active", false)
            .classed("inactive", true)
        } else {
           poorHealthLabel
            .classed("active", false)
            .classed("inactive", true)
           excellentHealthLabel
            .classed("active", true)
            .classed("inactive", false)
        };
      };
    });
});
