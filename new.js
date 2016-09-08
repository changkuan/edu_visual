
function dashboard(id, fData){
    var barColor = 'steelblue';
    function segColor(c){ return {A:"#D87093", B:"#807dba",C:"#e08214",D:"#3CB371"}[c]; }
    // compute total for each state.
    fData.forEach(function(d){d.total=d.freq.A+d.freq.B+d.freq.C+d.freq.D; });
    var oriData=fData;

    // function to handle histogram.
    function histoGram(fD){
        var hG={}
        var hGmargin = {t: 60, r:-10, b: 30, l: 260};
            hGmargin.w = 1200 - hGmargin.l - hGmargin.r, 
            hGmargin.h = 300 - hGmargin.t - hGmargin.b;
 
        //create svg for histogram.
        var hGsvg = d3.select(id).append("svg")
            .attr("width", hGmargin.w + hGmargin.l + hGmargin.r)
            .attr("height", hGmargin.h + hGmargin.t + hGmargin.b)
          .append("g")
            .attr("transform", "translate(" + hGmargin.l + "," + hGmargin.t + ")");

        // create function for x-axis mapping.
        var x = d3.scale.ordinal().rangeRoundBands([0, hGmargin.w], 0.1)
                .domain(fD.map(function(d) { return d[0]; }));

        // Add x-axis to the histogram svg.
        hGsvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + hGmargin.h + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"))
            .append("text")
            .style("text-anchor", "end")
            .attr("dx", "150")
            .attr("y", "-240")
            .attr("font",6)
            .text("各縣市受教育人口(人/每千人)");  //顯示單位
            //.attr("transform", function(d) { return "rotate(-65)" });

        // Create function for y-axis map.
        var y = d3.scale.linear()
                .range([hGmargin.h, 0])
                .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = hGsvg.selectAll(".bar")
                .data(fD).enter()
                .append("g").attr("class", "bar");
        
        //create the rectangles.
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            //.attr("width", 10)
            .attr("width", x.rangeBand())
            .attr("height", function(d) { return hGmargin.h - y(d[1]); })
            .attr('fill',barColor)
            .on("mouseover",mouseover)// mouseover is defined beA.
            .on("mouseout",mouseout);// mouseout is defined beA.
            
        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "middle");
        
        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected state.
            var st = fData.filter(function(s){ return s.State == d[0];})[0]
            var nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
            // call update functions of pie-chart and legend.    
            pC.update(nD);
            leg.update(nD);
        }
        
        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.    
            pC.update(tF);
            leg.oriupdate(tF);
        }

        hG.oriupdate = function(nD, color){
            /////////
              var x2 = x.domain(fD.map(function(d) { return d[0]; }))
                .copy();
              
              var transition = hGsvg//.transition()//.duration(1500);
              
              var state2 = transition.selectAll(".State")
                .attr("x", function(d) { return x2(d[0]); });
              
              hGsvg.selectAll("g.state")
                .transition().duration(1500)
                .attr("transform", function(d) { return "translate(" +x2(d[0]) + ",0)"; });
              
              transition.select(".x.axis")
                .call(d3.svg.axis().scale(x).orient("bottom"))
                .selectAll("g");    
            //////////

            // update the domain of the y-axis map to reflect change in frequencies.
            y.domain([0, d3.max(fD, function(d) { return d[1]; })]);

            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(fD);
            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGmargin.h - y(d[1]); })
                .attr("fill", color);

            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });        
        }

        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            /////////
          var x2 = x.domain(nD.sort(this.checked
            = function(a, b) { return b[1] - a[1]; })
            .map(function(d) { return d[0]; }))
            .copy();
          
          var transition = hGsvg//.transition().duration(1500);
          
          var state2 = transition.selectAll(".State")
            .attr("x", function(d) { return x2(d[0]); });
          
          hGsvg.selectAll("g.state")
            .transition().duration(1500)
            .attr("transform", function(d) { return "translate(" +x2(d[0]) + ",0)"; });
          
          transition.select(".x.axis")
            .call(d3.svg.axis().scale(x).orient("bottom"))
            .selectAll("g");    
            //////////

            // update the domain of the y-axis map to reflect change in frequencies.
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);

            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(nD);
            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGmargin.h - y(d[1]); })
                .attr("fill", color);

            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });        
        }

        return hG;
    }
    
    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieMargin ={w:250, h: 250};
        pieMargin.r = Math.min(pieMargin.w, pieMargin.h) / 2;
                
        // create svg for pie chart.
        var piesvg = d3.select(id).append("svg").attr('class','pie')
            .attr("width", pieMargin.w).attr("height", pieMargin.h).append("g")
            .attr("transform", "translate("+pieMargin.w/2+","+pieMargin.h/2+")");
        
        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieMargin.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.freq; });

        // Draw the pie slices.
        piesvg.selectAll("path")
            .data(pie(pD)).enter().append("path")
            //.attr("transform", "translate(-500,300)")
            .attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover)
            .on("mouseout",mouseout);

        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }        
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(fData.map(function(v){ 
                return [v.State,v.freq[d.data.type]];}),segColor(d.data.type));
            tM.update(d.data.type);
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hG.oriupdate(oriData.map(function(v){
                return [v.State,v.total];}), barColor);
            tM.oriupdate(d.data.type);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t)); };
        }    
        return pC;
    }
    
    // function to handle legend.
    function legend(lD){
        var leg = {};
            
        // create table for legend.
        var legend = d3.select(id).append("table").attr('class','legend');
        
        legend.append("table").attr('class', 'title')
            //.attr("x", -5000)
            //.attr("y", 10)
            .text("受教育人口百分比")
            //.attr("transform", "translate(50,-20)")
            //.style("text-anchor","end")

        
        // create one row per segment.
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");
            
        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
			.attr("fill",function(d){ return segColor(d.type); });
            
        // create the second column for each segment.
        tr.append("td").text(function(d){
            switch(d.type)
            {
              case "A":
                return "研究所以上"
              case "B":
                return "大專院校"
              case "C":
                return "高中職"
              case "D":
                return "國中小"
              case "E":
                return "未受教育"
              default:
            }
        });

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            //.text(function(d){ return d3.format(",")(d.freq);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return oriLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.oriupdate = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return null;});

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return oriLegend(d,nD);});        
        }

        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return d3.format("人>")(d.freq);} );

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});        
        }
        
        function oriLegend(d,aD){
            return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));//20000);
        }
        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));//d3.format("%")(d.freq/1000);
        }

        return leg;
    }


    function tatmap(tD){

        var tM ={} 
        console.log(tD)
        d3.json("county.json", function(topodata) {

            var features = topojson.feature(topodata, topodata.objects["County_MOI_1041215"]).features;

            var projection = d3.geo.mercator()
                .center([123.890531, 24.278567])
                .scale(7000);

            var path = d3.geo.path()
                .projection(projection);

        //var ttMargin ={w:550, h: 250};
        //var ttsvg = d3.select("id").append("svg")
        //    .attr("width", ttMargin.w).attr("height", ttMargin.h)//.append("g")
            //.attr("transform", "translate("+ttMargin.w/2+","+ttMargin.h/2+")");

            d3.select("svg").selectAll("path").data(features)
            .enter().append("path").attr("d",path);

            console.log(tD)
            for(i=features.length-1;i>=0;i--) {
                for(j=tD.length-1;j>=0;j--) {
                    if(tD[j].State==features[i].properties.C_Name)
                    {
                        features[i].properties.TOTAL = ((tD[j].total/1000)*100).toFixed(1);
                        break;
                    }
                }
            }

            for(i=features.length-1;i>=0;i--) {
                for(j=tD.length-1;j>=0;j--) {
                    if(tD[j].State==features[i].properties.C_Name)
                    {
                        features[i].properties.A = ((tD[j].freq.A/tD[j].total)*100).toFixed(1);
                        break;
                    }
                }
            }

            for(i=features.length-1;i>=0;i--) {
                for(j=tD.length-1;j>=0;j--) {
                    if(tD[j].State==features[i].properties.C_Name)
                    {
                        features[i].properties.B = ((tD[j].freq.B/tD[j].total)*100).toFixed(1);
                        break;
                    }
                }
            }

            for(i=features.length-1;i>=0;i--) {
                for(j=tD.length-1;j>=0;j--) {
                    if(tD[j].State==features[i].properties.C_Name)
                    {
                        features[i].properties.C = ((tD[j].freq.C/tD[j].total)*100).toFixed(1);
                        break;
                    }
                }
            }

            for(i=features.length-1;i>=0;i--) {
                for(j=tD.length-1;j>=0;j--) {
                    if(tD[j].State==features[i].properties.C_Name)
                    {
                        features[i].properties.D = ((tD[j].freq.D/tD[j].total)*100).toFixed(1);
                        break;
                    }
                }
            }
            //console.log(freqData)
            //console.log(features)     
            console.log(features)
            var color = d3.scale.linear().domain([80,100]).range(["#090","#f00"]);
            d3.select("svg").selectAll("path").data(features).attr({
            d: path,
            fill: function(d) {
              return color(d.properties.TOTAL);
            }
            });

        tM.oriupdate = function(type_c){
            var color = d3.scale.linear().domain([80,100]).range(["#090","#f00"]);
            d3.select("svg").selectAll("path").data(features).attr({
            d: path,
            fill: function(d) {
              return color(d.properties.TOTAL);
            }
            });
        }

        tM.update = function(type_c){
            console.log(type_c)
            switch(type_c)
            {
              case "A":
                color = d3.scale.linear().domain([0,18]).range(["#ffb7dd","#8c0044"]);
                d3.select("svg").selectAll("path").data(features).attr({
                d: path,
                fill: function(d) { return color(d.properties.A);}
                });
                break;
              case "B":
                color = d3.scale.linear().domain([20,50]).range(["#d1bbff","#3a0088"]);
                d3.select("svg").selectAll("path").data(features).attr({
                d: path,
                fill: function(d) { return color(d.properties.B);}
                });
                break;
              case "C":
                color = d3.scale.linear().domain([24,36]).range(["#ffddaa","#bb5500"]);
                d3.select("svg").selectAll("path").data(features).attr({
                d: path,
                fill: function(d) { return color(d.properties.C);}
                });
                break;
              case "D":
                console.log("D")
                color = d3.scale.linear().domain([20,40]).range(["#99ff99","#008800"]);
                d3.select("svg").selectAll("path").data(features).attr({
                d: path,
                fill: function(d) { return color(d.properties.D);}
                });
                break;
              case "E":
                color = d3.scale.linear().domain([0,18]).range(["#090","#f00"]);
                break;
              default:
                break;
            }

        }

        });

        return tM;
    }

    // calculate total frequency by segment for all state.
    var tF = ['A','B','C','D'].map(function(d){ 
        return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))}; 
    });    
    // calculate total frequency by state for all segment.
    var sF = fData.map(function(d){return [d.State,d.total];});
    var tM = tatmap(fData),
        hG = histoGram(sF), // create the histogram.
        pC = pieChart(tF), // create the pie-chart.
        leg = legend(tF)  // create the legend.

        //console.log(hG)

}

//d3.json("twCounty2010.topo.json", function(topodata) {

    var freqData=[
    {State:'臺北市',freq:{A:95, B:396, C:217, D:141}}
    ,{State:'新北市',freq:{A:48, B:316, C:272, D:215}}
    ,{State:'桃園市',freq:{A:43, B:295, C:288, D:197}}
    ,{State:'臺中市',freq:{A:49, B:305, C:277, D:199}} 
    ,{State:'臺南市',freq:{A:47, B:289, C:262, D:249}}
    ,{State:'高雄市',freq:{A:49, B:297, C:289, D:212}}
    ,{State:'基隆市',freq:{A:37, B:287, C:314, D:225}}
    ,{State:'新竹市',freq:{A:88, B:322, C:214, D:183}}
    ,{State:'嘉義市',freq:{A:53, B:317, C:270, D:188}}
    ,{State:'宜蘭縣',freq:{A:36, B:251, C:257, D:294}}
    ,{State:'新竹縣',freq:{A:58, B:292, C:258, D:203}}
    ,{State:'苗栗縣',freq:{A:35, B:260, C:286, D:260}}
    ,{State:'彰化縣',freq:{A:34, B:253, C:263, D:268}}
    ,{State:'南投縣',freq:{A:32, B:239, C:279, D:301}}
    ,{State:'雲林縣',freq:{A:29, B:218, C:254, D:325}}
    ,{State:'嘉義縣',freq:{A:26, B:214, C:266, D:341}}
    ,{State:'屏東縣',freq:{A:30, B:236, C:311, D:271}}
    ,{State:'臺東縣',freq:{A:27, B:199, C:296, D:322}}
    ,{State:'花蓮縣',freq:{A:35, B:251, C:303, D:266}}
    ,{State:'澎湖縣',freq:{A:37, B:249, C:261, D:315}}
    ];

    dashboard('#dashboard',freqData);
/*
    var features = topojson.feature(topodata, topodata.objects["twCounty2010.geo"]).features;

    var path = d3.geo.path().projection( // 路徑產生器
    d3.geo.mercator().center([121,24]).scale(6000) // 座標變換函式
    );

    d3.select("svg").selectAll("path").data(features)
    .enter().append("path").attr("d",path);




    for(i=features.length-1;i>=0;i--) {
        for(j=freqData.length-1;j>=0;j--) {
            if(freqData[j].State==features[i].properties.name)
            {
                features[i].properties.A = ((freqData[j].freq.A/freqData[j].total)*100).toFixed(1);
                break;
            }
        }
    }

    for(i=features.length-1;i>=0;i--) {
        for(j=freqData.length-1;j>=0;j--) {
            if(freqData[j].State==features[i].properties.name)
            {
                features[i].properties.B = ((freqData[j].freq.B/freqData[j].total)*100).toFixed(1);
                break;
            }
        }
    }

    for(i=features.length-1;i>=0;i--) {
        for(j=freqData.length-1;j>=0;j--) {
            if(freqData[j].State==features[i].properties.name)
            {
                features[i].properties.C = ((freqData[j].freq.C/freqData[j].total)*100).toFixed(1);
                break;
            }
        }
    }

    for(i=features.length-1;i>=0;i--) {
        for(j=freqData.length-1;j>=0;j--) {
            if(freqData[j].State==features[i].properties.name)
            {
                features[i].properties.D = ((freqData[j].freq.D/freqData[j].total)*100).toFixed(1);
                break;
            }
        }
    }
    //console.log(freqData)
    //console.log(features)     
    console.log(features)
    var color = d3.scale.linear().domain([0,20]).range(["#090","#f00"]);
    d3.select("svg").selectAll("path").data(features).attr({
    d: path,
    fill: function(d) {
      return color(d.properties.A);
    }
    });

});
*/

//d3.csv("k_data.csv", function(error, data) {
//  if (error) throw error;


//  console.log(data)
//});


/*
var data2=[
{name:'A',value:-15}
,{name:'B',value:-20}
,{name:'C',value:-22}
,{name:'D',value:-18}
]
console.log(data2)

var margin = {top: 20, right: 30, bottom: 40, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], 0.1);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(0)
    .tickPadding(6);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data.csv", type, function(error, data) {
    console.log(data)
  x.domain(d3.extent(data, function(d) { return d.value; })).nice();
  y.domain(data.map(function(d) { return d.name; }));

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", function(d) { return "bar bar--" + (d.value < 0 ? "negative" : "positive"); })
      .attr("x", function(d) { return x(Math.min(0, d.value)); })
      .attr("y", function(d) { return y(d.name); })
      .attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
      .attr("height", y.rangeBand());

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + x(0) + ",0)")
      .call(yAxis);
});

function type(d) {
  d.value = +d.value;
  return d;
}
*/


