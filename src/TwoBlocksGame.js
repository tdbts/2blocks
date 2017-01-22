/* global window */
   
import actions from './actions/actions'; 
import { EventEmitter } from 'events'; 
import { inherits } from 'util';
import { createPromiseTimeout } from './utils/utils'; 
import { events, gameStages, nycCoordinates, ANSWER_EVALUATION_DELAY, DEFAULT_MAXIMUM_ROUNDS, MAXIMUM_RANDOM_PANORAMA_ATTEMPTS } from './constants/constants';   

const TwoBlocksGame = function TwoBlocksGame(store, worker, service) {

	this.events = events; 
	this.store = store;   
	this.worker = worker; 
	this.service = service; 
	this.locationData = {}; 

	this._geoJSONLoaded = new Promise(resolve => this.once(events.GEO_JSON_LOADED, resolve)); 

	/*=================================
	=            DEBUGGING            =
	=================================*/
	
	for (const event in this.events) {

		this.on(event, () => window.console.log("event:", event)); 

	}
	
	/*=====  End of DEBUGGING  ======*/

}; 
	
/*----------  Inherit from EventEmitter  ----------*/

inherits(TwoBlocksGame, EventEmitter); 

/*----------  Define TwoBlocksGame Prototype  ----------*/

TwoBlocksGame.prototype = Object.assign(TwoBlocksGame.prototype, {

	addEventListeners() {

		this.on(this.events.GEO_JSON_LOADED, geoJSON => this.onGeoJSONLoaded(geoJSON)); 

		this.on(this.events.GAME_STAGE, gameStage => this.onGameStage(gameStage)); 

		this.on(this.events.GUESSING_LOCATION, () => this.onGuessingLocation()); 

		this.on(this.events.ANSWER_EVALUATED, answerDetails => this.onAnswerEvaluated(answerDetails)); 

		this.on(this.events.TURN_COMPLETE, () => this.onTurnComplete()); 

		this.on(this.events.GAME_OVER, () => this.onGameOver()); 

		this.on(this.events.RESTART_GAME, () => this.restart()); 

	},

	addTurnToGameHistory() {

		const { currentTurn } = this.store.getState(); 

		this.store.dispatch({
			turn: currentTurn, 
			type: actions.SAVE_TURN
		}); 

	}, 

	evaluateFinalAnswer(correctBorough, selectedBorough) {

		const { canEvaluateAnswer } = this.store.getState(); 

		if (!(canEvaluateAnswer)) return; 

		this.store.dispatch({
			type: actions.CANNOT_EVALUATE_ANSWER  // Don't allow answer evaluation until the next turn
		}); 

		if (selectedBorough === correctBorough) {

			this.emit(this.events.CORRECT_BOROUGH, correctBorough);  
		
		} else {

			this.emit(this.events.INCORRECT_BOROUGH, { correctBorough, selectedBorough });  

		}

		const { randomLatLng } = this.store.getState().currentTurn;  

		this.emit(this.events.ANSWER_EVALUATED, { correctBorough, randomLatLng, selectedBorough }); 

	}, 

	gameOver() {

		return this.store.getState().gameOver; 
	
	},

	getGeoJSONSourceURL() {

		return Promise.resolve(nycCoordinates)

			.then(locationData => this.onCityLocationDataReceived(locationData)); 

	},

	geoJSONLoaded() {

		return this._geoJSONLoaded; 

	}, 

	getRandomPanoramaLocation(featureCollection, attemptsLeft = MAXIMUM_RANDOM_PANORAMA_ATTEMPTS) {
		
		return this.service.getRandomPanoramaLocation(featureCollection) 

			.catch(() => {

				if (attemptsLeft === 0) {

					throw new Error("Attempts to request a random Google Street View failed too many times.  Check your internet connection."); 

				}

				attemptsLeft = attemptsLeft - 1; 

				window.console.log(`Failure to request nearest panorama.  ${attemptsLeft} more attempts left.`); 

				return this.getRandomPanoramaLocation(featureCollection, attemptsLeft); 

			}) 						

			.then(randomLocationDetails => {
				
				const { randomLatLng } = randomLocationDetails; 

				window.console.log("randomLatLng:", randomLatLng); 

				return randomLocationDetails; 

			}); 

	}, 

	loadFirstGame() {

		this.store.dispatch({
			type: actions.SET_GAME_STAGE, 
			stage: gameStages.PREGAME 
		}); 

		this.emit(this.events.GAME_STAGE, gameStages.PREGAME); 

		this.addEventListeners(); 

		this.store.dispatch({
			type: actions.START_GAME
		}); 

		return this.readyForGameplay()

			.then(() => this.startGamePlay()); 		

	}, 

	loadGame() {

		let loadProcess = null; 

		const { hasStarted } = this.store.getState(); 

		if (hasStarted) {

			loadProcess = this.loadNewGame(); 

		} else {

			loadProcess = this.loadFirstGame(); 

		}

		return loadProcess; 

	}, 

	loadNewGame() {

		this.store.dispatch({
			type: actions.RESTART_GAME
		}); 

		return this.startGamePlay(); 

	}, 

	loadPanorama() {

		const { featureCollection } = this.locationData;  

		this.store.dispatch({
			type: actions.NEXT_TURN, 
			turn: {
				boroughName: null, 
				randomLatLng: null, 
				selectedBorough: null
			}
		}); 

		this.store.dispatch({
			stage: gameStages.POSTGAME, 
			type: actions.SET_GAME_STAGE
		}); 

		return this.getRandomPanoramaLocation(featureCollection) 

			.then(locationData => {  // boroughName, randomLatLng

				this.store.dispatch({
					type: actions.SET_TURN_LOCATION_DATA, 
					turn: {
						...locationData, 
						selectedBorough: null
					}
				}); 

				return locationData; 

			});

	}, 

	maximumRoundsPlayed() {

		const { totalRounds } = this.store.getState(); 

		return totalRounds === DEFAULT_MAXIMUM_ROUNDS; 

	}, 

	nextTurn() {

		this.emit(this.events.NEXT_TURN); 

		return this.loadPanorama()

			.then(() => this.showPanorama());  

	}, 

	onAnswerEvaluated(answerDetails) {

		window.console.log("answerDetails:", answerDetails); 

		const { selectedBorough } = answerDetails; 

		this.store.dispatch({
			selectedBorough, 
			type: actions.BOROUGH_SELECTED
		}); 

		createPromiseTimeout(ANSWER_EVALUATION_DELAY) 

			.then(() => this.emit(this.events.TURN_COMPLETE));

	}, 

	onCityLocationDataReceived(locationData) {

		window.console.log("locationData:", locationData); 

		this.locationData = locationData; 
		
		this.emit(this.events.HOST_LOCATION_DATA, locationData); 

	}, 

	onGameOver() {

		this.store.dispatch({
			stage: gameStages.POSTGAME, 
			type: actions.SET_GAME_STAGE
		}); 

		this.emit(this.events.GAME_STAGE, gameStages.POSTGAME); 
	
	}, 

	onGameStage() {


	}, 

	onGeoJSONLoaded(geoJSON) {

		if (!(this.worker)) {

			this.locationData.featureCollection = geoJSON; 

		}

	}, 

	onGuessingLocation() {

		this.store.dispatch({
			type: actions.CAN_EVALUATE_ANSWER
		}); 

	}, 

	onTurnComplete() {
		
		this.store.dispatch({
			type: actions.INCREMENT_TOTAL_ROUNDS
		}); 

		this.addTurnToGameHistory();

		this.store.dispatch({
			type: actions.CLEAR_CURRENT_TURN
		}); 

		if (this.maximumRoundsPlayed()) {

			this.store.dispatch({
				type: actions.GAME_OVER
			}); 

			this.emit(this.events.GAME_OVER); 

		} else {

			this.nextTurn(); 

		}

	}, 

	readyForGameplay() {

		const viewReady = new Promise(resolve => {

			this.on(this.events.VIEW_READY, resolve); 

		}); 

		const prerequisites = [

			this.geoJSONLoaded(),  
			viewReady
		
		]; 

		return Promise.all(prerequisites); 

	}, 

	restart() {

		return this.start(); 

	}, 

	showPanorama() {

		this.emit(this.events.RANDOM_LOCATION); 

	}, 

	start() {

		return this.loadGame(); 

	}, 

	startGamePlay() {

		this.nextTurn(); 

	}, 

	totalCorrectAnswers() {

		const { gameHistory } = this.store.getState(); 

		return gameHistory.filter(turnHistory => turnHistory.selectedBorough === turnHistory.boroughName).length; 

	} 	

}); 

export default TwoBlocksGame; 
