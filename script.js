//setup spacing size
var svg_w = 960;
var svg_h = 700;
var margin = {top: 90, right: 15, bottom: 180, left: 110};
var width = svg_w - margin.left - margin.right;
var height = svg_h - margin.top - margin.bottom;

var formatYear = d3.timeFormat("%Y");
var parseYear = d3.timeParse("%Y");

// Set the ranges
var x = d3.scaleTime().domain([parseYear("2008"), parseYear("2013")]).range([0, width]);
var y = d3.scaleLinear().range([height, 0]);


// Define the line
var valueLine = d3.line()
    .x(function(d) { return x(+d.year); })
    .y(function(d) { return y(+d.number); })



// Create the svg canvas in the "graph" div
var svg = d3.select("#graph")
        .append("svg")
        .style("width", svg_w + "px")
        .style("height", svg_h + "px")
        .attr("width", svg_w)
        .attr("height", svg_h)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "svg");

//Import the CSV data
d3.json("data.json", function(error, data) {
	if (error) {console.log(error);}

	data.forEach(function(d) {
		d.number = +d.number; 
		d.year = +d.year;
		d.geo = d.geo;
		d.topic = d.topic;
		d.geo_entity_name = d.geo_entity_name
	});

	

	var nest = d3.nest()
	    .key(function(d){
	    	return d.topic;
	    })
		.rollup(function(leaves){
            var max = d3.max(leaves, function(d){
            	return d.number
            })
            var entity = d3.nest().key(function(d){
            	return d.geo_entity_name
            })
            .entries(leaves);
            return {max:max, entity:entity};
            })
	  .entries(data)
	  console.log(nest)
	  console.log(valueLine(nest))

  	// Scale the range of the data	
	var years = data.map(function(d) {return d.year;});
	var yearScale = d3.scaleBand()
        .domain(years)
        .range([0, width]);

    //var bandwidth = yearScale.bandwidth();
        

	//y.domain([0, d3.max(data, function(d) { return d.number; })]);
	  
	// Set up the x axis
	var xaxis = svg.append("g")
	       .attr("transform", "translate(0," + height + ")")
	       .attr("class", "x axis")
	       .call(d3.axisBottom(yearScale)
	          .tickSize(0, 0)
	          .tickSizeInner(0)
	          .tickPadding(10));

	// Create 1st dropdown
    var topicMenu = d3.select("#topicDropdown")

    topicMenu
		.append("select")
		.selectAll("option")
        .data(nest)
        .enter()
        .append("option")
        .attr("value", function(d){
            return d.key;
        })
        .text(function(d){
            return d.key;
        })

    // Create 2nd dropdown
    var entityMenu = d3.select("#entityDropdown")

    entityMenu
    	.data(nest)
		.append("select")
		.selectAll("option")
        .data(function(d) { return d.value.entity; })
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

 		// Filter the data to include only fruit of interest
 		var selectTopic = nest.filter(function(d){
                return d.key == topic;
              })

	    var selectTopicGroups = svg.selectAll(".topicGroups")
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
			.data(function(d) { return d.value.entity; })
			.enter()
			.append("path")



		initialPath
			.attr("d", function(d){
				return valueLine(d.values)
			})
			.attr("class", "line")

		  // Add the Y Axis
		   var yaxis = svg.append("g")
		       .attr("class", "y axis")
		       .call(d3.axisLeft(y)
		          .ticks(5)
		          .tickSizeInner(0)
		          .tickPadding(6)
		          .tickSize(0, 0));
		  
		  // Add a label to the y axis
		  svg.append("text")
		        .attr("transform", "rotate(-90)")
		        .attr("y", 0 - 60)
		        .attr("x", 0 - (height / 2))
		        .attr("dy", "1em")
		        .style("text-anchor", "middle")
		        .text("Rate")
		        .attr("class", "y axis label");

 	}

 	// Create initial graph
 	initialGraph("Cigarette Smoking among Adults")
/*
 	// Update the data
 	var updateGraph = function(topic){

 		// Filter the data to include only topic of interest
 		var selectTopic = nest.filter(function(d){
                return d.key == topic;
              })

 		// Select all of the grouped elements and update the data
	    var selectTopicGroups = svg.selectAll(".topicGroups")
		    .data(selectTopic)
		    .each(function(d){
                y.domain([0, d.value.max])
            });

		    // Select all the lines and transition to new positions
            selectTopicGroups.selectAll("path.line")
               .data(function(d) { return d.value.entity; }, 
               		function(d){ return d.key; })
               .transition()
                  .duration(1000)
                  .attr("d", function(d){
                    return valueLine(d.values)
                  })

        // Update the Y-axis
            d3.select(".y")
                    .transition()
                    .duration(1500)
                    .call(d3.axisLeft(y)
                      .ticks(5)
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));


 	}

 	// Run update function when dropdown selection changes
 	topicMenu.on('change', function(){

 		// Find which topic was selected from the dropdown
 		var selectedTopic = d3.select(this)
            .select("select")
            .property("value")

        // Run update function with the selected topic
        updateGraph(selectedTopic)


    });


    // Change color of selected line when year dropdown changes
    entityMenu.on('change', function(){

    	// Find which year was selected
    	var selectedEntity = d3.select(this)
    		.select("select")
    		.property("value")

    	// Change the class of the matching line to "selected"
    	var selLine = svg.selectAll(".line")
              // de-select all the lines
              .classed("selected", false)
              .filter(function(d) {
                  return +d.key === +selectedEntity
              })
              // Set class to selected for matching line
              .classed("selected", true)
              .raise()
    })

*/

	console.log(data);
});


