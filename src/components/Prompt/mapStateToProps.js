export default state => {

	const { app, gameplay, prompt } = state;

	const { initialized, thrownError } = app;

	const { 

		currentTurn, 
		history, 
		restarted, 
		roundsPlayed,
		stage,
		totalGamesPlayed

	} = gameplay;

	const { 

		consideredBorough, 
		randomLocation, 
		selectedBorough, 
		submitted

	} = currentTurn;

	return {

		consideredBorough,
		history,
		initialized,
		prompt,
		randomLocation,
		restarted,
		roundsPlayed,
		selectedBorough,
		stage,
		submitted,
		thrownError,
		totalGamesPlayed

	};

};
