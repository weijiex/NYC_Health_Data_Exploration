// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


// set the ranges
var x = d3.scalePoint().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(+d.number); });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg2 = d3.select("#area2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("data.csv", function(error, data) {
  if (error) throw error;

  // format the data
  data.forEach(function(d) {
      d.year = d.year;
      d.number = +d.number;
  });

  // Scale the range of the data
  x.domain([2008, 2009, 2010, 2011, 2012, 2013]);

  // Nest the entries by symbol
  var dataNest = d3.nest()
      .key(function(d){
        return d.topic;
      })
    .rollup(function(leaves){
            var max = d3.max(leaves, function(d){
              return d.number
            })
            var geo = d3.nest().key(function(d){
              return d.geo
            })
            .entries(leaves);
            return {max:max, geo:geo};
            })
    .entries(data)

  console.log(data)

  // Add the X Axis
  svg2.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))

  // Create 1st dropdown
  var topicMenu = d3.select("#topicDropdown")

  topicMenu
  .append("select")
  .selectAll("option")
      .data(dataNest)
      .enter()
      .append("option")
      .attr("value", function(d){
          return d.key;
      })
      .text(function(d){
          return d.key;
      })

  // Create 2nd dropdown
    var geoMenu = d3.select("#geoDropdown")

    geoMenu
      .data(dataNest)
    .append("select")
    .selectAll("option")
        .data(function(d) { return d.value.geo; })
        .enter()
        .append("option")
        .attr("value", function(d){
            return d.key;
        })
        .text(function(d){
            return d.key;
        })


// Function to create the initial graph
  var initialGraph = function(topic){

    // Filter the data to include only topic of interest
    var selectTopic = dataNest.filter(function(d){
                return d.key == topic;
              })

    var selectTopicGroups = svg2.selectAll(".topicGroups")
        .data(selectTopic, function(d){
          return d ? d.key : this.key;
        })
        .enter()
        .append("g")
        .attr("class", "topicGroups")
        .each(function(d){
                y.domain([0, d.value.max])
            });

    var initialPath = selectTopicGroups.selectAll(".line")
      .data(function(d) { return d.value.geo; })
      .enter()
      .append("path")

    initialPath
      .attr("d", function(d){
        return valueline(d.values)
      })
      .attr("class", "line")

    // Add the Y Axis
    var yaxis2 = svg2.append("g")
           .attr("class", "y axis2")
           .call(d3.axisLeft(y));

    // Add a label to the y axis
    svg2.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - 45) //adjust distance from y-axis
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Percentage")
          .attr("class", "y axis label");    
    }


  // Create initial graph
  initialGraph("Cigarette Smoking among Adults")


  // Update the data
  var updateGraph = function(topic){

    // Filter the data to include only topic of interest
    var selectTopic = dataNest.filter(function(d){
                return d.key == topic;
              })

    // Select all of the grouped elements and update the data
      var selectTopicGroups = svg2.selectAll(".topicGroups")
        .data(selectTopic)
        .each(function(d){
                y.domain([0, d.value.max])
            });

        // Select all the lines and transition to new positions
            selectTopicGroups.selectAll("path.line")
               .data(function(d){
                  return (d.value.geo);
                })
                .transition()
                  .duration(1000)
                  .attr("d", function(d){
                    return valueline(d.values)
                  })

        // Update the Y-axis       
            d3.select(".y")
              .transition()
              .duration(1500)
              .call(d3.axisLeft(y));      
  }

  // Run update function when dropdown selection changes
  topicMenu.on('change', function(){

    // Find which topic was selected from the dropdown
    var selectedTopic = d3.select(this)
            .select("select")
            .property("value")

        // Run update function with the selected fruit
        updateGraph(selectedTopic)

    });

 
  // Change color of selected line when geo dropdown changes
  geoMenu.on('change', function(){

    // Find which geo entity was selected
    var selectedGeo = d3.select(this)
      .select("select")
      .property("value")

    // Change the class of the matching line to "selected"
    var selLine = svg2.selectAll(".line")
            // de-select all the lines
            .classed("selected", false)
            .filter(function(d) {
                return d.key === selectedGeo
            })
            // Set class to selected for matching line
            .classed("selected", true)
            .raise()
  })
    
});
