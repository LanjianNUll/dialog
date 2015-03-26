/*! version:1.0.1  calendar name:田想兵 qq: tianxiangbing http://www.lovewebgames.com/jsmodule/dialog.html 2015-03-26*/
function Dialog() {
	var rnd = Math.random().toString().replace('.', '');
	this.id = 'dialog_' + rnd;
	this.settings = {};
	this.settings.closeTpl = $('<span class="ui-dialog-close js-dialog-close">x</span>');
	this.settings.titleTpl = $('<div class="ui-dialog-title"></div>');
	this.timer = null;
	this.showed = false;
	this.mask = $();
}
Dialog.prototype = {
	init: function(settings) {
		var _this = this;
		this.settings = $.extend({}, this.settings, settings);
		if (this.settings.mask) {
			this.mask = $('<div class="ui-dialog-mask"/>');
			$('body').append(this.mask);
		}
		$('body').append('<div class="ui-dialog" id="' + this.id + '"></div>');
		this.dialogContainer = $('#' + this.id);
		var zIndex = this.settings.zIndex || 10;
		this.dialogContainer.css({
			'zIndex': zIndex
		});
		if (this.settings.className) {
			this.dialogContainer.addClass(this.settings.className);
		};
		this.mask.css({
			'zIndex': zIndex - 1
		});
		if (this.settings.closeTpl) {
			this.dialogContainer.append(this.settings.closeTpl);
		}
		if (this.settings.title) {
			this.dialogContainer.append(this.settings.titleTpl);
			this.settings.titleTpl.html(this.settings.title);
		}
		this.bindEvent();
		if (this.settings.show) {
			this.show();
		}
	},
	touch: function(obj, fn) {
		var move;
		$(obj).on('click', fn);
		$(obj).on('touchmove', function(e) {
			move = true;
		}).on('touchend', function(e) {
			e.preventDefault();
			if (!move) {
				var returnvalue = fn.call(this, e, 'touch');
				if (!returnvalue) {
					e.preventDefault();
					e.stopPropagation();
				}
			}
			move = false;
		});
	},
	bindEvent: function() {
		var _this = this;
		if (this.settings.trigger) {
			$(this.settings.trigger).click(function() {
				_this.show()
			});
			_this.touch($(this.settings.trigger), function() {
				_this.show()
			});
		};
		$(this.dialogContainer).delegate('.js-dialog-close', 'click', function() {
			_this.hide();
			return false;
		})
		$(window).resize(function() {
			_this.setPosition();
		});
		$(window).scroll(function() {
			_this.setPosition();
		})
		$(window).keydown(function(e) {
			if (e.keyCode === 27) {
				_this.hide();
			}
		});
	},
	dispose: function() {
		this.dialogContainer.remove();
		this.mask.remove();
	},
	hide: function() {
		var _this = this;
		if (_this.settings.beforeHide) {
			_this.settings.beforeHide.call(_this, _this.dialogContainer);
		}
		this.showed = false;
		this.mask.hide();
		if (this.settings.animate) {
			this.dialogContainer.removeClass('zoomIn').addClass("zoomOut");
			setTimeout(function() {
				_this.dialogContainer.hide();
				if (typeof _this.settings.target === "object") {
					$('body').append(_this.dialogContainer.hide());
				}
				if (_this.settings.afterHide) {
					_this.settings.afterHide.call(_this, _this.dialogContainer);
				}
			}, 500);
		} else {
			this.dialogContainer.hide();
			if (typeof this.settings.target === "object") {
				$('body').append(this.dialogContainer)
			}
			if (this.settings.afterHide) {
				this.settings.afterHide.call(this, this.dialogContainer);
			}
		}
	},
	show: function() {
		if (typeof this.settings.target === "string") {
			if (/^(\.|\#\w+)/gi.test(this.settings.target)) {
				this.dailogContent = $(this.settings.target);
			} else {
				this.dailogContent = $('<div>' + this.settings.target + '</div>')
			}
		} else {
			this.dailogContent = this.settings.target;
		}
		if (this.settings.beforeShow) {
			this.settings.beforeShow.call(this, this.dialogContainer);
		}
		this.mask.show();
		this.dailogContent.show();
		this.height = this.settings.height || 'auto' //this.dialogContainer.height();
		this.width = this.settings.width || 'auto' //this.dialogContainer.width();
		this.dialogContainer.append(this.dailogContent).show().css({
			height: this.height,
			width: this.width
		});
		this.showed = true;
		this.setPosition();
		if (this.settings.animate) {
			this.dialogContainer.addClass('zoomIn').removeClass('zoomOut').addClass('animated');
		}
	},
	setPosition: function() {
		if (this.showed) {
			var _this = this;
			this.height = this.settings.height || this.dialogContainer.outerHeight();
			this.width = this.settings.width || this.dialogContainer.outerWidth();
			this.mask.height(document.documentElement.scrollHeight || document.body.scrollHeight);
			var clientHeight =window.innerHeight;//可视区域
			var clientWidth = window.innerWidth;
			var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
			var top = (clientHeight - this.height) / 2 + scrollTop;
			var left = (clientWidth - this.width) / 2;
			if (left < 0) {
				left = 0;
			}
			if (top < scrollTop) {
				top = scrollTop;
			}
			_this.dialogContainer.css({
				top: top,
				left: left
			})
			if (this.settings.animate) {
				clearTimeout(this.timer);
				this.timer = setTimeout(function() {
					_this.dialogContainer.animate({
						top: top,
						left: left
					});
					clearTimeout(_this.timer);
				}, 100);
			}
		}
	}
}
;
(function($) {
	$.fn.Dialog = function(settings) {
		var list = [];
		$(this).each(function() {
			var dialog = new Dialog();
			var options = $.extend({
				trigger: $(this)
			}, settings);
			dialog.init(options);
			list.push(dialog);
		});
		return list;
	};
	$.Dialog = function(settings) {
		if (settings.type = "alert") {
			var dialog = new Dialog();
			var html = '<div class="ui-alert-title">' + settings.content + '</div>';
			var action = '';
			if (settings.button) {
				action = '<p class="ui-dialog-action"><button class="ui-alert-submit  js-dialog-close">确定</button></p>';
			} else if (!settings.timer) {
				settings.timer = 3000;
			}
			html += action;
			var options = $.extend({
				target: html,
				animate: true,
				show: true,
				mask: true,
				className: "ui-alert",
				afterHide: function(c) {
					this.dispose();
					settings.callback && settings.callback();
				}
			}, settings);
			dialog.init(options);
			if (settings.timer) {
				setTimeout(function() {
					dialog.dispose();
					settings.callback && settings.callback();
				}, settings.timer);
			}
		}
	};
	/*alert*/
	$.alert = function(content, button, timer, callback) {
		$.Dialog({
			content: content,
			button: button,
			timer: timer,
			callback: callback
		});
	}
})(jQuery);