var utils = (function() {
	var that = {};

	that.findArray = function(array, key, value) {
		// Finds object from an array based on given key and value.

		if(!array)
			return -1;

		for(var i = 0; i < array.length; i++) {
		  if(array[i][key] == value)
		    return i;
		}

		return -1;    
	};

	return that;
}());

