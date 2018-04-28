(function() {
  // Width and height are the regular pixel width and height
  var height = 600,
      width = 1000,
      // Mercator usually the default projection from 3d space to (x,y)
      // coordinates
      projection = d3.geoNaturalEarth1(),
      theworld = void 0;
      countryData = void 0;
      cityData = void 0;
      yearData = void 0;
      minYear = 1955
      maxYear = 2015

  // Special d3 helper that converts geo coordinates to paths
  // based on a projection 
  var path = d3.geoPath().projection(projection);

  // Map stuff:
  var map_svg = d3.select("#map")
      .append('svg')
      .attr("width", width)
      .attr("height", height);

  // Histogram stuff:
  var histogram_svg = d3.select("#histogram")
      .append('svg')
      .attr('width', width)
      .attr('height', height)

  let margin = {top: 25, right: 50, bottom: 25, left: 220},
      width_2 = width - margin.left - margin.right,
      height_2 = height - margin.top - margin.bottom,
      hist_g = histogram_svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

  //define scales for histogram
  let x = d3.scaleLinear().rangeRound([0, width_2]),
    y = d3.scaleBand().rangeRound([height_2, 0]).padding(0.2);

  var hoverTooltip = function(d) {
    console.log('d', d, 'event', d3.event);
    var div = document.getElementById('tooltip');
    var urban_pop=Number($("#urbanPopNum").text())*1000
    var top_pop=Number($("#topPopNum").text())
    var urban_rate=d.raw_pop/urban_pop*100
    var top_rate=d.raw_pop/top_pop*100

    // d3.event is the current event
    var relative_pos=$("#global_view").position()
    div.style.left = d3.event.offsetX +'px'; 
    div.style.top = d3.event.offsetY  + 'px'; 
    div.innerHTML = "City: "+d.city+" - "+d.country+"<BR/>Raw Pop: "+d.raw_pop+" Millions"+"<BR/>Norm Pop :"+d.norm_pop+"<BR/>Raw Pop/Urban Pop :"+urban_rate.toFixed(2)+"%<BR/>Raw Pop/Top 30 Pop :"+top_rate.toFixed(2)+"%";
  };

  var leaveTooltip = function(d) {
    $("#tooltip").html('');
    $("#tooltip").attr('style','');
  };

  var showMap = function(data) {
    //console.log('theworld', data);
    // Get the "polygon" data for all countries
    var countries = topojson.feature(data, data.objects.countries);
    //console.log('countries', countries)
    // Setup the scale and translate
    var b, s, t; // bounds, scale, translate?
    projection.scale(1).translate([0, 0]);
    // Draw a bounding box around all the shapes, points, polygons inside the object:
    var b = path.bounds(countries); 
    
    // Scale it a bit larger, to get rid of antarctica and northpole
    var s = 1.1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    
    // Need to add padding to translation
    var vpadding = 0.05
    var hpadding = -0.05
    var t = [hpadding * width + (width - s * (b[1][0] + b[0][0])) / 2, vpadding*height + (height - s * (b[1][1] + b[0][1])) / 2];
    //console.log("s:", s)
    //console.log("t:", t)
    // First we scale (it was scaled with respect to (0,0))
    // Next we translate - to center the map at the origin
    projection.scale(s).translate(t);

    // Define map:
    var map = map_svg.append('g').attr('class', 'boundary');
    // Add stuff to map:
    // we select all non-existent paths, telling d3 
    // to populate them
    // here selectAll() could have anything or empty!
    // Data join!
    theworld = map.selectAll().data(countries.features);

    var color = d3.scaleLinear().domain([0,250]).range(['pink', 'blue']);

    //Enter - theworld is our collection of paths based 
    theworld.enter()
       .append('path')
       .attr('d', path)
       .attr('fill', function(d,i){
        return color(i);
       });

    //Update - not used at the moment
    theworld.attr('fill', '#eee');

    //Exit - not used at the momeent
    theworld.exit().remove();
  };

  var updateCities = function(data, year) {    

    var cityPoints = map_svg.selectAll('circle').data(data.cities[year]);
    var cityText = map_svg.selectAll('text').data(data.cities[year]);

    //console.log(svg)
    //console.log(data.cities[year])

    cityPoints.exit().remove();

    // Enter:
    cityPoints.enter() // remember - for each data point!
      .append('circle')
      .attr('cx', function(d) {
        return projection ([d.lon, d.lat])[0]
      })
      .attr('cy', function(d) {
        return projection ([d.lon, d.lat])[1]
      })
      .attr('r', function(d) {
        return Math.sqrt(Math.floor(200*d.raw_pop)/Math.PI)
      })
      .attr('fill', '#556b2f')
      .on('mouseover', hoverTooltip);

    // Update:
    cityPoints
      .attr('cx', function(d) {
        return projection ([d.lon, d.lat])[0]
      })
      .attr('cy', function(d) {
        return projection ([d.lon, d.lat])[1]
      })
      .attr('r', function(d) {
        return Math.sqrt(Math.floor(200*d.raw_pop)/Math.PI)
      })
  };

  var updateInfoLegend = function(data, year) {
    d3.select("#legend > h1").text(year);

    currentYear = data[(year-minYear)/5]

    // How many people live in the cities?
		urbanRate = 100 * currentYear.urban_pop / currentYear.world_pop

    // Top 30 cities as proportion of all population
		top30WorldRate = currentYear.top_pop / (currentYear.world_pop*10)

    // Top 30 cities as proportion of all cities
		top30UrbanRate = currentYear.top_pop / (currentYear.urban_pop*10)

		d3.select("#worldPopNum").text(currentYear.world_pop);
		d3.select("#urbanPopNum").text(currentYear.urban_pop);
		d3.select("#topPopNum").text(currentYear.top_pop)

		d3.select("#urbanRate").text(urbanRate.toFixed(2))
		d3.select("#topRate").text(top30WorldRate.toFixed(2))
		d3.select("#topUrbanRate").text(top30UrbanRate.toFixed(2))
  };

  var showTheWorld = function(data) {
    countryData = data[0]
    cityData = data[1]
    yearData = data[1].years
    //console.log('countryData', countryData);
    //console.log('cityData', cityData);
    showMap(countryData);
    updateCities(cityData, minYear);
    updateInfoLegend(yearData, minYear);
    updateHistogram(minYear);
  };

  var slider = d3.sliderHorizontal()
    .min(minYear)
    .max(maxYear)
    .step(5)
    .width(800)
    .displayValue(false)
    .default(minYear)
    .tickFormat(d3.format(".0f"))
    .on('onchange', val => {
      updateCities(cityData, val);
      updateInfoLegend(yearData, val);
      updateHistogram(val);
    })

  d3.select("#slider").append("svg")
    .attr("width", 850)
    .attr("height", 80)
    .append("g")
    .attr("transform", "translate(30,30)")
    .call(slider);

  var yearChanger = d3.select("#changeYearBtn")
  .on('click', function(){ 
    var year = document.getElementById("inputYear").value;
    //updateCities(cityData, year);
    //updateInfoLegend(yearData, year);
    slider.value(year);
  });

  var slideNext = function() {
    var val = slider.value();
    if (val < maxYear) {
      slider.value(val+5);
    }
  };

  var slidePrev = function() {
    var val = slider.value();
    if (val > minYear) {
      slider.value(val-5);
    }
  }

  d3.select('#nextYearBtn')
    .on('click', slideNext);

  d3.select('#prevYearBtn')
    .on('click', slidePrev);

  // Global mode selection:

  d3.select('#map_button')
    .on('click', function(){
      d3.select("#map").style("display", 'block');
      d3.select("#histogram").style("display", 'none');
      d3.select("#legend").classed("left", true);
      d3.select("#legend").classed("right", false);
    });

  d3.select('#hist_button')
    .on('click', function(){
      d3.select("#map").style("display", 'none');
      d3.select("#histogram").style("display", 'block');
      d3.select("#legend").classed("left", false);
      d3.select("#legend").classed("right", true);
    });

  // Horizontal histograms:

  var updateHistogram = function(year) {

    //sort data
    cityData.cities[year].sort(function(a,b) { return a.raw_pop - b.raw_pop; });
    
    var cityBars = hist_g.selectAll('.bar').data(cityData.cities[year]);

    //define domains based on data
    x.domain([0, d3.max(cityData.cities[year], function(d) { return d.raw_pop; })]);
    y.domain(cityData.cities[year].map(function(d) { return d.city; }));

    //cleanup old stuff:
    cityBars.exit().remove();
    hist_g.selectAll(".x-axis, .y-axis").remove();

    //append x axis to svg
    hist_g.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height_2 + ")")
      .call(d3.axisBottom(x))
      .append("text")
      .attr("y", 30)
      .attr("x", 650)
      .attr("dy", "0.5em")
      .style("fill", "black")

    //append y axis to svg
    hist_g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    // ENTER: append rects to svg based on data
    cityBars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", function(d) { return y(d.city); })
      .attr("height", y.bandwidth())
      .attr("width", function(d) { return x(d.raw_pop); })
      .style("fill", "#556b2f");

    // UPDATE: update rects to svg based on data
    cityBars
      .attr("y", function(d) { return y(d.city); })
      .attr("height", y.bandwidth())
      .attr("width", function(d) { return x(d.raw_pop); })
  }

  // Define which files we need to load:
  var dataPaths = ['data/110m.json', 'data/json_final.json']
  var promises = [];

  // Load the JSON files:
  dataPaths.forEach(function(dataPath){
    promises.push(d3.json(dataPath));
  })

  // Show the map once all the jsons are loaded:
  Promise.all(promises).then(showTheWorld);
})();