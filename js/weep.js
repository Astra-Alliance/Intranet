// -- Constant Variable -- //
var _version = {Name : "Weep_App", Version : "0.1.2"};

// -- Global Variables -- //
var colour = net.brehaut.Color;

// -- Initial Running Method -- //
$(function() {

	$("#weep").bind("isVisible", function() {
		
		var _this = $(this);
		if (!_this.hasClass("hidden")) {
			
			if (_user) {
				$("#weep_Trainee").val(_user.getName());
				$("#weep_Trainee_Glyph").addClass("happy-user");
			}
			
			// -- Empty Essential Inputs -- //
			var _period_Selector = $("#weep_PeriodSelector");
			_period_Selector.empty();
			_period_Selector.append($("<option />").val("NOT_LOADED").text("Please wait for options to load ..."));
			$("#weep_Period").val("");
			var _mentor = $("#weep_Mentor").val("Please wait for mentor to load ...");
			
			// Populate Teachers' Standards
			var _weep = _this.find("#weep_Standards");
			if (_weep && _weep.children().length === 0) {
				for (var i = 0; i < standards.length; i++) {
					_weep.append(createStandard(standards[i]), "");
				}
			}
			
			gapi.load("picker", { callback: function() {
				$(".g-drive").removeAttr("disabled").removeClass("dim").click(_googleDriveClick);
				$(".g-classroom").click(_nullClick);
				$(".g-mail").click(_nullClick);
				$(".g-file").click(_nullClick);
				$(".g-web").click(_nullClick);
				$(".g-offline").click(_nullClick);
			} });				 
			autosize($("textarea.resizable"));
			
			callEndpointAPI("weeps", null, function(value) {
				if (value.result) {
					
					value = value.result;
					
					// -- Mentor -- //
					_mentor.val(value.mentor);
					if (value.mentor) {
						$("#weep_Mentor_Glyph").addClass("happy-user");
					} else {
						$("#weep_Mentor_Glyph").addClass("unhappy-user");
					}
					
					// -- Periods -- //
					// TODO: Convert this to dropdown LIST //
					_period_Selector.empty();
					_period_Selector.append($("<option />").text(""));
					_period_Selector.removeAttr("disabled");
					for (var i = 0; i < value.options.length; i++) {
						var _text = value.options[i].name;
						if (value.options[i].status == "PENDING") {
						} else if (value.options[i].status == "IN_PROGRESS") {
							_text += " (Started)";
						} else if (value.options[i].status == "SUBMITTED") {
							_text += " (Submitted)";
						} else if (value.options[i].status == "COMPLETED") {
							_text += " (Completed)";
						}
						var _option = $("<option />").data("status", value.options[i].status).val(value.options[i].key).text(_text);
						_period_Selector.append(_option);
					}
					
					// -- Distribution List -- //
					$("#distribution_list").html("When submitted, this information will be also sent to: <strong>" + value.distribution + "</strong>. If this list is not correct, please <strong>inform us</strong> before finally submitting!");
					
				}
			}, $("output"));
			
		}}
	);
	
	// -- Helper Functions -- //
	var populate_ListFromFind = function(find, list, output) {
		callEndpointAPI("find", [find], function(value) {
				$.each(value.List, function() {
					var _option = $("<option />").val(this.Id).text(this.Name);
					if (this.Colour) _option.css("background-color", this.Colour);
					list.append(_option);
				});
			}, output)
	}
	
	// -- Handle Form Events -- //
	$("ul.colour_selector li a").click(function(e) {
		e.preventDefault();
		var _this = $(this);
		$("#" + _this.parent().parent().data("target")).css("background-color", _this.data("value")).val(_this.data("value"));
		_this.parents(".dropdown-menu").find("li").removeClass("active");
   	_this.parent("li").addClass("active");
	});
	
	$("input[type='radio'], input[type='checkbox']").change(function() {
		var _this = $(this);
		if (_this.data("target") && (_this.data("value") || _this.data("value") === "")) {
			if (_this.prop("checked")) {
				autosize.update($("#" + _this.data("target")).val(_this.data("value")));
			} else {
				autosize.update($("#" + _this.data("target")).val(""));
			}
		}
	});
	
	$("a.dropdown-selector").click(function(e) {
		var _this = $(this);
		if (_this.data("target") && _this.data("value")) {
			e.preventDefault();
			$("#" + _this.data("target")).css("color", "#000").text(_this.data("value"));
		}
	})
	
	$(".alter-numerical").click(function(e) {
		var _this = $(this);
		if (_this.data("target") && _this.data("value")) {
			var _target = $("#" + _this.data("target"));
			var _min = 0;
			if (_target.data("min")) _min = Number(_target.data("min"));
			var _max = Number.MAX_VALUE;
			if (_target.data("max")) _max = Number(_target.data("max"));
			var _suffix = _target.data("suffix");
			var current_Val = _target.val();
			if (current_Val && _suffix) current_Val = current_Val.split(" ")[0];
			if (current_Val) {
				current_Val = Number(current_Val);
			} else {
				current_Val = 0;
			}
			if (current_Val + Number(_this.data("value")) <= _max) current_Val += Number(_this.data("value"));
			if (current_Val <= _min) {
				_target.val("");
			} else if (_suffix) {
				_target.val(current_Val + " " + _suffix);
			} else {
				_target.val(current_Val);
			}
		}
	});
	
	$(".eraser").click(function(e) {
		var _this = $(this);
		if (_this.data("target")) $("#" + _this.data("target")).val("");
	});
	
	$("#weep_Assessment_Buttons label").click(function(e) {var _this = $(this); 
		_this.parent().find("span").addClass("dim"); _this.parent().find("span.no-dim").removeClass("dim"); _this.find("span").removeClass("dim");});
	
	var addTarget = function(details, _this) {
		
		var _target = $("#targets");
			
		if (_target.length === 0) {
			_target = $("<div />").attr("id", "targets").addClass("well well-sm").appendTo($(_this).closest(".input-group").parent());
			$("#weep_Targets").prop("checked", true);
		}
			
		var _targetItem = $("<div />").addClass("target-list-item").appendTo(_target);
		_targetItem.append($("<span />").addClass("label label-primary").text("Target"));
		_targetItem.append($("<p />").data("for", "targets").data("type", "Target").addClass("pad-left").text(details));
		_targetItem.append($("<a />").attr("href", "#").attr("title", "Remove Evidence").addClass("pad-left").append($("<span />").addClass("glyphicon glyphicon-remove delete-icon")).click(
			function(e) {
				e.preventDefault();
				$(this).parent().remove();
				if ($("#targets").children().length === 0) {
					$("#targets").remove();
					$("#weep_Targets").prop("checked", false);
				}
			}
		));
	}
	
	$("#add_Target").click(function(e) {
		var _targetDetails = $("#target_Details").val();
		
		if (_targetDetails) {
		
			var _targetEvidence = $("#target_EvidenceType").text();
			if (_targetEvidence == "Evidence Type") _targetEvidence = "";
			
			addTarget(_targetDetails + (_targetEvidence ? " [Evidenced By: " + _targetEvidence + "]": ""), this);
			
			// DELETE TEXT AND RESET BUTTON
			$("#target_Details").val("");
			$("#target_EvidenceType").text("Evidence Type");
		}
		
	});

	$("#weep_PeriodSelector").change(function() {
		
		var _this = $(this);
		if (_this.val()) {
			
			var _spin = new Spinner(spin_large).spin()
			document.getElementById("form_Weep").appendChild(_spin.el);
			
			var _selected = _this.val();
			_this.attr("disabled", "disabled");
			$("#weep_Period").val(_selected);
			callEndpointAPI("load_weep", [_selected], function(value) {
				
				if (value.result) {
					
					value = value.result;
					
					// -- Targets - bit of a hack but field magically disappears :( -- //
					if (value.targets && value.targets.Target && value.targets.Target.length > 0) {
						if (URL_VARS && URL_VARS.debug) console.log("TARGETS: " + JSON.stringify(value.targets.Target));
						var __this = $("#add_Target")
						for (var i = 0; i < value.targets.Target.length; i++) {
							addTarget(value.targets.Target[i].Value, __this);
						}	
					}
					
					// -- Iterate through all the Input, Select & Text Area Elements of the Form -- //
					$("#form_Weep").find("input, select, textarea").each(function() {
						
						_this = $(this);
						
						var _field = _this.data("field");
						var _for = _this.data("for");
						var _type = _this.data("type");
						var _val;
						
						if (_field || (_for && _type)) {

							if (URL_VARS && URL_VARS.debug) console.log("Form Input: Id=" + this.id + "; Type=" + this.type + "; Data-Field=" + _field + "; Data-For=" + _for + "; Data-Type=" + _type);
							
							if (_field && value[this.id]) {
								
								_val = value[this.id].Value;
								if (URL_VARS && URL_VARS.debug) console.log("Found ID Match. Value=" + _val + ";Object Type=" + typeof _val);

							} else if (_for && value[_for]) {

								_val = value[_for][_type];
								if (URL_VARS && URL_VARS.debug) console.log("Found FOR/TYPE Match. Value=" + JSON.stringify(_val) + ";Object Type=" + typeof _val);
								if (value[_for].Evidence && value[_for].Evidence.length > 0) { // Add Evidence if applicable
									for (var i = 0;i < value[_for].Evidence.length; i++) {
										var _e = value[_for].Evidence[i];
										addEvidence(_this.parent().parent(), _e.Id, _e.Value, _e.Url, _e.Icon, _for);
									}	
								}
							
							}
							
							if (_val) {
								
								if(Object.prototype.toString.call(_val) === "[object Array]" &&  _val.length == 1) _val = _val[0];
								
								if (_val.Value || _val.Value === "") _val = _val.Value;
								
								if ($("input[data-target='" + this.id + "']").length > 0) {
									var _inputs = $("input[data-target='" + this.id + "'][data-value='" + _val + "']");
									if (_inputs.length > 0) _inputs.parent().addClass("active");
								}
								
								if (this.type == "checkbox" || this.type == "radio") {
									_this.prop("checked", _val);
									if (_this.data("reveal")) $("#" + _this.data("reveal")).slideToggle(); //slideToggle
								} else {
									_this.val(_val);
									if (_this.hasClass("resizable")) { // Trigger the resize update!
										var evt = document.createEvent("Event");
										evt.initEvent("autosize:update", true, false);
										this.dispatchEvent(evt);
									}
									
								}
								
							}
						
						}
						
					});
					
				}

				if (_spin) _spin.stop();
				
			}, output)
		}

	});
	
	$("input.reveal").change(function() {$("#" + $(this).data("reveal")).toggleClass("hidden");});
	
	function _nullClick(e) {
		e.preventDefault();
		return true;
	}
	
	function _googleDriveClick(e) {
		e.preventDefault();
		var _picker = new google.picker.PickerBuilder()
			.addView(google.picker.ViewId.DOCS)
			.setAppId(API_CLIENT_ID)
			.setDeveloperKey(API_KEY)
			.setOAuthToken(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token)
			.enableFeature(google.picker.Feature.NAV_HIDDEN)
			.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
			.setCallback((function(target, container) {
				return function(data) { 
					_pickerCallback(data, target, $(container).data("for") ? $(container).data("for") : $(container).id);
				}
			})($(e.target).closest(".evidence-holder"), $(e.target).closest(".evidence")[0]))
			.build().setVisible(true);
		return true;
	}
	
	function addEvidence(target, id, name, url, icon, prefix) {
		
		var _listItem = $("<div />").addClass("evidence-list-item").appendTo(target);
						_listItem.append($("<span />").addClass("label label-default").text("Evidence"));
						if (icon) _listItem.append($("<img />").addClass("pad-left file-icon").attr("src", icon));
						_listItem.append($("<a />").addClass("pad-left").data("id", id).data("for", prefix).data("type", "Evidence").attr("target", "_blank").attr("href", url).text(name));
						_listItem.append($("<a />").attr("href", "#").attr("title", "Remove Evidence").addClass("pad-left").append($("<span />").addClass("glyphicon glyphicon-remove delete-icon")).click(function(e) {e.preventDefault(); $(this).parent().remove(); return true;}));
		
	}
	
	function _pickerCallback(data, target, prefix) {
			if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
				
				for (var i = 0; i < data[google.picker.Response.DOCUMENTS].length; i++) {
					
					var _file = data[google.picker.Response.DOCUMENTS][i];
					var _id = _file[google.picker.Document.ID];
					var _name = _file[google.picker.Document.NAME];
					var _url = _file[google.picker.Document.URL];
					var _icon = _file[google.picker.Document.ICON_URL];
					
					if (URL_VARS && URL_VARS.debug) console.log(_file);
					console.log(prefix);

					if (target) addEvidence(target, _id, _name, _url, _icon, prefix);
					
				}

			}
		}
	// -- Handle Form Events -- //
	
	
	// -- Handle Form Saves / Submissions -- //
	$("#weep_Save").click(function(e) {
		
		e.preventDefault();
		$("#weep_Submission .glyphicon").remove();
		
		if ($("#weep_Period").val()) {
			
			$(".material-button").prop("disabled", true).addClass("high-dim");
		
			var _spin = new Spinner(spin_small).spin()
			this.appendChild(_spin.el);
		
			var _this = $("#form_Weep");
			var _data = getDataFromForm(_this, "form_Weep");
		
			callEndpointAPI("save_weep", [_data], function(value) {

				if (_spin) _spin.stop();
				$(".material-button").prop("disabled", false).removeClass("high-dim");

				if (value.result === true) {
					$("<span />").addClass("status glyphicon glyphicon-ok success-icon").insertAfter("#weep_Submit");
				} else {
					$("<span />", {title : JSON.stringify(value)}).addClass("status glyphicon glyphicon-remove failure-icon").insertAfter("#weep_Submit");
				}

			}, output)

		} else {
			
			$("<span />", {title : "You must specify a Week / Assessment Point before saving!"}).addClass("status glyphicon glyphicon-remove failure-icon").insertAfter("#weep_Submit");
			
		}
		
	});

	$("#weep_Submit").click(function(e) {
		
		e.preventDefault();
		$("#weep_Submission .status").remove();
		
		if ($("#weep_Period").val()) {

			$(".material-button").prop("disabled", true).addClass("high-dim");

			var _spin = new Spinner(spin_small).spin()
			this.appendChild(_spin.el);

			var _this = $("#form_Weep");
			var _data = getDataFromForm(_this, "form_Weep");

			callEndpointAPI("submit_weep", [_data], function(value) {

				if (_spin) _spin.stop();
				$(".material-button").prop("disabled", false).removeClass("high-dim");

				if (value.result === true) {
					$("<span />").addClass("status glyphicon glyphicon-ok success-icon").insertAfter("#weep_Submit");
				} else {
					$("<span />", {title : JSON.stringify(value)}).addClass("status glyphicon glyphicon-remove failure-icon").insertAfter("#weep_Submit");
				}

			}, output)
		
			} else {
				
				$("<span />", {title : "You must specify a Week / Assessment Point before submitting!"}).addClass("status glyphicon glyphicon-remove failure-icon").insertAfter("#weep_Submit");
				
			}
		
	})
	// -- Handle Form Submissions -- //

	function createStandard(standard, previous, parentColour) {
		
		var _standard = (previous ? String(previous) : "") + String(standard.number);
		var _safeStandard = _standard.split(".").join("_");
		var _return = $("<li />").addClass("list-group-item dim");
		_return.click(function() {var _this = $(this); _this.parent().children("li").addClass("dim"); _this.removeClass("dim")});
		
		// -- Handle Colour -- //
		var _colour;
		
		if (standard.colour) {
			_colour = standard.colour;
		} else if (parentColour) {
			_colour = colour(parentColour).lightenByRatio((Math.floor(Math.random() * 8) + 4) / 100).desaturateByRatio((Math.floor(Math.random() * 40) + 10) / 100).toCSS();
		}
		if (_colour) _return.css("background-color", _colour);
		// -- Handle Colour -- //
		
		_return.append($("<div />").addClass("material-switch-label").text(standard.details).prepend($("<h4 />").text(_standard + ") " + (standard.name ? standard.name + "  " : "")).addClass("number-label")));
		_return.append($("<div />").addClass("pull-right")
			.append($("<input />").attr("id", "standard_" + _safeStandard).attr("name", "standard_" + _safeStandard).attr("hidden", "hidden")
				.attr("type", "checkbox").attr("for", (standard.evidence && standard.evidence === true) ? "evidence_" + _safeStandard : "childStandards_" + _safeStandard)
							.data("reveal", (standard.evidence && standard.evidence === true) ? "evidence_" + _safeStandard : "childStandards_" + _safeStandard)
				.data("field", "Standard " + _standard).data("order", Number("5" + _standard)).change(function() {$("#" + $(this).data("reveal")).slideToggle();}))
		.append($("<label />").addClass("material-switch").attr("for", "standard_" + _safeStandard)));

		if (standard.evidence && standard.evidence === true) {
			var _holder = $("<div />").attr("id", "evidence_" + _safeStandard).addClass("evidence-holder").css("display", "none");
			var _input = $("<div />").addClass("input-group evidence").data("for", "standard_" + _safeStandard).appendTo(_holder);
			_input.append($("<textarea />").data("for", "standard_" + _safeStandard).data("type", "Details").data("order", Number("5" + _standard)).attr("name", "evidenceDetails_" + _safeStandard).attr("rows", 1).attr("placeholder", "Further details about how this was met").css("width", "100%").css("max-width", "100%").css("resize", "vertical").addClass("form-control optional resizable"));
			_input.append($("<div />").addClass("input-group-btn bottom-align").attr("id", "evidenceButton_" + _safeStandard)
				.append($("<button />").attr("type", "button").addClass("btn btn-primary dropdown-toggle").attr("data-toggle", "dropdown").attr("aria-haspopup", "true")
								.attr("aria-expanded", "false").text("Evidence ").append($("<span />").addClass("caret")).dropdown())
				.append($("<ul />").addClass("dropdown-menu dropdown-menu-right")
								.append($("<li />").append($("<a />").attr("href", "#").addClass("g-drive google dim").attr("disabled", "disabled").text("From Google Drive")))
								.append($("<li />").append($("<a />").attr("href", "#").addClass("g-classroom google dim").attr("disabled", "disabled").text("From Google Classroom")))
								.append($("<li />").append($("<a />").attr("href", "#").addClass("g-mail google dim").attr("disabled", "disabled").text("From Google Gmail")))
								.append($("<li />").append($("<a />").attr("href", "#").addClass("g-file google dim").attr("disabled", "disabled").text("From File")))
								.append($("<li />").append($("<a />").attr("href", "#").addClass("g-web google dim").attr("disabled", "disabled").text("From Web")))
								.append($("<li />").attr("role", "separator").addClass("divider"))
								.append($("<li />").append($("<a />").attr("href", "#").addClass("g-offline google dim").attr("disabled", "disabled").text("Offline / Paper")))
				));
			_return.append(_holder);
		}

		if (standard.children && standard.children.length > 0) {
			var _container = $("<ul />").addClass("list-group").attr("id", "childStandards_" + _safeStandard).css("margin-top", "1em").css("display", "none");
			for (var i = 0; i < standard.children.length; i++) {
					_container.append(createStandard(standard.children[i], _standard + ".", _colour));
				}
			_return.append(_container);
		}
		return _return;
	}

});

// -- Data Methods -- //
function getDataFromForm(form, id) {

	var _return = {};
	
	// -- Iterate through all the Input, Select & Text Area Elements of the Form -- //
	form.find("input, select, textarea").each(function() {
		_this = $(this);
		if (_this.data("for") && _return[_this.data("for")]) {
			if (!_return[_this.data("for")][_this.data("type")]) _return[_this.data("for")][_this.data("type")] = [];
			_return[_this.data("for")][_this.data("type")].push({
				Field : _this.data("field") ? _this.data("field") : _this.attr("name"),
				Value : (this.type == "checkbox" || this.type == "radio") ? _this.prop("checked") : _this.val(),
			});
		} else if (_this.attr("name")) {
			_return[_this.attr("name")] = {
				Field : _this.data("field"),
				Value : (this.type == "checkbox" || this.type == "radio") ? _this.prop("checked") : _this.val(),
				Order : _this.data("order"),
			};	
		}
	});
	
	// -- Iterate through all the Evidence List Item Links, tying them up to  -- //
	form.find(".evidence-list-item a, .target-list-item p").each(function() {
		_this = $(this);
		if (_this.data("for") && _return[_this.data("for")]) {
			// Matched
			var _type = _this.data("type")
			if (!_return[_this.data("for")][_type]) _return[_this.data("for")][_type] = [];
			var _object = {
				Id : _this.data("id"),
				Url : _this.attr("href"),
				Value : _this.text(),
			}
			var _imgs = _this.siblings("img.file-icon");
			if (_imgs.length == 1) _object.Icon = _imgs.prop("src");
			_return[_this.data("for")][_type].push(_object);
		}
	});
	
	if (URL_VARS && URL_VARS.debug) {
		console.log("Getting Data from Form: " + id);
		console.log("Form:");
		console.log(form);
		console.log("Data:");
		console.log(_return);
	}
	
	return _return;
}
// -- Data Methods -- //