/* global document, window */

import React from 'react';
import TwoBlocksGame from '../TwoBlocksGame'; 
import TwoBlocksView from './TwoBlocksView';
import TwoBlocksPrompt from './TwoBlocksPrompt';
import TwoBlocksSubmitter from './TwoBlocksSubmitter'; 
import TwoBlocksReplayButton from './TwoBlocksReplayButton'; 
import stylizeBoroughName from '../stylizeBoroughName';
import createPromiseTimeout from '../createPromiseTimeout';  
import { events, DEFAULT_TOTAL_ROUNDS, PANORAMA_LOAD_DELAY } from '../constants/constants'; 

class TwoBlocks extends React.Component {

	constructor(props) {

		super(props); 

		// Define initial state 
		this.state = { 
			chooseLocationMap 		: null, 
			chooseLocationMarker 	: null, 
			gameHistory 			: [], 
			gameInstance 			: null, 
			gameStage 				: null, 
			hoveredBorough 			: null, 
			locationData 			: null, 
			mapCanvas 				: null, 
			mapLatLng 				: null,
			mapMarkerVisible 		: false,  
			panorama 				: null, 
			panoramaBorough 		: null, 
			panoramaCanvas 			: null, 
			panoramaLatLng 			: null, 
			promptText 				: 'loading...',
			selectedBorough 		: null, 
			spinner 				: null, 
			view 					: 'map' 
		}; 

		/*----------  Save reference to original setState() method  ----------*/
		
		this._superSetState = this.setState.bind(this); 

		/*----------  Override setState() to be promisified  ----------*/
		
		this.setState = nextState => {

			return new Promise(resolve => {

				this._superSetState(nextState, resolve); 

			}); 

		}; 

	}

	componentDidUpdate(prevProps, prevState) {  // eslint-disable-line no-unused-vars

		// Child <TwoBlocksMap /> and <TwoBlocksPanorama /> 
		// components will call methods which update this 
		// component's state with the child components' 
		// respective DOM elements.  Once both elements 
		// exist in state, initialize TwoBlocks.  
		this.initializeTwoBlocks(); 

		this.addChooseLocationMapEventListeners(prevState); 

		this.showRandomPanorama(prevState); 

	}

	styleNonHoveredBorough(borough) {

		const { chooseLocationMap } = this.state;

		const { selectedBorough } = this.state; 

		if (selectedBorough !== borough.getProperty('boro_name')) {

			chooseLocationMap.data.revertStyle(borough); 

		}

	}

	addChooseLocationMapEventListeners(prevState) {

		const { chooseLocationMap } = this.state; 

		if (prevState.chooseLocationMap || !(chooseLocationMap)) return;
	
		chooseLocationMap.data.addListener('mouseover', event => {
			
			this.updateHoveredBorough(event.feature); 
			
			this.styleHoveredBorough(event.feature); 
		
		});

		chooseLocationMap.data.addListener('mouseout', event => {

			this.updateHoveredBorough('');

			this.styleNonHoveredBorough(event.feature); 

		}); 	

		chooseLocationMap.data.addListener('click', event => {

			this.updateSelectedBorough(event.feature); 

			this.styleUnselectedBoroughs(event.feature); 

			this.styleSelectedBorough(event.feature); 

		}); 

	}

	addGameEventListeners(twoBlocks) {

		twoBlocks.on(events.GAME_STAGE, gameStage => this.setState({ gameStage })); 

		twoBlocks.on(events.HOST_LOCATION_DATA, locationData => this.setState({ locationData })); 

		twoBlocks.on(events.VIEW_CHANGE, viewState => this.setState(viewState)); 

		twoBlocks.once(events.GAME_COMPONENTS, gameComponents => this.setState(gameComponents)); 

		twoBlocks.on(events.RANDOM_LOCATION, randomLocationDetails => {

			const { boroughName, randomLatLng } = randomLocationDetails; 

			return this.setState({ 
				panoramaBorough: boroughName,  
				panoramaLatLng: randomLatLng
			});

		}); 

		twoBlocks.on(events.CORRECT_BOROUGH, boroughName => this.onCorrectBorough(boroughName)); 

		twoBlocks.on(events.INCORRECT_BOROUGH, selectionDetails => this.onIncorrectBorough(selectionDetails)); 

		twoBlocks.on(events.TURN_COMPLETE, () => this.onTurnComplete()); 

		twoBlocks.on(events.GAME_OVER, () => this.onGameOver()); 

	}

	evaluateFinalAnswer() {

		const { gameInstance, panoramaBorough, selectedBorough } = this.state; 

		gameInstance.evaluateFinalAnswer(panoramaBorough, selectedBorough); 

	}

	initializeTwoBlocks() {

		if (this.state.gameInstance) return; 

		if (!(this.state.mapCanvas) || !(this.state.panoramaCanvas)) return; 

		const { mapCanvas, panoramaCanvas } = this.state; 

		[ mapCanvas, panoramaCanvas ].forEach(canvas => {

			if (!(canvas)) {

				throw new Error(`No element with ID '#${this.props[ mapCanvas === canvas ? "mapCanvasClassName" : "panoramaCanvasClassName" ]}' could be found on the page.`); 

			}

		}); 

		const twoBlocks = new TwoBlocksGame(mapCanvas, panoramaCanvas); 

		this.addGameEventListeners(twoBlocks); 

		twoBlocks.startGame(); 

		const nextState = {
			gameInstance: twoBlocks
		}; 

		this.setState(nextState); 

	}

	onCorrectBorough(correctBoroughName) {

		this.setState({
			promptText: `Correct!  The Street View shown was from ${stylizeBoroughName(correctBoroughName)}.`
		}); 
	
	}

	onGameOver() {

		window.console.log("GAME OVER."); 

		const { gameInstance } = this.state; 

		const totalCorrect = gameInstance.totalCorrectAnswers(); 

		return this.setState({
			promptText: `Game over.  You correctly guessed ${totalCorrect.toString()} / ${DEFAULT_TOTAL_ROUNDS.toString()} of the Street View locations.` 
		}); 

	}

	onIncorrectBorough(selectionDetails) {

		const { correctBorough, selectedBorough } = selectionDetails; 

		this.setState({
			promptText: `Sorry, ${stylizeBoroughName(selectedBorough)} is incorrect.  The Street View shown was from ${stylizeBoroughName(correctBorough)}.`
		}); 

	}

	onMapMounted(mapCanvas) {

		this.setState({ mapCanvas }); 

	}

	onPanoramaMounted(panoramaCanvas) {

		this.setState({ panoramaCanvas }); 

	}

	onSpinnerRevolution() {

		const { spinner } = this.state; 

		spinner.stop(); 

		this.setState({
			mapMarkerVisible: false,  // Set to true for location guessing  
			promptText: "In which borough was the last panorama located?", 
			view: 'map'
		}); 

	}

	onTurnComplete() {

		const { chooseLocationMap } = this.state; 

		chooseLocationMap.data.revertStyle(); 

		this.setState({

			selectedBorough: null
		
		}); 

	}

	restart() {

		return this.setState({
			gameInstance: null, 
			promptText: "Starting new game..."
		})

		.then(() => this.initializeTwoBlocks()); 

	}

	showRandomPanorama(prevState) {

		if (prevState.panoramaLatLng === this.state.panoramaLatLng) return;  // Don't show random panorama if the panoramaLatLng has not changed 

		return createPromiseTimeout(PANORAMA_LOAD_DELAY) 

			.then(() => {

				return this.setState({
					promptText: 'Look closely...which borough is this Street View from?',  
					view: 'panorama'
				}); 

			})

			.then(() => {

				const { spinner } = this.state; 

				spinner.start(); 

				spinner.once('revolution', () => this.onSpinnerRevolution()); 

			}); 		

	}

	styleHoveredBorough(borough) {
		
		const { chooseLocationMap, selectedBorough } = this.state; 

		// On hover, change the fill color of the borough, unless the 
		// borough is the selected borough. 
		if (selectedBorough !== borough.getProperty('boro_name')) {

			chooseLocationMap.data.overrideStyle(borough, {
				fillColor: "#A8FFFC"
			}); 

		}
	
	}

	styleSelectedBorough(borough) {

		const { chooseLocationMap } = this.state; 

		chooseLocationMap.data.overrideStyle(borough, {
			fillColor: "#FFFFFF"
		}); 	

	}

	styleUnselectedBoroughs(borough) {
			
		const { chooseLocationMap, locationData, selectedBorough } = this.state; 

		const clickedBoroughName = borough.getProperty('boro_name'); 

		if (selectedBorough === clickedBoroughName) return;  // Don't revert styles if the player clicks on the currently-selected borough  

		const { featureCollection } = locationData; 

		const unselectedBoroughs = featureCollection.filter(feature => feature.getProperty('boro_name') !== clickedBoroughName); 

		unselectedBoroughs.forEach(feature => chooseLocationMap.data.revertStyle(feature)); 

	}

	updateHoveredBorough(feature) {

		if (!(feature)) {

			return this.setState({
				hoveredBorough: ''
			}); 

		}

		const boroughName = feature.getProperty('boro_name'); 

		if (this.state.hoveredBorough === boroughName) return; 

		this.setState({
			hoveredBorough: boroughName
		}); 

	}

	updateSelectedBorough(feature) {

		const boroughName = feature.getProperty('boro_name'); 

		if (this.state.selectedBorough === boroughName) return; 

		this.setState({
			selectedBorough: boroughName
		}); 

	}

	/*----------  render()  ----------*/
	
	render() {

		return (
	
			<div className={ this.props.gameClassName }>
				<TwoBlocksView 
					mapCanvasClassName={ this.state.mapCanvasClassName }
					mapLatLng={ this.state.mapLatLng }
					mapMarker={ this.state.chooseLocationMarker }
					mapMarkerVisible={ this.state.mapMarkerVisible }
					onMapMounted={ this.onMapMounted.bind(this) }
					onPanoramaMounted={ this.onPanoramaMounted.bind(this) } 
					panorama={ this.state.panorama } 
					panoramaLatLng={ this.state.panoramaLatLng } 
					view={ this.state.view } 
				/>
				<TwoBlocksPrompt
					hoveredBorough={ this.state.hoveredBorough } 
					promptClassName={ this.props.promptClassName } 
					text={ this.state.promptText } 
				/>
				<TwoBlocksSubmitter 
					hoveredBorough={ this.state.hoveredBorough }
					evaluateFinalAnswer={ () => this.evaluateFinalAnswer() }
					selectedBorough={ this.state.selectedBorough }
				/>
				<TwoBlocksReplayButton 
					hidden={ this.state.gameStage !== 'postgame' }
					restart={ () => this.restart() }
				/>
			</div>
	
		); 

	}

}

TwoBlocks.propTypes = {
	gameClassName 			: React.PropTypes.string.isRequired, 	
	mapCanvasClassName 		: React.PropTypes.string.isRequired, 
	panoramaCanvasClassName : React.PropTypes.string.isRequired, 
	promptClassName 		: React.PropTypes.string.isRequired
}; 

// Assign default props to the constructor 
TwoBlocks.defaultProps = { 
	gameClassName 			: "two-blocks", 
	mapCanvasClassName 		: "two-blocks-map", 
	panoramaCanvasClassName : "two-blocks-panorama", 
	promptClassName 		: "two-blocks-prompt"
}; 

export default TwoBlocks; 
