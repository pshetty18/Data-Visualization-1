
function extractJobsPct(jobData, year, occCode, number) {
    var res = jobData.filter(
            function (d) {
                return ((year == null || d.year == year) &&
                        (occCode == null || d.occ_code == occCode));
            });
    res = res.sort(function (a, b) {
        return d3.descending(+a.jobs_1000, +b.jobs_1000);
    });
    if (number) {
        return res.slice(0, number);
    } else {
        return res;
    }
}

var barW = 500,
        barH = 300,
        barMargin = {top: 20, bottom: 120, left: 100, right: 20},
        barX = d3.scaleBand().padding(0.1),
        barY = d3.scaleLinear(),
        barXAxis = null,
        barX1 = d3.scaleBand().padding(0.1);


var commonOccValue = '15-0000';
var commonOccCode = 'occ_code';
var commonOccTitle = 'occ_title';
var commonJob = 'jobs_1000';

function createBars(divId, jobData, year, occCode) {
    var svg = d3.select(divId).append("svg")
            .attr("width", barW + barMargin.left + barMargin.right)
            .attr("height", barH + barMargin.top + barMargin.bottom)
            .append("g")
            .attr("class", "main")
            .attr("transform",
                    "translate(" + barMargin.left + "," + barMargin.top + ")")

    var csData = extractJobsPct(jobData, year, occCode, 18);

    barX.range([0, barW])
            .domain(csData.map(function (d) {
                return d.area_title;
            }));
    barY.range([barH, 0])
            .domain([0, d3.max(extractJobsPct(jobData, null, occCode),
                        function (d) {
                            return +d.jobs_1000;
                        })]);

    svg.selectAll("rect")
            .data(csData)
            .enter().append("rect")
            .style("fill", "blue")
            .attr("class", "bar")
            .attr("x", function (d) {
                return barX(d.area_title);
            })
            .attr("y", function (d) {
                return barY(+d.jobs_1000);
            })
            .attr("width", barX.bandwidth())
            .attr("height", function (d) {
                return barH - barY(+d.jobs_1000);
            });

    barXAxis = d3.axisBottom(barX);

    svg.append("g")
            .attr("transform", "translate(0," + barH + ")")
            .attr("class", "x-axis")
            .call(barXAxis)
            .selectAll("text")
            .style("text-anchor", "start")
            .attr("transform", "translate(13,10) rotate(90)");

    var barYAxis = d3.axisLeft(barY);

    svg.append("g")
            .attr("class", "y-axis")
            .call(barYAxis);

    svg.append("g")
            .attr("transform", "translate(-30," + (barH / 2) + ") rotate(-90)")
            .append("text")
            .style("text-anchor", "middle")
            .text("Jobs Per 1000");

    svg.append("text")
            .attr("x", barW / 2)
            .attr("y", barH + 115)
            .text("State");
}

function updateBars(divId, jobData, year) {

    var svg = d3.select(divId).select(".main");

    var oldData = extractJobsPct(jobData, 2012, commonOccValue, 18);
    barX.range([0, barW])
            .domain(oldData.map(function (d) {
                return d.area_title;
            }));

    var csData = extractJobsPct(jobData, year, commonOccValue, 18);
    barX1.range([0, barW])
            .domain(csData.map(function (d) {
                return d.area_title;
            }));

    barY.range([barH, 0])
            .domain([0, d3.max(extractJobsPct(jobData, null, commonOccValue),
                        function (d) {
                            return +d.jobs_1000;
                        })]);

    var selection = svg.selectAll(".bar").data(csData, function (d) {
        return(d.area_title);
    });

    var updateTran = d3.transition().duration(1000);

    selection.exit()
            .attr("opacity", 0)
            .remove();

    var EnterTrans = updateTran.transition().duration(1000);

    selection
            .attr("x", function (d) {
                return barX(d.area_title);
            })
            .transition(updateTran)
            .style("fill", "blue")
            .attr("height", function (d) {
                return barH - barY(+d.jobs_1000);
            })
            .attr("width", barX.bandwidth())
            .attr("y", function (d) {
                return barY(+d.jobs_1000);
            })
            .transition(EnterTrans)
            .attr("x", function (d) {
                return barX1(d.area_title);
            });

    selection
            .enter()
            .append("rect")
            .style("fill", "blue")
            .attr("opacity", 0)
            .attr("x", function (d) {
                return barX1(d.area_title);
            })
            .attr("y", function (d) {
                return barY(+d.jobs_1000);
            })
            .attr("width", barX.bandwidth())
            .attr("height", function (d) {
                return barH - barY(+d.jobs_1000);
            })
            .attr("opacity", 1)
            .transition(EnterTrans);

  barX1.range([0, barW])
            .domain(csData.map(function (d) {
                return d.area_title;
            }));

    svg.select(".x-axis")
            .transition(EnterTrans)
            .call(d3.axisBottom(barX1))
            .selectAll("text")
            .style("text-anchor", "start")
            .attr("transform", "translate(13,10) rotate(90)")

}

function getStateRankings(jobData, mapDataDetail, occCode) {
    var stateRank = {};
    mapDataDetail.map(function (area)
    {
        var data = jobData.filter(function (d) {
            return d.year === "2016" && d.area_title === area.properties.name;
        });
        data.sort(function (a, b) {
            return d3.descending(+a[commonJob], +b[commonJob])
        });

        var indexValue = 0;
        for (var i = 0; i < data.length; i++)
        {
            if (data[i].occ_code === occCode)
            {
                indexValue = i;
            }
        }
        stateRank[area.properties.name] = indexValue;
    });
    return stateRank;
}

function createBrushedVis(divId, usMap, tempjobData, year) {
    var jobData = tempjobData.filter(
            function (d) {
                return (+d.year === year);
            });


    var width = 600,
            height = 400;
    var occCode = "15-0000";
    var svg = d3.select(divId).append("svg")
            .attr("width", width)
            .attr("height", height);

    var projection = d3.geoAlbersUsa()
            .fitExtent([[0, 0], [width, height]], usMap);

    var path = d3.geoPath()
            .projection(projection);

    var StateRankings = getStateRankings(jobData, usMap.features, occCode);
    var color = d3.scaleSequential(d3.interpolateViridis).domain([21, 0]);

    svg.append("g")
            .selectAll("path")
            .data(usMap.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill",
                    function (d) {
                        return color(StateRankings[d.properties.name]);
                    })
            .attr("class", "state-boundary")
            .attr("name", function (d) {
                return d.properties.name;
            })
            .classed("highlight", false)
            .on("mouseover", displayLineChart);

    var bWidth = 400,
            bHeight = 400,
            midX = 200;

    var allJobs = d3.nest()
            .key(function (d) {
                return d[commonOccCode];
            })
            .key(function (d) {
                return d[commonOccTitle];
            })
            .rollup(function (v) {
                return v.reduce(function (s, d) {
                    if (!+d.tot_emp) {
                        return s;
                    }
                    return s + +d.tot_emp;
                }, 0);
            })
            .entries(jobData)
            .sort(function (a, b) {
                return d3.descending(+a.values[0].value, +b.values[0].value);
            })

    var barSvg = d3.select(divId).append("svg");
    barSvg.attr("width", bWidth)
            .attr("height", bHeight)
            .style("vertical-align", "bottom")

    var y = d3.scaleBand()
            .padding(0.1)
            .range([0, bHeight])
            .domain(allJobs.map(function (d) {
                return d.values[0].key;
            }));
    var x = d3.scaleLinear()
            .range([0, bWidth - midX])
            .domain([0, d3.max(allJobs, function (d) {
                    return d.values[0].value;
                })]);

    var bars = barSvg.selectAll(".bar")
            .data(allJobs)
            .enter()
            .append("g")
            .attr("transform",
                    function (d) {
                        return "translate(0," + y(d.values[0].key) + ")";
                    })
            .attr("class", "bar");

    function jobMouseEnter(d) {
        barSvg.selectAll("rect")
                .attr("fill", "black")
                .classed("highlight", false);
        occCode = d.key;
        StateRankings = getStateRankings(jobData, usMap.features, occCode);
        d3.select(this)
                .attr("fill", "red")
                .classed("highlight", true)
                .attr("value", d.key);

        svg.select("g")
                .selectAll("path")
                .data(usMap.features)
                .attr("fill", function (d)
                {
                    return color(StateRankings[d.properties.name])
                });
    }

    bars.append("rect")
            .attr("x", midX)
            .attr("y", 0)
            .attr("width", function (d) {
                return x(d.values[0].value);
            })
            .attr("height", y.bandwidth())
            .classed("highlight", function (d) {
                return d.key === commonOccValue;
            })
            .on("mouseover", jobMouseEnter);

    bars.append("text")
            .attr("x", midX - 4)
            .attr("y", 12)
            .style("text-anchor", "end")
            .text(function (d) {
                var label = d.values[0].key.slice(0, -12);
                if (label.length > 33) {
                    label = label.slice(0, 30) + "...";
                }
                return label;
            });


    function displayLineChart(d) {
        var name = d.properties.name;
        var data = tempjobData.filter(function (state) {
            return (state.area_title === name && state.occ_code === occCode);
        });

        var x = d3.scaleLinear()
                .rangeRound([10, 700]);

        var y = d3.scaleLinear()
                .rangeRound([450, 0]);

        x.domain(d3.extent(data, function (d) {
            return +d.year;
        }));
        y.domain(d3.extent(data, function (d) {
            return +d.tot_emp;
        }));


        var xAxis = d3.axisBottom(x)
                .ticks(3);

        var yAxis = d3.axisLeft(y)
                .ticks(9);

        d3.select("#lineChartBar")
                .select("svg")
                .remove();

        var svg = d3.select("#lineChartBar")
                .append("svg")
                .attr("height", 800)
                .attr("width", 1200)
                .append("g");

        var lineDraw = d3.line()
                .x(function (d) {
                    return (x(d.year) + 75);
                })
                .y(function (d) {
                    return (y(d.tot_emp) + 32);
                });

        svg.append("path")
                .data([data])
                .attr("stroke", "green")
                .attr("stroke-width", 3.0)
                .attr("fill", "none")
                .attr("d", lineDraw);

        svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(75,485)")
                .call(xAxis);
        svg.append("text")
                .attr("transform", "translate(" + 400 + "," + 520 + ")")
                .style("text-anchor", "middle")
                .text("No. of years");

        svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(85,30)")
                .call(yAxis);

        svg.append("text")
                .attr("x", -285)
                .attr("y", 17)
                .attr("transform", "rotate(-90)")
                .style("text-anchor", "middle;")
                .text("Total occupations");
    }

}

function processData(errors, usMap, jobsData) {
    console.log("Errors", errors)
    createBars("#bars", jobsData, 2012, "15-0000");
    setTimeout(function () {
        updateBars("#bars", jobsData, 2016)
    }, 1000);
    createBrushedVis("#brushed", usMap, jobsData, 2016);
}

d3.queue()
// use these two files
        .defer(d3.json, "http://www.cis.umassd.edu/~dkoop/dsc530-2017sp/a4/us-states.json")
        .defer(d3.csv, "http://www.cis.umassd.edu/~dkoop/dsc530-2017sp/a4/occupations.csv")
        // or these HTTPS versions
        //.defer(d3.json, "https://cdn.rawgit.com/dakoop/69d42ee809c9e7985a2ff7ac77720656/raw/6707c376cfcd68a71f59f60c3f4569277f20b7cf/us-states.json")
        //.defer(d3.csv, "https://cdn.rawgit.com/dakoop/69d42ee809c9e7985a2ff7ac77720656/raw/6707c376cfcd68a71f59f60c3f4569277f20b7cf/occupations.csv")
        .await(processData);