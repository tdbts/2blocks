import events from './events'; 
import heardKeys from './heardKeys'; 
import keyEventMaps from './keyEventMaps';
import mapTypes from './mapTypes';  
import nycCoordinates from './nycCoordinates';
import workerMessages from './workerMessages'; 
import ALL_TYPES from './ALL_TYPES'; 
import DEFAULT_MAP_OPTIONS from './DEFAULT_MAP_OPTIONS'; 

const ANSWER_EVALUATION_DELAY 			= 6000;  // milliseconds 
const TWO_BLOCKS_BUTTON_CLASS 			= "two-blocks-button";  
const DEFAULT_MAP_ZOOM 					= 10; 
const DEFAULT_MAXIMUM_ROUNDS 			= 5;
const HOVERED_BOROUGH_FILL_COLOR  		= "#A8FFFC";
const KEY_PRESS_DEBOUNCE_TIMEOUT 		= 100; 
const MAXIMUM_PANORAMA_REQUESTS  		= 25; 
const MAXIMUM_RANDOM_PANORAMA_ATTEMPTS  = 3; 
const MILES_PER_METER  					= 0.000621371;
const MILLISECONDS_IN_A_SECOND 			= 1000;  
const MINIMUM_SPINNER_SCREEN_WIDTH 		= 720;  
const PANORAMA_LOAD_DELAY  				= 3000; 
const SELECTED_BOROUGH_FILL_COLOR 		= "#FFFFFF";
const STREETVIEW_COUNTDOWN_LENGTH 		= 15;  // Seconds 
const WINDOW_RESIZE_DEBOUNCE_TIMEOUT 	= 100;

export { 
	events, 
	heardKeys, 
	keyEventMaps, 
	mapTypes, 
	nycCoordinates, 
	workerMessages, 
	ALL_TYPES,
	ANSWER_EVALUATION_DELAY, 
	DEFAULT_MAP_OPTIONS, 
	DEFAULT_MAP_ZOOM, 
	DEFAULT_MAXIMUM_ROUNDS,
	HOVERED_BOROUGH_FILL_COLOR, 
	KEY_PRESS_DEBOUNCE_TIMEOUT,
	MAXIMUM_PANORAMA_REQUESTS, 
	MAXIMUM_RANDOM_PANORAMA_ATTEMPTS, 
	MILES_PER_METER,  
	MILLISECONDS_IN_A_SECOND, 
	MINIMUM_SPINNER_SCREEN_WIDTH, 
	PANORAMA_LOAD_DELAY, 
	SELECTED_BOROUGH_FILL_COLOR,
	STREETVIEW_COUNTDOWN_LENGTH,  
	TWO_BLOCKS_BUTTON_CLASS, 
	WINDOW_RESIZE_DEBOUNCE_TIMEOUT
}; 
