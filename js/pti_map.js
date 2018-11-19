queue().defer(d3.json, "./data/pt.geojson" )
        .defer(d3.json,"./data/mor.geojson")
        .defer(d3.json,"./data/rent.geojson")
            .await(create_map);

var valMap = ["1998-03","1998-06","1998-09","1998-12","1999-03","1999-06","1999-09","1999-12","2000-03","2000-06","2000-09","2000-12","2001-03","2001-06","2001-09","2001-12","2002-03","2002-06",
"2002-09","2002-12","2003-03","2003-06","2003-09","2003-12","2004-03","2004-06","2004-09","2004-12","2005-03","2005-06","2005-09","2005-12","2006-03","2006-06","2006-09","2006-12","2007-03","2007-06",
"2007-09","2007-12","2008-03","2008-06","2008-09","2008-12","2009-03","2009-06","2009-09","2009-12","2010-03","2010-06","2010-09","2010-12","2011-03","2011-06","2011-09","2011-12","2012-03","2012-06",
"2012-09","2012-12","2013-03","2013-06","2013-09","2013-12","2014-03","2014-06","2014-09","2014-12","2015-03","2015-06","2015-09","2015-12","2016-03","2016-06","2016-09","2016-12","2017-03","2017-06",
"2017-09","2017-12","2018-03","2018-06"];

var mon_year = '1998-06'
var slider_year = $("#slider1").slider({
  max: valMap.length - 1, // Set "max" attribute to array length
  min: 0,
  values: [1],
  change: function(event, ui) {
    var x = $("#resolution").val(valMap[ui.values[0]]); // Fetch selected value from array               
    $(".resolution-preview").html(valMap[ui.values[0]]);
     mon_year = valMap[ui.values[0]]
    updateSubset();
  }  
});

var color_varaible = 'pt';
var color = "red";

$('input:radio[name=color]').change(function() {
        if (this.value == 'pt') {
          color_varaible = 'pt';
          color = 'red';
          updateSubset()
        }
        else if (this.value == 'mor') {
            color_varaible = 'mor';
            color = "green";
            updateSubset()
        }
        else if(this.value == 'rent'){
          color_varaible = 'rent';
          color = "yellow";
          updateSubset()
        }
});


console.log(document.querySelector('input[name="color"]:checked').value);

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

    //var width = slider_year.width() / (valMap.length - 1);
    //slider_year.after('<div class="ui-slider-legend"><p style="width:' + width + 'px;">' + valMap.join('</p><p style="width:' + width + 'px;">') +'</p></div>');

function projectPoint(x, y) {
                    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
                    this.stream.point(point.x, point.y);
      }
    

function create_map(error, pt_data,mor_data,rent_data){

  if(color_varaible == 'pt'){
    geoData = pt_data;
  }
  else if(color_varaible == 'mor'){
    geoData = mor_data;
  }
  else if(color_varaible =='rent'){
  geoData = rent_data;
}
 
  map = L.map('map1').setView([37.8, -93], 4);
  // load a tile layer
  L.tileLayer('https://api.mapbox.com/styles/v1/kuhugupta/cjo4txr7o02i12rn8pr2x1cji/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia3VodWd1cHRhIiwiYSI6ImNpcDgxYmg1YzAxN2hzem5yaXRtaDN6dWYifQ.hAIOSatYipnZ-NnqodCQFg',
    {
         attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        username: 'kuhugupta',
        id: 'cjo4txr7o02i12rn8pr2x1cji',
        tileSize: 512,
        zoomOffset: -1,
      accessToken: 'pk.eyJ1Ijoia3VodWd1cHRhIiwiYSI6ImNpcDgxYmg1YzAxN2hzem5yaXRtaDN6dWYifQ.hAIOSatYipnZ-NnqodCQFg'
      
    }).addTo(map);

    svg = d3.select(map.getPanes().overlayPane).append("svg");
    g = svg.append("g").attr("class", "leaflet-zoom-hide"); 

    svg_legend = d3.select("#legend");
            
    var transform = d3.geoTransform({
      point: projectPoint
      });

    path = d3.geoPath().projection(transform);

    updateSubset();
}

function updateSubset() { 
        function applyLatLngToLayer(d) {
            var y = d.geometry.coordinates[1]
            var x = d.geometry.coordinates[0]
            return map.latLngToLayerPoint(new L.LatLng(y, x))
          }
          var year = mon_year;
        var arr = geoData.features;

        var size_extent = d3.extent(arr,function(d){return d.properties[year]})
        console.log(size_extent)
        var sizeScale = d3.scaleSqrt()
                            .domain(size_extent)
                            .range([3,30]);

        // creating points using paths 
        var points = g.selectAll("circle")
                    .data(arr);

        var pointsEnter = points.enter().append("circle")
                                .attr("class", "points");
        //console.log(points)

        points.merge(pointsEnter)
              .attr("r", function(d) {  return sizeScale(d.properties[year]);})
              .style("fill-opacity", 0.4)
              .style("fill", color)
              .on("mouseover",function(d){
                                  var details = [];
                                  
                                    details.push("<label>Region : </label>" + d.properties['RegionName']);
                                    details.push("<label>Price To Income Ratio : </label>" + round(d.properties[year],3));
                                  
                                  
                                  d3.select("#info_box").selectAll("li").data(details).enter().append("li").html(function(d){return d;});
                                  $('#info_box li').addClass('list-group-item');
                        })
                        .on("mouseout", function(d){d3.select("#info_box").selectAll("li").remove();});

       // map.on("viewreset", update);
        //update();

        map.on("viewreset", update);
        update();
        
      
        function update() {

              var bounds = path.bounds(geoData);

              var topLeft = bounds[0],
              bottomRight = bounds[1];

              svg.attr("width", bottomRight[0] - topLeft[0])
                .attr("height", bottomRight[1] - topLeft[1])
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");

              g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
              var x = d3.selectAll('circle');
              x.attr("transform",
                      function(d) {
                          return "translate(" +
                              applyLatLngToLayer(d).x + "," +
                              applyLatLngToLayer(d).y + ")";
                      });
            }  

         
         points.exit().remove();  
    }