/**
 * TransactionHistogram
 *
 * Object encapsulating the histogram interactions for all transactions. This
 * visualization will show a histogram of the contribution sizes for the list
 * of contributions that the render method is given.
 *
 * @constructor
 * @params {d3.selection} selector
 * @params {d3.dispatch} dispatch
 */
var TransactionHistogram = function (selector, dispatch) {
    this.dispatch = dispatch;
    this.selector = selector;

    // Viz parameters
    this.height = 450;
    this.width = 330;
    var marginBottom = 20;

    // Create histogram svg container
    this.svg = this.selector.append('svg')
        .attr('width', this.width)
        .attr('height', this.height + marginBottom)  // space needed for ticks
        .append('g');

    // Bin counts
    this.bins = [50, 200, 500, 1000, 10000, 50000, 100000, 1000000];
    this.histogramLayout = d3.layout.histogram()
      .bins([0].concat(this.bins))
      .value(function(d) {return d.amount;});

    // Initialize default color
    this.setHistogramColor(this.colorStates.DEFAULT);

    // cache for changing scale
    this.scaleCache = new Object();
};

/**
 * render(data)
 *
 * Given a data list, histogram the contribution amounts. The visualization will
 * show how many contributions were made between a set of monetary ranges defined
 * by the buckets `this.bins`.
 *
 * The data is expected in the following format:
 *     data = [
 *        {'state': 'CA', 'amount': 200},
 *        {'state': 'CA', 'amount': 10},
 *        ...
 *     ]
 *
 * @params {Array} data is an array of objects with keys 'state' and 'amount'
 */
TransactionHistogram.prototype.render = function(data) {
    // Needed to access the component in anonymous functions
    var that = this;

    // Generate the histogram data with D3
    var histogramData = this.histogramLayout(data);

    if (!this.hasScaleSet()) {
        histogramData = this.setScale(data);
    } else {
        histogramData = this.histogramLayout(data);
    }
    
    
    var barWidth = Math.floor((this.width - 10) / 9) + 1;
    var dx = - (barWidth + 1);
    var maxHeight = d3.max(histogramData, function (d) { return d.length; });   

    var heightScale = d3.scale.linear()
      .domain([0, maxHeight])
      .range([0, this.height]);
 
    function scaleTransform (d) {
        return that.height - d;
    }   
    console.log("printing histogram data");
    console.log(histogramData);

    var scaledData = histogramData.map(function (d) { return Math.round(heightScale(d.length)); });


    /** Histogram visualization setup **/
    // Select the bar groupings and bind to the histogram data
    
    console.log(">>> MESSAGE TO SELF: CHANGE scaeldDAta back to hist.x??? <<<");  
    
    var bar = this.svg.selectAll('.bar').data(scaledData, 
        function(d) { 
            maxHeight = d3.max(histogramData, function (d) { return d.length; });   
            return d;
        });

    var e = bar.enter()
     //.data(scaledData, function (d) {return d;})
     .append("g")
       .attr("class", "bar")
       .attr("transform", function (d, i) { return "translate(" + String(i * barWidth + 3) + ",0)"; });
      

     e.append("rect")
       .attr("q", 5)
       .attr("y", function (d) { return that.height - d;} )
       .attr("fill", "#ff9933")
       .attr("height", function (d) { return d;})
       .attr("width", "35px");

     e.append("text")
       .text(function (d, i) { return that.formatBinCount(histogramData[i].length);})
       .attr("dx", barWidth / 2 - 14)
       .attr("y", function (d) { return that.height - d;} )
       //.attr("dy", "0.75em")
       .attr("font-family", "sans-serif")
       .attr("font-size", "12px")
       .attr("dy", function (d) { 
         if (d > 14) { return 12 };
           return -4;
       })
       .attr("fill", function (d) { 
           console.log("in fill");
           if (d > 14) { return "white"; }
           return "grey";
       });
    

    bar.exit().remove();
    // Add a new grouping
           
    // Add a rectangle to this bar grouping

    // Add text to this bar grouping


    /** Update phase */
    // Implement


    /** Exit phase */
    // Implement

    // Draw / update the axis as well
    this.drawAxis();
};


/**
 * formatBinCount(number)
 *
 * Helper function for formatting the bin count.
 * @params {number} number
 * @return number
 */
TransactionHistogram.prototype.formatBinCount = function (number) {
    if (number < 100)
      return number;
    return d3.format('.3s')(number);
};

/*
 * Helper function for determing the position of text.
 *
 * @params {Object} a single transaction/state object
 * @return {boolean} true if the text should go below the bar
 */
TransactionHistogram.prototype.isBarLargeEnough = function (d) {
    var yCoordinate = (d.y === 0) ? 0 : this.yScale(d.y);
    return (this.height - yCoordinate) > 12;
};


/*
 * drawAxis()
 *
 * Draws the x-axis for the histogram.
 */
TransactionHistogram.prototype.drawAxis = function() {
    // Add the X axis
    var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("bottom")
        .tickFormat(d3.format('$.1s'));

    // Add ticks for xAxis (rendering the xAxis bar and labels)
    if (this.xTicks === undefined) {
      this.xTicks = this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")");
    }
    this.xTicks.transition().duration(500).call(xAxis);
};


/*
 * setScale(data)
 *
 * Sets the X and Y scales for the histogram. Based on the `data` provided.
 *
 * @params {Array} data is an array of objects with keys 'state' and 'amount'
 * @return {Array} returns histogramData so that recomputation of buckets not necesary
 */
TransactionHistogram.prototype.setScale = function (data) {
    if (this.scaleCache[String([data[0], data.length])]) {
        return this.scaleCache[String([data[0], data.length])];
    } else {
       
        var histogramData = this.histogramLayout(data);

        this.xScale = d3.scale.threshold()
          .domain(this.bins)
          .range(d3.range(0, this.width, this.width/(this.bins.length + 1)));

        // Implement: define a suitable yScale given the data

        var maxY = d3.max(data.map(function(d) { return d['amount']; }));

        this.yScale = d3.scale.linear()
          .domain([0, maxY])
          .range([0, this.height]);

        
        this.scaleCache[String([data[0], data.length])] = histogramData;
    }

    return histogramData;
};

/*
 * hasScaleSet()
 *
 * Checks if the scale has already been set.
 *
 * @return {boolean} true if the x and y scales have been already set.
 */
TransactionHistogram.prototype.hasScaleSet = function () {
    return this.xScale !== undefined && this.yScale !== undefined;
};

TransactionHistogram.prototype.colorStates = {
    'PRIMARY': 1,
    'SECONDARY': 2,
    'DEFAULT': 0
}


/*
 * setBarColor()
 *
 * Set the color mode of the bar.
 */
TransactionHistogram.prototype.setHistogramColor = function (colorState) {
    this.currentColorState = colorState;
};
