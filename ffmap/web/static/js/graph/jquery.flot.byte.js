(function ($) {
	"use strict";

	var options = {};

	//Round to nearby lower multiple of base
	function floorInBase(n, base) {
		return base * Math.floor(n / base);
	}

	function init(plot) {
		plot.hooks.processDatapoints.push(function (plot) {
			$.each(plot.getAxes(), function(axisName, axis) {
				var opts = axis.options;
				if (opts.mode === "byte" || opts.mode === "byteRate") {
					axis.tickGenerator = function (axis) {
						var returnTicks = [],
							tickSize = 2,
							delta = axis.delta,
							steps = 0,
							tickMin = 0,
							tickVal,
							tickCount = 0;

						//Set the reference for the formatter
						if (opts.mode === "byteRate") {
							axis.rate = true;
						}

						//Enforce maximum tick Decimals
						if (typeof opts.tickDecimals === "number") {
							axis.tickDecimals = opts.tickDecimals;
						} else {
							axis.tickDecimals = 2;
						}

						//Count the steps
						while (Math.abs(delta) >= 1024) {
							steps++;
							delta /= 1024;
						}

						//Set the tick size relative to the remaining delta
						while (tickSize <= 1024) {
							if (delta <= tickSize) {
								break;
							}
							tickSize *= 2;
						}

						//Tell flot the tickSize we've calculated
						if (typeof opts.minTickSize !== "undefined" && tickSize < opts.minTickSize) {
							axis.tickSize = opts.minTickSize;
						} else {
							axis.tickSize = tickSize * Math.pow(1024,steps);
						}

						//Calculate the new ticks
						tickMin = floorInBase(axis.min, axis.tickSize);
						do {
							tickVal = tickMin + (tickCount++) * axis.tickSize;
							returnTicks.push(tickVal);
						} while (tickVal < axis.max);

						return returnTicks;
					};

					axis.tickFormatter = function(size, axis) {
						var ext, steps = 0;

						while (Math.abs(size) >= 1024) {
							steps++;
							size /= 1024;
						}


						switch (steps) {
							case 0: ext = " B";  break;
							case 1: ext = " KiB"; break;
							case 2: ext = " MiB"; break;
							case 3: ext = " GiB"; break;
							case 4: ext = " TiB"; break;
							case 5: ext = " PiB"; break;
							case 6: ext = " EiB"; break;
							case 7: ext = " ZiB"; break;
							case 8: ext = " YiB"; break;
						}


						if (typeof axis.rate !== "undefined") {
							ext += "/s";
						}

						return (size.toFixed(axis.tickDecimals) + ext);
					};
				}
				else if (opts.mode === "bit" || opts.mode === "bitRate") {
					axis.tickGenerator = function (axis) {
						var returnTicks = [],
							tickSize = 2,
							delta = axis.delta,
							steps = 0,
							tickMin = 0,
							tickVal,
							tickCount = 0;

						//Set the reference for the formatter
						if (opts.mode === "bitRate") {
							axis.rate = true;
						}

						//Enforce maximum tick Decimals
						if (typeof opts.tickDecimals === "number") {
							axis.tickDecimals = opts.tickDecimals;
						} else {
							axis.tickDecimals = 0;
						}

						//Count the steps
						while (Math.abs(delta) >= 1000) {
							steps++;
							delta /= 1000;
						}

						//Set the tick size relative to the remaining delta
						while (tickSize <= 1000) {
							if (delta <= tickSize) {
								break;
							}
							tickSize *= 2;
						}

						//Tell flot the tickSize we've calculated
						if (typeof opts.minTickSize !== "undefined" && tickSize < opts.minTickSize) {
							axis.tickSize = opts.minTickSize;
						} else {
							axis.tickSize = tickSize * Math.pow(1000,steps);
						}

						//Calculate the new ticks
						tickMin = floorInBase(axis.min, axis.tickSize);
						do {
							tickVal = tickMin + (tickCount++) * axis.tickSize;
							returnTicks.push(tickVal);
						} while (tickVal < axis.max);

						return returnTicks;
					};

					axis.tickFormatter = function(size, axis) {
						var ext, steps = 0;

						while (Math.abs(size) >= 1000) {
							steps++;
							size /= 1000;
						}


						switch (steps) {
							case 0: ext = " b";  break;
							case 1: ext = " kb"; break;
							case 2: ext = " Mb"; break;
							case 3: ext = " Gb"; break;
							case 4: ext = " Tb"; break;
							case 5: ext = " Pb"; break;
							case 6: ext = " Eb"; break;
							case 7: ext = " Zb"; break;
							case 8: ext = " Yb"; break;
						}


						if (typeof axis.rate !== "undefined") {
							ext += "/s";
						}

						return (size.toFixed(axis.tickDecimals) + ext);
					};
				}
			});
		});
	}

	$.plot.plugins.push({
		init: init,
		options: options,
		name: "byte",
		version: "0.1"
	});
})(jQuery);