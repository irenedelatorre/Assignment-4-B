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

    //nestedData[].values have to be AFTER nestedData. If it's outside the function, it won't work as nestedData is inside the dataLoaded function.
    var teaDatum = nestedData[0].values;
    var coffeeDatum = nestedData[1].values;

    nestedData.forEach(function(d){
        plot.append("path")
            .datum(coffeeDatum)
            .attr("class", "coffee-data-line data-line")
            .attr("d",lineGenerator);
        plot.append("path")
            .attr("class", "data-area coffee-data-area")
            .datum(coffeeDatum)
            .attr("d", areaGenerator);

        plot.append("g")
            .selectAll("circles")
            .data(coffeeDatum)
            .enter()
            .append("circle")
            .attr("class", "coffee-data-point data-point")
            .attr("cx", function(d){
                return scaleX(d.year);
            })
            .attr("cy", function(d){
                return scaleY(d.value);
            })
            .attr("r", 5)
            .call(attachTooltip);

    });

    nestedData.forEach(function(d){
        plot.append("path")
            .datum(teaDatum)
            .attr("class", "tea-data-line data-line")
            .attr("d",lineGenerator);

        plot.append("path")
            .attr("class", "data-area tea-data-area")
            .datum(teaDatum)
            .attr("d", areaGenerator);

        plot.append("g")
            .selectAll("circles")
            .data(teaDatum)
            .enter()
            .append("circle")
            .attr("class", " data-point tea-data-point")
            .attr("cx", function(d){
                return scaleX(d.year);
            })
            .attr("cy", function(d){
                return scaleY(d.value);
            })
            .attr("r", 5)
            .call(attachTooltip);
    });
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