(function() {
  // Width and height are the regular pixel width and height
  var height = 600,
      width = 1000,
      // Mercator usually the default projection from 3d space to (x,y)
      // coordinates
      projection = d3.geoNaturalEarth1(),
      theworld = void 0;

  // Special d3 helper that converts geo coordinates to paths
  // based on a projection 
  var path = d3.geoPath().projection(projection);

  var svg = d3.select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

  var hoverTooltip = function(d) {
    console.log('d', d, 'event', d3.event);
    var div = document.getElementById('tooltip');
    // d3.event is the current event
    div.style.left = d3.event.pageX +'px'; 
    div.style.top = d3.event.pageY + 'px';
    div.innerHTML = d.name;
  };
  // TODO:
  // Draw a legend box
  // Convert on load things to more elegant function

  d3.json('data/110m.json').then(function(data) {

    console.log('theworld', data);
    // Get the "polygon" data for all countries
    var countries = topojson.feature(data, data.objects.countries);
    console.log('countries', countries)
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
    console.log("s:", s)
    console.log("t:", t)
    // First we scale (it was scaled with respect to (0,0))
    // Next we translate - to center the map at the origin
    projection.scale(s).translate(t);

    // Define map:
    var map = svg.append('g').attr('class', 'boundary');
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
    d3.csv('data/cities_1950.csv').then(function(cities){
      var cityPoints = svg.selectAll('circle').data(cities);
      var cityText = svg.selectAll('text').data(cities);

      console.log(cities)

      cityPoints.enter() // remember - for each data point!
        .append('circle')
        .attr('cx', function(d) {
          return projection ([d.lon, d.lat])[0]
        })
        .attr('cy', function(d) {
          return projection ([d.lon, d.lat])[1]
        })
        .attr('r', function(d) {
          return Math.sqrt(Math.floor(200*d.pop)/Math.PI)
        })
        .attr('fill', 'red')
        .on('mouseover', hoverTooltip);

      cityText.enter()
        .append('text')
        .attr('x', function(d) {
          return projection ([d.lon, d.lat])[0]
        })
        .attr('y', function(d) {
          return projection ([d.lon, d.lat])[1]
        })
        .attr('dx', 5)
        .attr('dy', 3)
        //.text(function(d) {return d.name});
    });


  });

  var updateMap = function(year) {
    // Load the data for the year year
    return 0
  }

  var yearChanger = d3.select("#changeYearBtn")
    .on('click', function(){ alert('foo'); });
})();