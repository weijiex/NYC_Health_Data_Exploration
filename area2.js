// Make the interactive line chart
// reference: https://bl.ocks.org/ProQuestionAsker/b8f8c2ab12c4f21e882aeb68728216c2

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scalePoint().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(+d.number); });

var svg2 = d3.select("#area2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
      d.year = d.year;
      d.number = +d.number;
  });


  x.domain([2008, 2009, 2010, 2011, 2012, 2013]);

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
    var yaxis = svg2.append("g")
           .attr("class", "y axis")
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

    var selectTopic = dataNest.filter(function(d){
                return d.key == topic;
              })

      var selectTopicGroups = svg2.selectAll(".topicGroups")
        .data(selectTopic)
        .each(function(d){
                y.domain([0, d.value.max])
            });

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


  topicMenu.on('change', function(){

    var selectedTopic = d3.select(this)
            .select("select")
            .property("value")

        updateGraph(selectedTopic)

    });

 
  geoMenu.on('change', function(){

    var selectedGeo = d3.select(this)
      .select("select")
      .property("value")

    var selLine = svg2.selectAll(".line")
            .classed("selected", false)
            .filter(function(d) {
                return d.key === selectedGeo
            })
            .classed("selected", true)
            .raise()
  })
    
});


