// -- Set Up LocalForage -- //
localforage.config({
	name : "Astra-Intranet"
});
// -- Set Up LocalForage -- //

// -- Set Up & Parse URL Vars -- //
var URL_VARS = getUrlVars();
// -- Set Up & Parse URL Vars -- //

// -- Set Up API Google Scopes & IDs -- //
var API_KEY = "AIzaSyA40sckIZ1Zymd4DyhQ8sI94yG9SI9DQdk";
var API_CLIENT_ID = "1036840413668-f6fu81ngpttr6s0vh101mvqgfaocj63r.apps.googleusercontent.com";
var API_ENDPOINT_ID = "MYiqXk-0D1xkKg6yba32qXkq0wEnsVTCk";
var API_SCOPES = "profile email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/forms https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/script.storage https://www.googleapis.com/auth/groups";
// -- Set Up API Google Scopes & IDs -- //

// -- Authorisation Methods -- //

var AUTH, AUTH_SUCCESS, AUTH_FAILURE; // Methods to call

function startAuthFlow(authorised, unauthorised) {
	
	AUTH_SUCCESS = authorised;
	AUTH_FAILURE = unauthorised;

	// Load the API client and auth library
	gapi.load("client:auth2", _startAuth);
}

function signIn() {
	gapi.auth2.getAuthInstance().signIn();
}

function signOut() {
	 gapi.auth2.getAuthInstance().signOut();
}

function _startAuth() {
	
  // gapi.client.setApiKey(API_KEY);
  AUTH = gapi.auth2.init({
      client_id: API_CLIENT_ID,
      scope: API_SCOPES,
			fetch_basic_profile: true,
  })
	AUTH.then(function () {
    
		// Listen for changes in 'isSignedIn'
    gapi.auth2.getAuthInstance().isSignedIn.listen(_updateStatus);

    // Handle the initial sign-in state.
    _updateStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
		
  });
}

function _updateStatus(isAuthenticated) {
	if (isAuthenticated) {
    if (AUTH_SUCCESS) AUTH_SUCCESS(AUTH.currentUser.get().getBasicProfile());
  } else {
    if (AUTH_FAILURE) AUTH_FAILURE();
  }
}
// -- Authorisation Methods -- //


// -- API Methods -- //
function callEndpointAPI(method, parameters, success_Callback, failure_callback, messagesOutput) {
	var request = {
		function : method,
		parameters : parameters,
	};
	if (URL_VARS.dev) request.devMode = true;

	var op = gapi.client.request({
		root : "https://script.googleapis.com",
		path : "v1/scripts/" + API_ENDPOINT_ID + ":run",
		method : "POST",
		body : request
	}).then(function(response) {
		
		if (response.result.error) {
						
			if (response.result.error.status) {
				if (response.result.error.status == "UNAUTHENTICATED") {
					gapi.auth2.getAuthInstance().signIn().then(callEndpointAPI(method, parameters, callback, messagesOutput));
				} else {
					showMessages("Error calling API:", messagesOutput);
					showMessages(JSON.stringify(resp, null, 2), messagesOutput);
				}
			} else {
				var error = response.result.error.details[0];
				showMessages('Script error message: ' + error.errorMessage, messagesOutput);
				if (error.scriptStackTraceElements) {
					// There may not be a stacktrace if the script didn't start executing.
					showMessages("Script error stacktrace:", messagesOutput);
					for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
						var trace = error.scriptStackTraceElements[i];
						showMessages('\t' + trace.function+':' + trace.lineNumber, messagesOutput);
					}
				}
			}
			
		} else {
			
			if (URL_VARS && URL_VARS.debug) console.log(response.result.response);
			if (success_Callback) success_Callback(response.result.response);
		}
		
	}, function(reason) {
		
		showMessages("Error calling API:", messagesOutput);
		showMessages(JSON.stringify(reason, null, 2), messagesOutput);
		if (failure_callback) failure_callback(reason);
		
	});
	
}
// -- API Methods -- //


// -- Error Methods -- //
function showMessages(messages, output) {
	if (messages &&  typeof messages === "string") messages = [messages];
	if (output && output.find) {
		var _output = $("<pre />").appendTo(output.find(".content"));
		for (var i = 0; i < messages.length; i++) {
			console.log(messages[i]);
			_output.text(_output.text() + messages[i] + '\n');
		}
	}
}
// -- Error Methods -- //


// -- General Methods -- //
function getUrlVars()
{
	var vars = [], hash;
	
	var _params = window.location.href.slice(window.location.href.indexOf('?') + 1), params;
	if (_params.indexOf("/#") >= 0) {
		params = _params.substring(0, _params.indexOf("/#")).split('&');
	} else if (_params.indexOf("#") >= 0) {
		params = _params.substring(0, _params.indexOf("#")).split('&');
	} else {
		params = _params.split('&');	
	}
	
	for(var i = 0; i < params.length; i++)
	{
		if (params[i].indexOf("=") >= 0) {
			param = params[i].split("=");
			vars.push(param[0]);
			vars[param[0]] = param[1];
		} else {
			vars.push(params[i]);
			vars[params[i]] = true;
		}

	}
	
	return vars;
}

function populateHtml(markdownUrl, output, selector) {
	if (markdownUrl && output) {
		$.ajax({
			url: markdownUrl,
			type: "get",
			dataType: "html",
			async: false,
			success: function(result) {
				var converter = new showdown.Converter(), html = converter.makeHtml(result);
				if (html) {
					if (selector) {
						output.find(selector).html(html);
					} else {
						output.html(html);
					}
				} else {
					if (selector) {
						output.find(selector).toggleClass("hidden", true);
					} else {
						output.toggleClass("hidden", true);
					}
				}
			}
		});
	}
	return output; // For Chaining
}
// -- General Methods -- //