import React from 'react'; 
import TwoBlocksMap from './TwoBlocksMap'; 
import TwoBlocksPanorama from './TwoBlocksPanorama'; 
import TwoBlocksCountdown from './TwoBlocksCountdown'; 

class TwoBlocksView extends React.Component {

	getClassName() {

		return [
		
			this.props.twoBlocksClass, 
			"full-dimensions"

		].join(" "); 

	}

	render() {

		const { countdownTimeLeft, interchangeHidden, onMapMounted, mapConfig, maps, mapTwoBlocksClass, mapType, mobile, panorama, view } = this.props;		

		return (

			<div className={ this.getClassName() }>
				<TwoBlocksMap 
					blockLevelMap={ maps.block.instance }
					boroughLevelMap={ maps.borough.instance }
					cityLevelMap={ maps.city.instance }
					config={ mapConfig }
					onMapMounted={ onMapMounted }
					mapType={ mapType }
					twoBlocksClass={ mapTwoBlocksClass }
					view={ view }
				/>			
				<TwoBlocksPanorama 
					latLng={ panorama.latLng }
					onPanoramaMounted={ this.props.onPanoramaMounted } 
					panorama={ panorama.instance }
					twoBlocksClass={ this.props.panoramaTwoBlocksClass } 
					visible={ 'panorama' === this.props.view } 
				/>
				<TwoBlocksCountdown 
					interchangeHidden={ interchangeHidden }
					mobile={ mobile }
					timeLeft={ countdownTimeLeft }
				/>
			</div>

		); 
	
	}

} 

TwoBlocksView.propTypes = {
	
	blockLevelMap 			: React.PropTypes.object, 
	boroughLevelMap 		: React.PropTypes.object, 
	cityLevelMap 			: React.PropTypes.object, 
	countdownTimeLeft 		: React.PropTypes.number, 
	interchangeHidden 		: React.PropTypes.bool, 
	mapCanvasClassName 		: React.PropTypes.string, 
	mapConfig 				: React.PropTypes.object, 
	mapMarker 				: React.PropTypes.object, 
	mapMarkerVisible 		: React.PropTypes.bool, 
	mapTwoBlocksClass 		: React.PropTypes.string.isRequired, 
	mapType 				: React.PropTypes.string, 
	mobile 					: React.PropTypes.bool.isRequired, 
	onMapMounted 			: React.PropTypes.func.isRequired, 
	onPanoramaMounted 		: React.PropTypes.func.isRequired, 
	panorama 				: React.PropTypes.object, 
	panoramaTwoBlocksClass 	: React.PropTypes.string, 
	displayedLatLng 			: React.PropTypes.object,	
	twoBlocksClass 			: React.PropTypes.string.isRequired, 
	view 					: React.PropTypes.string.isRequired

}; 

export default TwoBlocksView; 
