var format = d3.format(",");

    // Set tooltips
    var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Neighborhood: </strong><span class='details'>" + d.properties.GEONAME + "<br></span>" + "<strong>Rate: </strong><span class='details'>" + format(d.properties.value) +"</span>";
            })

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 760 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
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
        console.log(dataNest[0].value.year)

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


        //var current_year = d3.select("#yearDropdownButton").node().value;
        //var current_topic = d3.select("#topicDropdownButton").node().value;

        map_function('2008', 'Cigarette Smoking among Adults')
        current_topic = 'Cigarette Smoking among Adults'


        d3.select("#yearDropdownButton").on("change", function(){
          current_year = d3.select("#yearDropdownButton").node().value;
          console.log(current_year);


         /* d3.select("#topicDropdownButton").on("change", function(){
            current_topic = d3.select("#topicDropdownButton").node().value;
            })
            console.log(current_topic);*/

          map_function(current_year, current_topic)

        })

function map_function(current_year, current_topic) {

        d3.select("#legend").remove();

        console.log(current_topic)

        var dataNew = data.filter(function(d) {return d.topic == current_topic && d.year == current_year})
        console.log(dataNew)


        var dataArray = [];
        for (var d = 0; d < dataNew.length; d++) {
          dataArray.push(parseFloat(dataNew[d].number))
        }
        var minVal = d3.min(dataArray)
        var maxVal = d3.max(dataArray)
        var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])

        console.log(dataArray)

      // function that runs when yearManu changes
      // grab the value from yearmenu and console log it


      d3.json('UHF42.json', function(error, json) {
          console.log(json)
          //Merge the csv data and GeoJSON
          //Loop through once for each csv data value
          //if (error) throw error;
          for (var i = 0; i < dataNew.length; i++) {
        
            //Grab geo entity id from data csv
            var dataGeo = dataNew[i].id;
            
            //Grab data value, and convert from string to float
            var dataValue = parseFloat(dataNew[i].number);
            //Find the corresponding geo inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
            
              var jsonGeo = json.features[j].properties.GEOCODE;
        
              if (dataGeo == jsonGeo) {
            
                //Copy the data value into the JSON
                json.features[j].properties.value = dataValue;
                
                //Stop looking through the JSON
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
         
            svg1.call(tip);

            var g = svg1.append("g");
            g.append('g')
                .selectAll('path')
                .data(json.features)
                .enter()
                .append('path')
                .attr('d', path)
                .style("fill", function(d) {
                        //Get data value
                        var value = d.properties.value;
                        
                        if (value) {
                          //If value exists
                          return ramp(d.properties.value);
                        } else {
                          //If value is undefined
                          return "#ccc";
                        }
             })
              // tooltips
              .style("stroke","white")
              .style('stroke-width', 0.3)
              .on('mouseover',function(d){
                tip.show(d);

                d3.select(this)
                  .style("opacity", 1)
                  .style("stroke","white")
                  .style("stroke-width",3);
              })
              .on('mouseout', function(d){
                tip.hide(d);

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
              .attr("class", "y axis1")
              .attr("transform", "translate(25, 10)")
              .call(yAxis1)
        });
    }
    })