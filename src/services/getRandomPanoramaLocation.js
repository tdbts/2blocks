import requestNearestPanorama from './random-panorama/requestNearestPanorama';  
import pointToLatLngLiteral from './random-panorama/pointToLatLngLiteral'; 
import RandomLocationGenerator from './random-location-generator/RandomLocationGenerator'; 
import getRandomLocationFromWorker from './random-panorama/getRandomLocationFromWorker'; 
import Borough from '../game-components/Borough';
import { tryAtMost } from '../utils/utils';
import { MAXIMUM_PANORAMA_REQUESTS } from '../constants/constants';  

const getRandomPanoramaLocation = function getRandomPanoramaLocation(worker, featureCollection) {

	let generator = null; 
	let randomLatLng = null; 
	let selectedBorough = null; 
	let boroughName = null; 

	if (!(worker)) {

		generator = new RandomLocationGenerator(featureCollection); 

	}

	/*----------  executeRequest()  ----------*/
	
	const executeRequest = () => tryAtMost(() => requestNearestPanorama(randomLatLng), MAXIMUM_PANORAMA_REQUESTS, (panoRequestResults, requestAttemptsLeft) => {

			window.console.warn("Request for nearest panorama exceeded maximum attempts.  Setting new random location and trying again."); 
			
			const { panoData, status } = panoRequestResults; 

			window.console.log("panoData:", panoData); 
			window.console.log("status:", status); 
			window.console.log("requestAttemptsLeft:", requestAttemptsLeft);

			if (!(worker)) {

				randomLatLng = generator.randomLatLng(); 

				return; 
				
			}

			return getRandomLocationFromWorker(worker)

				.then(locationData => (randomLatLng = locationData.latLng)); 

		})

		.then(() => window.console.log("randomLatLng:", randomLatLng))

		.then(() => (randomLatLng = (pointToLatLngLiteral(randomLatLng))))

		.then(() => ( { ...randomLatLng, borough: new Borough(boroughName) } ));

	/*----------  If worker exists, use it to get random location and then execute panorama request  ----------*/
	
	if (worker) {

		return getRandomLocationFromWorker(worker, true)

			.then(locationData => {

				randomLatLng = locationData.latLng; 
				selectedBorough = locationData.selectedBorough; 
				boroughName = locationData.boroughName; 

			}) 

			.then(() => executeRequest()); 

	/*----------  If worker does not exist, use generator to get random location, then execute panorama request  ----------*/
	
	} else {

		selectedBorough = generator.selectedBorough; 
		boroughName = selectedBorough.properties.boro_name; 
		randomLatLng = generator.randomLatLng(); 

		return executeRequest(); 	

	}

}; 

export default getRandomPanoramaLocation; 
