console.log("Assignment 4-B");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('plot').clientWidth - margin.r - margin.l,
    height = document.getElementById('plot').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var plot = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

var lineGenerator = d3.svg.line()
        .x(function (d){return scaleX(d.year)})
        .y(function (d){return scaleY(d.value)})
    ;

var areaGenerator = d3.svg.area()
    .x(function(d) {return scaleX(d.year)})
    .y0(height)
    .y1(function(d) {return scaleY(d.value)});


//Scales
var scaleX = d3.scale.linear().domain([1960,2015]).range([0,width]),
    scaleY = d3.scale.linear().domain([0,11000000]).range([height,0]);

//Axis
var axisX = d3.svg.axis()
    .orient('bottom')
    .scale(scaleX)
    .tickFormat( d3.format('d') ); //https://github.com/mbostock/d3/wiki/Formatting
var axisY = d3.svg.axis()
    .orient('right')
    .tickSize(width)
    .scale(scaleY);


//Draw axes
plot.append('g').attr('class','axis axis-x')
    .attr('transform','translate(0,'+height+')')
    .call(axisX);
plot.append('g').attr('class','axis axis-y')
    .call(axisY);

//Start importing data
queue()
    .defer(d3.csv,"/data/fao_combined_world_1963_2013.csv",parse)
    .defer(d3.csv,"/data/metadata.csv",parseMetadata)
    .await(dataLoaded);

function parse(d){
    return {
        item: d.ItemName,
        year: +d.Year,
        value: +d.Value
    };
}

function parseMetadata (d) {

}



function dataLoaded(error,data,metadata){
    console.log(data);
    var nestedData = d3.nest()
        .key(function(d){
            return d.item
        })
        .entries(data);
    console.log(nestedData);

    var graphs = plot.selectAll('.graph')
        .data(nestedData)
        .enter()
        .append('g')
        .attr('class','graph');

    graphs
        .append('path')
        .attr('d', function(d){
            return areaGenerator(d.values);
        })
        .attr("class", function (d){
            if (d.key=="Coffee, green"){
                return ("data-area coffee-data-area")
            }if (d.key=="Tea"){
                return ("data-area tea-data-area")
            }
        });

    graphs
        .append('path')
        .attr('d', function(d){
            return lineGenerator(d.values);
        })
        .attr("class", function (d){
            if (d.key=="Coffee, green"){
                return ("coffee-data-line data-line")
            }if (d.key=="Tea"){
                return ("tea-data-line data-line")
            }
        });

    graphs
        .selectAll("circle")
        .data(function(d){ return d.values})
        .enter()
        .append("circle")
        .attr("class", function (d){
            if (d.item=="Coffee, green"){
                return ("coffee-data-point data-point ")}
            if (d.item=="Tea"){
                return (" tea-data-point data-point")}
            //cannot make tea data points appear first (tooltip doesn't appear)
        })
        .attr("cx", function(d){
            return scaleX(d.year);
        })
        .attr("cy", function(d){
            return scaleY(d.value);
        })
        .attr("r", 5)
        .call(attachTooltip);
}

function attachTooltip(selection){
    selection
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip
                .transition()
                .style('opacity',1);

            tooltip.select('#type').html(d.item);
            tooltip.select('#year').html(d.year);
            tooltip.select('#value').html(d.value);
        })
        .on('mousemove',function(){
            var xy = d3.mouse(canvas.node());
            console.log(xy);

            var tooltip = d3.select('.custom-tooltip');

            tooltip
                .style('left',xy[0]+50+'px')
                .style('top',(xy[1]+50)+'px');

        })
        .on('mouseleave',function(){
            var tooltip = d3.select('.custom-tooltip')
                .transition()
                .style('opacity',0);
        })
}