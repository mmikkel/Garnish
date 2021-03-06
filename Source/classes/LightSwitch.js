/**
 * Light Switch
 */
Garnish.LightSwitch = Garnish.Base.extend({

	settings: null,
	$outerContainer: null,
	$innerContainer: null,
	$input: null,
	$toggleTarget: null,
	on: null,
	dragger: null,

	dragStartMargin: null,

	init: function(outerContainer, settings)
	{
		this.$outerContainer = $(outerContainer);

		// Is this already a switch?
		if (this.$outerContainer.data('lightswitch'))
		{
			Garnish.log('Double-instantiating a switch on an element');
			this.$outerContainer.data('lightswitch').destroy();
		}

		this.$outerContainer.data('lightswitch', this);

		this.setSettings(settings, Garnish.LightSwitch.defaults);

		this.$innerContainer = this.$outerContainer.find('.container:first');
		this.$input = this.$outerContainer.find('input:first');
		this.$toggleTarget = $(this.$outerContainer.attr('data-toggle'));

		this.on = this.$outerContainer.hasClass('on');

		this.addListener(this.$outerContainer, 'mousedown', '_handleMouseDown');
		this.addListener(this.$outerContainer, 'keydown', '_handleKeyDown');

		this.dragger = new Garnish.BaseDrag(this.$outerContainer, {
			axis:                 Garnish.X_AXIS,
			ignoreHandleSelector: null,
			onDragStart:          $.proxy(this, '_handleDragStart'),
			onDrag:               $.proxy(this, '_handleDrag'),
			onDragStop:           $.proxy(this, '_handleDragStop')
		});
	},

	turnOn: function()
	{
		this.$innerContainer.velocity('stop').velocity({marginLeft: 0}, Garnish.FX_DURATION);
		this.$input.val(Garnish.Y_AXIS);
		this.on = true;
		this.onChange();

		this.$toggleTarget.show();
		this.$toggleTarget.height('auto');
		var height = this.$toggleTarget.height();
		this.$toggleTarget.height(0);
		this.$toggleTarget.velocity('stop').velocity({height: height}, Garnish.FX_DURATION, $.proxy(function() {
			this.$toggleTarget.height('auto');
		}, this));
	},

	turnOff: function()
	{
		this.$innerContainer.velocity('stop').velocity({marginLeft: Garnish.LightSwitch.offMargin}, Garnish.FX_DURATION);
		this.$input.val('');
		this.on = false;
		this.onChange();

		this.$toggleTarget.velocity('stop').velocity({height: 0}, Garnish.FX_DURATION);
	},

	toggle: function(ev)
	{
		if (!this.on)
		{
			this.turnOn();
		}
		else
		{
			this.turnOff();
		}
	},

	onChange: function()
	{
		this.trigger('change');
		this.settings.onChange();
		this.$outerContainer.trigger('change');
	},

	_handleMouseDown: function()
	{
		this.addListener(Garnish.$doc, 'mouseup', '_handleMouseUp')
	},

	_handleMouseUp: function()
	{
		this.removeListener(Garnish.$doc, 'mouseup');

		// Was this a click?
		if (!this.dragger.dragging)
			this.toggle();
	},

	_handleKeyDown: function(ev)
	{
		switch (ev.keyCode)
		{
			case Garnish.SPACE_KEY:
			{
				this.toggle();
				ev.preventDefault();
				break;
			}

			case Garnish.RIGHT_KEY:
			{
				if (Garnish.ltr)
				{
					this.turnOn();
				}
				else
				{
					this.turnOff();
				}

				ev.preventDefault();
				break;
			}

			case Garnish.LEFT_KEY:
			{
				if (Garnish.ltr)
				{
					this.turnOff();
				}
				else
				{
					this.turnOn();
				}

				ev.preventDefault();
				break;
			}
		}
	},

	_getMargin: function()
	{
		return parseInt(this.$innerContainer.css('marginLeft'))
	},

	_handleDragStart: function()
	{
		this.dragStartMargin = this._getMargin();
	},

	_handleDrag: function()
	{
		var margin = this.dragStartMargin + this.dragger.mouseDistX;

		if (margin < Garnish.LightSwitch.offMargin)
		{
			margin = Garnish.LightSwitch.offMargin;
		}
		else if (margin > 0)
		{
			margin = 0;
		}

		this.$innerContainer.css('marginLeft', margin);
	},

	_handleDragStop: function()
	{
		var margin = this._getMargin();

		if (margin > -16)
		{
			this.turnOn();
		}
		else
		{
			this.turnOff();
		}
	},

	/**
	 * Destroy
	 */
	destroy: function()
	{
		this.$outerContainer.removeData('lightswitch');
		this.dragger.destroy();
		this.base();
	}
},
{
	offMargin: -50,
	defaults: {
		onChange: $.noop
	}
});
