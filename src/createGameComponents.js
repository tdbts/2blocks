/* global google */

import createPanorama from './createPanorama'; 
import createSpinner from './createSpinner'; 
import createWebGlManager from './createWebGlManager'; 
import createChooseLocationMap from './createChooseLocationMap'; 

const createGameComponents = function createGameComponents(gameState) {

	if (!('google' in window) || !('maps' in window.google) || !('geometry' in window.google.maps)) {

		throw new Error("The Google Maps Javascript API or one of the required libraries are not loaded on the page."); 

	}

	// 'currentLat' and 'currentLng' are deprecated...
	const { locationData, mapCanvas, mapLatLng, mapMarkerVisible, panoramaCanvas } = gameState; 
	
	const webGlManager = createWebGlManager(panoramaCanvas); 
	
	const mode = webGlManager.canUseWebGl() ? "webgl" : "html5";

	/*----------  Set up panorama  ----------*/

	const panorama = createPanorama(panoramaCanvas, { 
		mode, 
		position: null, 
		visible: true
	}); 

	/*----------  Set up spinner  ----------*/
	
	const spinner = createSpinner(panorama, {
		punctuate: {
			segments: 4, 
			delay: 2000
		}
	}); 	

	spinner.on('revolution', () => window.console.log('revolution')); 
	
	/*----------  Set up chooseLocationMap  ----------*/

	const mapOptions = {
		center: mapLatLng
	}; 

	const chooseLocationMap = createChooseLocationMap(mapCanvas, mapOptions);			

	/*----------  Set up marker  ----------*/

	// Outside the polygon boundaries, in the Atlantic Ocean 
	const { lat: markerLat, lng: markerLng } = locationData.MARKER_PLACEMENT; 

	const markerOptions = {
		animation: google.maps.Animation.BOUNCE, 
		draggable: true, 
		map: chooseLocationMap, 
		position: new google.maps.LatLng(markerLat, markerLng), 
		visible: mapMarkerVisible
	}; 

	const chooseLocationMarker = new google.maps.Marker(markerOptions); 

	// Stop bouncing 
	google.maps.event.addListener(chooseLocationMarker, 'dragstart', () => chooseLocationMarker.setAnimation(null)); 

	google.maps.event.addListener(chooseLocationMap, 'click', e => {

		const { latLng } = e; 

		chooseLocationMarker.setPosition(latLng); 
		chooseLocationMarker.setAnimation(null); 

	});

	/*----------  Set up WebGl  ----------*/
	
	if (webGlManager.canUseWebGl()) {

		setTimeout(() => webGlManager.initGl(), 1000);
	
	}

	return {
		chooseLocationMap, 
		chooseLocationMarker, 
		panorama, 
		spinner
	}; 

}; 

export default createGameComponents; 
