/* global google, window */

const requestNearestPanorama = function requestNearestPanorama(randomLatLng) {

	return new Promise((resolve, reject) => {

		const streetViewService = new google.maps.StreetViewService(); 

		const locationRequest = {
			location: randomLatLng, 
			preference: google.maps.StreetViewPreference.NEAREST
		}; 

		streetViewService.getPanorama(locationRequest, (panoData, status) => {
			
			window.console.log("panoData:", panoData); 
			window.console.log("status:", status); 

			if ('OK' === status) {

				resolve({ panoData, status });

			} else {

				reject({ panoData, status }); 
			
			} 
		
		});  
	
	}); 

};

export default requestNearestPanorama; 