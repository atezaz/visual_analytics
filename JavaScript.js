 function apiFunction() {

            var apiURL = document.getElementById('apiURL').value;
            if (apiURL != "") {
                $(function () {
                    $.getJSON(apiURL, function (apiData) {
                        console.log(apiData);
                        analyzingData(apiData);
                    });
                });
            }
        }

        function analyzingData(apiData) {
            var rlenght = apiData.hits.length;
            var typeObj = {};
            for (var i = 0; i < rlenght; i++) {
                typeObj[apiData.hits[i].type] = 0; // to find number of types
            }

            var mutationCount = 0;
            for (var key in typeObj) {
                for (var i = 0; i < rlenght; i++) {
                    if (apiData.hits[i].type == key) {
                        mutationCount++;
                    }
                }
                typeObj[key] = mutationCount; //update the type mutation with adding the number of mutations
                mutationCount = 0;
            }

            var mutationObj = {};
            var filteredArr = [];
            for (var key in typeObj) {
                for (var i = 0; i < rlenght; i++) {
                    if (apiData.hits[i].type == key) {
                        mutationObj[apiData.hits[i].mutation] = key;
                    }
                }
                filteredArr.push(mutationObj);
                mutationObj = {}
            }

            var chromosomes = 0;
            var dataObj = {};
            var dataArrOobj = [];
            for (var i = 0; i < filteredArr.length; i++) {
                for (var key in filteredArr[i]) {
                    for (var j = 0; j < rlenght; j++) {
                        if (apiData.hits[j].mutation == key) {
                            if (!isNaN(apiData.hits[j].chromosome))
                                chromosomes = chromosomes + +apiData.hits[j].chromosome;
                        }
                    }
                    dataObj[filteredArr[i][key] + ":" + key] = chromosomes;

                    chromosomes = 0;
                }
                dataArrOobj.push(dataObj);
                dataObj = {};
            }



            //******************Preparing datasets to Vis*****************//

            var data = "";
            data += "[";
            for (var key in typeObj) {
                data += "{\"name\":\"" + key + "\", \"y\":" + typeObj[key] + ",\"drilldown\":\"" + key + "\"},";
            }
            data = data.slice(0, -1);
            data += "]";
            outerDataObject = JSON.parse(data);
            console.log("Prepared data for pie", outerDataObject);


            var str = "";

            str += "[";

            for (var i = 0; i < dataArrOobj.length; i++) {
                var key1 = Object.keys(dataArrOobj[i])[0];
                var head = key1.split(":");
                str += "{\"name\": \"" + head[0] + "\",  \"id\": \"" + head[0] + "\", "; //dataArrOobj[i][key] 
                str += "\"data\": [ ";
                for (var key2 in dataArrOobj[i]) {
                    var sData = key2.split(":");
                    str += "[\"" + sData[1] + "\", " + dataArrOobj[i][key2] + "],";
                }
                str = str.slice(0, -1);
                str += "]},"
            }
            str = str.slice(0, -1);
            str += "]";

            innerDataObject = JSON.parse(str);
            console.log("Filtered data", innerDataObject);

            typeOverviewPie(outerDataObject, innerDataObject);
        }

        function typeOverviewPie(outerDataObject, innerDataObject) {
            Highcharts.chart('pieChart', {
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'Overview of the Mutation Data'
                },
                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b> of total<br/>'
                },

                "series": [{
                    "name": "Mutation Data",
                    "colorByPoint": true,
                    "data": outerDataObject
                }],

                "drilldown": {
                    "series": innerDataObject
                }

            });

            // var w = 600, //width
            //     h = 600, //height
            //     r = 250, //radius
            //     color = d3.scale.category20c(); //builtin range of colors

            // data = typeData;

            // var vis = d3.select("#chartType")
            //     .append("svg:svg") //create the SVG element inside the <body>
            //     .data([data]) //associate our data with the document
            //     .attr("width", w) //set the width and height of our visualization (these will be attributes of the <svg> tag
            //     .attr("height", h)
            //     .append("svg:g") //make a group to hold our pie chart
            //     .attr("transform", "translate(" + r + "," + r + ")") //move the center of the pie chart from 0, 0 to radius, radius

            // var arc = d3.svg.arc() //this will create <path> elements for us using arc data
            //     .outerRadius(r);

            // var pie = d3.layout.pie() //this will create arc data for us given a list of values
            //     .value(function (d) {
            //         return d.value;
            //     }); //we must tell it out to access the value of each element in our data array

            // var arcs = vis.selectAll("g.slice") //this selects all <g> elements with class slice (there aren't any yet)
            //     .data(pie) //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
            //     .enter() //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            //     .append("svg:g") //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
            //     .attr("class", "slice"); //allow us to style things in the slices (like text)

            // arcs.append("svg:path")
            //     .attr("fill", function (d, i) {
            //         return color(i);
            //     }) //set the color for each slice to be chosen from the color function defined above
            //     .attr("d", arc); //this creates the actual SVG path using the associated data (pie) with the arc drawing function

            // arcs.append("svg:text") //add a label to each slice
            //     .attr("transform", function (d) { //set the label's origin to the center of the arc
            //         //we have to make sure to set these before calling arc.centroid
            //         d.innerRadius = 0;
            //         d.outerRadius = r;
            //         return "translate(" + arc.centroid(d) + ")"; //this gives us a pair of coordinates like [50, 50]
            //     })
            //     .attr("text-anchor", "middle") //center the text on it's origin
            //     .text(function (d, i) {
            //         return data[i].label;
            //     }); //get the label from our original data array
        }

        Object.size = function (object) {
            var size = 0,
                key;
            for (key in object) {
                if (object.hasOwnProperty(key)) size++;
            }
            return size;
        };