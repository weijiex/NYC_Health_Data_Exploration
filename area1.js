// Make the interacive map
// reference: https://bl.ocks.org/wboykinm/dbbe50d1023f90d4e241712395c27fb3
// reference: http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 760 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var format = d3.format(",");

// Set tooltips
var tip1 = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<strong>Neighborhood: </strong><span class='details'>" + d.properties.GEONAME + "<br></span>" + "<strong>Rate: </strong><span class='details'>" + format(d.properties.value) +"</span>";
        })

var lowColor = '#f9f9f9'
var highColor = '#bc2a66'
var svg1 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")"); 

d3.csv("data.csv", function(data) {
    data.forEach(function(d) {
        d.id = +d.id;
        d.number = +d.number;
        d.year = d.year;
    });
    
    var dataNest = d3.nest()
          .key(function(d){
            return d.topic;
          })
        .rollup(function(leaves){
                var year = d3.nest().key(function(d){
                  return d.year
                })
                .entries(leaves);
                return {year: year};
                })
        .entries(data)

    // Create 1st dropdown
    var topicMenu = d3.select("#maptopicDropdown")
    topicMenu
        .append("select")
        .attr("id","topicDropdownButton")
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
    var yearMenu = d3.select("#mapyearDropdown")
    yearMenu
        .data(dataNest)
        .append("select")
        .attr("id","yearDropdownButton")
        .selectAll("option")
        .data(function(d) { return d.value.year; })
        .enter()
        .append("option")
        .attr("value", function(d){
            return d.key;
        })
        .text(function(d){
            return d.key;
        })

    // Create initial map
    map_function('2008', 'Cigarette Smoking among Adults')

    // Update map
    d3.select("#update").on("click", function(){
     
        current_year = d3.select("#yearDropdownButton").node().value;         
        current_topic = d3.select("#topicDropdownButton").node().value;
                            
      map_function(current_year, current_topic)

    })
    

// main function
function map_function(current_year, current_topic) {

    d3.select("#legend").remove();

    // filter topic and year
    var dataNew = data.filter(function(d) {return d.topic == current_topic && d.year == current_year})
    

    var dataArray = [];
    for (var d = 0; d < dataNew.length; d++) {
      dataArray.push(parseFloat(dataNew[d].number))
    }
    var minVal = d3.min(dataArray)
    var maxVal = d3.max(dataArray)
    var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])
    
  d3.json('NYC.json', function(error, json) {
      //Merge data and GeoJSON; Loop through once each data value
      if (error) throw error;
      for (var i = 0; i < dataNew.length; i++) {

        var dataGeo = dataNew[i].id;
        var dataValue = parseFloat(dataNew[i].number);

        for (var j = 0; j < json.features.length; j++) {

          var jsonGeo = json.features[j].properties.GEOCODE;    
          if (dataGeo == jsonGeo) {
            json.features[j].properties.value = dataValue;
            break;
            
          }
        }   
      }

      //Bind data and create one path per GeoJSON feature
        var path = d3.geoPath()
                      .projection(d3.geoConicConformal()
                      .parallels([33, 45])
                      .rotate([96, -39])
                      .fitSize([width, height], json)); 
     
        svg1.call(tip1);

        var g = svg1.append("g");
        g.append('g')
            .selectAll('path')
            .data(json.features)
            .enter()
            .append('path')
            .attr('d', path)
            .style("fill", function(d) {
                    var value = d.properties.value;                   
                    if (value) {
                      //If value exists
                      return ramp(d.properties.value);
                    } else {
                      //If value is undefined
                      return "#ccc";
                    }
         })
          .style('stroke', 'white')
          .style('stroke-width', 1.5)
          .style("opacity",0.8)
          // tooltips
          .style("stroke","white")
          .style('stroke-width', 0.3)
          .on('mouseover',function(d){
            tip1.show(d);

            d3.select(this)
              .style("opacity", 1)
              .style("stroke","white")
              .style("stroke-width",3);
          })
          .on('mouseout', function(d){
            tip1.hide(d);

            d3.select(this)
              .style("opacity", 0.8)
              .style("stroke","white")
              .style("stroke-width",0.3);
    });

        // add a legend
        var w = 70, h = 200;

        var key = d3.select("#area1")
                    .append("svg")
                    .attr("id","legend")
                    .attr("width", w)
                    .attr("height", h + 15)
                    .attr("class", "legend");

        var legend = key.append("defs")
                        .append("svg:linearGradient")
                        .attr("id", "gradient")
                        .attr("x1", "100%")
                        .attr("y1", "0%")
                        .attr("x2", "100%")
                        .attr("y2", "100%")
                        .attr("spreadMethod", "pad");

        legend.append("stop")
              .attr("offset", "0%")
              .attr("stop-color", highColor)
              .attr("stop-opacity", 1);
          
        legend.append("stop")
              .attr("offset", "100%")
              .attr("stop-color", lowColor)
              .attr("stop-opacity", 1);

        key.append("rect")
            .attr("width", w - 50)
            .attr("height", h)
            .style("fill", "url(#gradient)")
            .attr("transform", "translate(0,10)");

        
        var y1 = d3.scaleLinear()
          .range([h, 0])
          .domain([minVal, maxVal]);

        var yAxis1 = d3.axisRight(y1);

        key.append("g")
          .attr("transform", "translate(25, 10)")
          .transition()
          .duration(500)
          .call(yAxis1) 
    }); 
} 
})

