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
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(+d.value); })

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

//lImport the CSV data
d3.json("data.json", function(error, data) {
	if (error) {console.log(error);}

	data.forEach(function(d) {
		d.value = +d.value; 
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
            	return d.value
            })
            var entity = d3.nest().key(function(d){
            	return d.geo_entity_name
            })
            .entries(leaves);
            return {max:max, entity:entity};
            })
	  .entries(data)

  	// Scale the range of the data
	
	var years = data.map(function(d) {return d.year;});
	console.log(years);
	var yearScale = d3.scaleBand()
        .domain(years)
        .range([0, width]);

    var bandwidth = yearScale.bandwidth();
        

	//y.domain([0, d3.max(data, function(d) { return d.Sales; })]);
	  
	// Set up the x axis
	var xaxis = svg.append("g")
	       .attr("transform", "translate(0," + height + ")")
	       .attr("class", "x axis")
	       .call(d3.axisBottom(yearScale)
	          .tickSize(0, 0)
	          .tickSizeInner(0)
	          .tickPadding(10));


	console.log(data);
});


