// -- Constant Variable -- //
var _version = {Name : "Astra_Intranet", Version : "0.1.2"};

// -- Global Variables -- //
var _links;
var _user;

// -- Spinner Options -- //
var spin_small = {
  lines: 9 // The number of lines to draw
, length: 10 // The length of each line
, width: 5 // The line thickness
, radius: 5 // The radius of the inner circle
, scale: 0.8 // Scales overall size of the spinner
, corners: 0.5 // Corner roundness (0..1)
, color: "#222" // #rgb or #rrggbb or array of colors
, opacity: 0.2 // Opacity of the lines
, rotate: 7 // The rotation offset
, direction: 1 // 1: clockwise, -1: counterclockwise
, speed: 0.8 // Rounds per second
, trail: 71 // Afterglow percentage
, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
, zIndex: 2e9 // The z-index (defaults to 2000000000)
, className: "spinner" // The CSS class to assign to the spinner
, top: "50%" // Top position relative to parent
, left: "50%" // Left position relative to parent
, shadow: false // Whether to render a shadow
, hwaccel: true // Whether to use hardware acceleration
, position: "absolute" // Element positioning
}

var spin_large = {
  lines: 18 // The number of lines to draw
, length: 200 // The length of each line
, width: 30 // The line thickness
, radius: 100 // The radius of the inner circle
, scale: 1 // Scales overall size of the spinner
, corners: 0.5 // Corner roundness (0..1)
, color: "#222" // #rgb or #rrggbb or array of colors
, opacity: 0.2 // Opacity of the lines
, rotate: 7 // The rotation offset
, direction: 1 // 1: clockwise, -1: counterclockwise
, speed: 0.8 // Rounds per second
, trail: 71 // Afterglow percentage
, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
, zIndex: 2e9 // The z-index (defaults to 2000000000)
, className: "spinner" // The CSS class to assign to the spinner
, top: "25%" // Top position relative to parent
, left: "50%" // Left position relative to parent
, shadow: false // Whether to render a shadow
, hwaccel: true // Whether to use hardware acceleration
, position: "absolute" // Element positioning
}

// -- Initial Running Method -- //
$(function() {

	// -- Prevent the Sync/Async XHR Warning -- //
	$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {options.async = true;});
	
	// -- Initial -- //
	if (getUrlVars().debug) $("a.navbar-brand").css("background-color", "yellow");
	
	// -- Auth Handler -- //
	startAuthFlow(
		function(user) {
			_user = user;
			showLogout(user, displayPublic);
			return displayLinks();
		},
		function() {
			showLogin();
			return displayPublic();
		}
	);
	// -- Auth Handler -- //
	
	// -- View Handlers -- //
	function displayLinks() {
		$(".view").toggleClass("hidden", true);
		var _location = window.location.hash ? window.location.hash.substring(1) : "home";
			
		callEndpointAPI("links", null, function(value) {
			_links = value.result;
			if (_location != "public" && _location != "help") showLinks(_location, $("#" + _location + " .links"), _links);
		}, function(reason) {
			// TODO: Do Something
		}, $("output"));

		return !populateHtml("content/" + _location + ".md", $("#" + _location), ".content").toggleClass("hidden", false).trigger("isVisible");
	}
	
	function displayPublic() {
		$(".view").toggleClass("hidden", true);
			
		return !populateHtml("content/public.md", $("#public"), ".content").toggleClass("hidden", false).trigger("isVisible");
	}
	// -- View Handlers -- //
	
	// -- Handle Toggle Visibility Clicks -- //
	$(".toggle").click(function(e) {
		e.preventDefault();
		_this = $(e.currentTarget);
		_this.parents(".view").find(".pane").toggleClass("hidden", true);
		$("#"+ _this.data("toggle")).toggleClass("hidden").trigger("isVisible");
		return false;
	});

	// -- Handle Menu Clicks --
	$("a.nav-link, a.navbar-brand")
		.click(function(e) {
			e.preventDefault();
			window.location.hash = e.currentTarget.hash;
			$(".btn-navbar").addClass("collapsed");
			$(".navbar-collapse").removeClass("in").addClass("collapse").css("height", "0");
			$(".view").toggleClass("hidden", true);
			var _location = $(e.currentTarget).data("view");
			if (!_location) _location = "home";
			if (_location != "public" && _location != "help") showLinks(_location, $("#" + _location + " .links"), _links);
			return !populateHtml("content/" + _location + ".md", $("#" + _location), ".content").toggleClass("hidden", false).trigger("isVisible");
	});
	// -- Handle Menu Clicks --

	// -- Visibility Handlers -- //
	$("#help").bind("isVisible", function() {
		var _this = $(this);
		if (!_this.hasClass("hidden")) {
			callEndpointAPI("versions", [], function(value) {
				var _list = _this.find("ul");
				_list.empty();
				_list.append($("<li />").text(_version.Name + " -- v" + _version.Version).prepend($("<span />").addClass("glyphicon glyphicon-wrench").attr("aria-hidden", "true").css("margin-right", "1em")));
				$.each(value, function() {
					_list.append($("<li />").text(this.Name + " -- v" + this.Version).prepend($("<span />").addClass("glyphicon glyphicon-wrench").attr("aria-hidden", "true").css("margin-right", "1em")));
				});
			}, function(reason) {
				
			}, $("output"))	
		}}
	);
	// -- Visibility Handlers -- //
			
	// -- Links -- //
	function showLinks(_for, _where, _links) {
		
		if (_for && _where && _links) {
			
			_where.empty();
			_for = _for.toLowerCase()
			
			var _row;
			var _count = 0;
			
			if (_links[_for] && _links[_for].length > 0) {
				
				for (var i = 0; i < _links[_for].length; i++) {
				
					if (!_row) _row = $("<div />").addClass("row");

					var _link = _links[_for][i];
					var _linkDiv = $("<div />").addClass("col-lg-4");
					var _linkImg = $("<img />").addClass("img-circle").attr("alt", _link.name).attr("width", 140).attr("height", 140).appendTo($("<a />").attr("href", _link.url).attr("target", "_blank").appendTo(_linkDiv));
					if (_link.image) {
						_linkImg.attr("src", _link.image);
					} else {
						_linkImg.attr("data-src", "holder.js/140x140/auto");
					}
					var _linkName = $("<h2 />").text(_link.name).appendTo(_linkDiv);
					if (_link.icon) _linkName.prepend($("<span />").addClass("glyphicon " + _link.icon));

					if (_link.description) $("<p />").text(_link.description).appendTo(_linkDiv);
					if (_link.details) $("<p />").text(_link.details).appendTo(_linkDiv);

					_row.append(_linkDiv);

					_count += 1;
					if (_count == 3) {
						_where.append(_row);
						_count = 0;
						_row = null;
					}
					
				}
				
			}
			
			if (_row) _where.append(_row);
			
			Holder.run({images: $(".view img").get()});
		}
	}

});