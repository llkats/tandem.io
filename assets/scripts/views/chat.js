var EMOJI_URL = 'http://tandem.io.s3.amazonaws.com/emoji';
var EMOJI_CONFIG = {
	url: EMOJI_URL,
	attr: {
		class: 'emoji'
	}
};

var Backbone = require('backbone');
var $ = jQuery = Backbone.$ = require('jquery');
require('../vendor/jquery.links.js');
require('../vendor/jquery.emojify.js');
require('../vendor/jquery.textcomplete.js');
var emojis = $.fn.emojify.emojis; // pull emoji list from plugin
var _ = require('underscore');
var Handlebars = require('hbsfy/runtime');
var handlebars_helper = require('handlebars-helper');
handlebars_helper.help( Handlebars );

var chat_template = require('../../templates/chat.hbs');
var message_template = require('../../templates/message.hbs');
var message_line_template = require('../../templates/message_line.hbs');
var emoji_autocomplete_template = require('../../templates/emoji_autocomplete.hbs');
var _user_template = require('../../templates/_user.hbs');

Handlebars.registerPartial( 'user', _user_template );

module.exports = Backbone.View.extend({
	events: {
		'submit form': 'submitMessage',
		'keypress textarea[name="message"]': 'keyMessage'
	},
	initialize: function(){
		this.render();
		this.listenTo( this.collection, 'add', this.addMessage );
	},
	render: function(){
		this.$el.html( chat_template() );
		this.$messages = this.$('.messages');
		this.$new_message = this.$('.new_message');
		this.$message = this.$('[name="message"]');
		// autocomplete :emoji: strings in chat textarea
		// uses list of emoji from $.emojify plugin
		this.$message.textcomplete([{
			match: /(?:^|\s):([\-+\w]*)$/,
			search: function( value, callback ){
				var matched_emoji = _.filter( emojis, function( emoji ){
					return emoji.indexOf( value ) === 0;
				});
				callback( matched_emoji );
			},
			template: emoji_autocomplete_template,
			replace: function( value ){
				return ':'+ value +':';
			},
			index: 1,
			maxCount: 7
		}]);
	},
	addMessage: function( message ){
		var $top_message = this.$messages.children(':first');
		var top_user_id = $top_message.find('span.user').data('user-id');
		var user = message.get('user') || {};
		var type = message.get('type');
		// check if this user is sending the message
		var message_data = message.toJSON();
		message_data.self = ( user.id === this.collection.user.id );
		// append this message to an existing message block
		if( top_user_id === user.id && $top_message.is('.chat') && type === 'chat' ){
			var $message_line = $( message_line_template( message_data ) );
			$message_line
			.links()
			.emojify( EMOJI_CONFIG );
			$top_message.find('.content').append( $message_line );
		}
		// prepend a new message block
		else {
			var $message = $( message_template( message_data ) );
			if( type === 'chat' || type === 'emote' ){
				$message.find('.content')
				.links()
				.emojify( EMOJI_CONFIG );
			}
			this.$messages.prepend( $message );
		}
	},
	// send a new message when the form is submitted and a message exists
	submitMessage: function( e ){
		e.preventDefault();
		var message = $.trim( this.$message.val() );
		if( message ){
			var emote_bits = /^\/me\s(.*)$/.exec( message );
			if( emote_bits ){
				this.collection.sendEmote( emote_bits[1] );
			}
			else {
				this.collection.sendMessage( message );
			}
			this.$message.val('');
		}
	},
	// trigger form submit under the right conditions
	keyMessage: function( e ){
		if( e.which === 13 && !e.shiftKey ){
			e.preventDefault();
			this.$new_message.trigger('submit');
		}
	}
})
