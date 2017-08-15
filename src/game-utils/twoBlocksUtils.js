/* global window, document */

import { MINIMUM_SPINNER_SCREEN_WIDTH } from '../constants/constants';
 
const twoBlocksUtils = {

	deviceIsMotionCapable: !!(window.DeviceOrientationEvent) || !!(window.DeviceMotionEvent), 

	deviceIsSmallEnoughForMotion: (window.screen.width < MINIMUM_SPINNER_SCREEN_WIDTH),

	deviceIsIpad: /iPad/g.test(window.navigator.userAgent), 

	/*----------  Methods  ----------*/

	answerIsCorrect(randomLocation, selectedBorough) {

		return randomLocation.borough.getID() === selectedBorough.getID();

	},

	detectWebGL() {

		if (!(window.WebGLRenderingContext)) return false; 

		const testCanvas = document.createElement('canvas');

		let result; 

		if (testCanvas && ('getContext' in testCanvas)) {

			const webGlNames = [
				"webgl",
				"experimental-webgl",
				"moz-webgl",
				"webkit-3d"
			];

			// Reduce the array of webGlNames to a single boolean, 
			// which represents the result of canUseWebGl().  
			result = webGlNames.reduce((prev, curr) => {
				
				if (prev) return prev;  // If 'prev' is truthy, we can use WebGL. 
			
				const context = testCanvas.getContext(curr); 

				return (context && (context instanceof WebGLRenderingContext)); 

			}, false);  // Start with false (default) 

		}

		return result;		

	},

	loadCSS() {

		require('../../public/css/two-blocks.css');  // Use Webpack loaders to add CSS 

		if (this.shouldUseDeviceOrientation()) {

			require('../../public/css/two-blocks-mobile.css'); 

		}	

	},

	shouldUseDeviceOrientation() {
 
		const conditions = [

			this.deviceIsMotionCapable, 
			this.deviceIsSmallEnoughForMotion || this.deviceIsIpad

		]; 

		return conditions.every(condition => !!condition); 

	} 

};

export default twoBlocksUtils;
