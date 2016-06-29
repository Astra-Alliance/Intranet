// -- Constant Variable -- //
var _version = {Name : "Astra_Intranet", Version : "0.1.0"};

// -- Global Variables -- //
var _user;
var _links;

// -- Initial Running Method -- //
$(function() {

	// -- Prevent the Sync/Async XHR Warning -- //
	$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {options.async = true;});
	
	// -- Initial -- //
	if (getUrlVars().debug) $("a.navbar-brand").css("background-color", "yellow");
	
	// -- Register Handlers for Successful / Failed Authorisation -- //
	registerAuthHandlers(
		function() {
			$("#authorise").toggleClass("hidden", true);
			var _location = "home";
			if(window.location.hash) _location = window.location.hash.substring(1);
			
			callEndpointAPI("me", null, function(value) {
				if (value && value.Email) 
					_user = value;
					$("#user").toggleClass("hidden", false).find("a").text(_user.Email);
			}, $("output"));
			
			callEndpointAPI("links", null, function(value) {
				_links = value;
				if (_location != "home" && _location != "help") showLinks(_location, $("#" + _location + " .links"), _links);
			}, $("output"));

			return !populateHtml("content/" + _location + ".md", $("#" + _location), ".content").toggleClass("hidden", false).trigger("isVisible");
		},
		function() {
			$("#user").toggleClass("hidden", true);
			$("#authorise").toggleClass("hidden", false);
			return !populateHtml("content/public.md", $("#public"), ".content").toggleClass("hidden", false).trigger("isVisible");
		}, 
		function() {}
	);

	// -- Handle Authorisation Click (Sign In / Authorise) -- //
	$("#login_submit").click(function(e) {e.preventDefault(); return handleAuth($("#login_email").val() ? $("#login_email").val() : "");});

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
			window.location.hash = e.target.hash;
			$(".btn-navbar").addClass("collapsed");
			$(".navbar-collapse").removeClass("in").addClass("collapse").css("height", "0");
			$(".view").toggleClass("hidden", true);
			var _location = $(e.target).data("view");
			if (!_location) _location = "home";
			if (_location != "home" && _location != "help") showLinks(_location, $("#" + _location + " .links"), _links);
			return !populateHtml("content/" + _location + ".md", $("#" + _location), ".content").toggleClass("hidden", false).trigger("isVisible");
	});
	// -- Handle Menu Clicks --

	// -- Visibility Handlers -- //
	$("#help").bind("isVisible", function() {
		var _this = $(this);
		if (!_this.hasClass("hidden")) ;
	});
	
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
			
			for (var i = 0; i < _links[_for].length; i++) {
				
				if (!_row) _row = $("<div />").addClass("row");
				
				var _link = _links[_for][i];
				var _linkDiv = $("<div />").addClass("col-lg-4");
				
				var _linkImg = $("<img />").addClass("img-circle").attr("alt", _link.name).attr("width", 140).attr("height", 140).appendTo(_linkDiv);
				if (_link.image) {
					_linkImg.attr("src", _link.image);
				} else {
					_linkImg.attr("data-src", "holder.js/140x140/auto");
				}
				var _linkName = $("<h2 />").text(_link.name).appendTo(_linkDiv);
				if (_link.icon) _linkName.prepend($("<span />").addClass("glyphicon " + _link.icon));
				
				if (_link.description) $("<p />").text(_link.description).appendTo(_linkDiv);
				if (_link.details) $("<p />").text(_link.details).appendTo(_linkDiv);
				
				$("<p />").append($("<a />").addClass("btn btn-default").attr("href", _link.url).attr("target", "_blank").attr("role", "button").text("Go -->")).appendTo(_linkDiv);
				
				_row.append(_linkDiv);
				
				_count += 1;
				if (_count == 3) {
					_where.append(_row);
					_count = 0;
					_row = null;
				}
			}
			
			if (_row) _where.append(_row);
			
			Holder.run({
  			images: $(".view img").get()
			});
		}
	}

});