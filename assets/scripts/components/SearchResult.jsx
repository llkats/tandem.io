var React = require('react');
var cx = require('classnames');

var secondsToTime = require('../utils/secondsToTime.js');

var SearchResult = React.createClass({
	render: function(){
		var result = this.props.result;
		var thumbnail_classes_object = {
			image: true
		};
		thumbnail_classes_object[result.source] = true;
		var thumbnail_classes = cx( thumbnail_classes_object );
		var thumbnail_style = {
			'background-image': 'url('+ result.image +')'
		};
		return (
			<li>
				<span className={thumbnail_classes} style={thumbnail_style} />
				<h3 className="title"><a href={result.url} target="_blank">{result.title}</a></h3>
				<p className="description">{result.description}</p>
				<ul className="details">
					<li className="author">{result.author}</li>
					<li className="duration">{secondsToTime(result.duration)}</li>
					<li className="added">{result.date}</li>
					<li className="plays">{result.plays}</li>
				</ul>
				<button className="add btn btn-small btn-primary" alt="add" value={result.url} onClick={this._onAddClick}>
					Add to Playlist <i className="fa fa-plus"></i>
				</button>
			</li>
		);
	},
	_onAddClick: function( event ){
		event.preventDefault();
		this.props.mediator.trigger( 'search:add', this.props.result.url );
		console.log('PlaylistActionCreator.addItem(this.props) goes here');
	}
});

module.exports = SearchResult;