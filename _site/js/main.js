// -- Set Up Google Scopes & IDs -- //
var CLIENT_ID = "1036840413668-f6fu81ngpttr6s0vh101mvqgfaocj63r.apps.googleusercontent.com"; // Astra Intranet
var ENDPOINT_ID = "MYiqXk-0D1xkKg6yba32qXkq0wEnsVTCk"; // Astra Services
var SCOPES = [
	"https://www.googleapis.com/auth/drive",
	"https://www.googleapis.com/auth/forms",
	"https://www.googleapis.com/auth/documents",
	"https://www.googleapis.com/auth/spreadsheets",
	"https://www.googleapis.com/auth/userinfo.email",
	"https://www.googleapis.com/auth/script.storage",
	"https://www.googleapis.com/auth/groups",
];
// -- Set Up Google Scopes & IDs -- //


// -- Authorisation Methods -- //
var AUTH_SUCCESS, AUTH_FAILURE, AUTH_LOADED;
function registerAuthHandlers(success, failure, loaded) {
	AUTH_SUCCESS = success;
	AUTH_FAILURE = failure;
	AUTH_LOADED = loaded;
}

function checkAuth() {
	handleAuth(null, true);
}

function handleAuth(username, immediate) {

	gapi.auth.authorize({
		client_id : CLIENT_ID,
		scope : SCOPES,
		immediate : !immediate ? false : immediate,
		user_id : username,
	}, function(result) {
		if (result && !result.error && AUTH_SUCCESS) {AUTH_SUCCESS();}
		else if (AUTH_FAILURE) {AUTH_FAILURE();}
	}).then(AUTH_LOADED());
	
	return false;
	
}
// -- Authorisation Methods -- //


// -- API Methods -- //
function callEndpointAPI(method, parameters, callback, messagesOutput) {
	var request = {
		function : method,
		parameters : parameters,
	};
	if (getUrlVars().dev) request.devMode = true;

	var op = gapi.client.request({
		root : "https://script.googleapis.com",
		path : "v1/scripts/" + ENDPOINT_ID + ":run",
		method : "POST",
		body : request
	});

	op.execute(function(resp) {
		handleAPIResponse(resp, callback, messagesOutput);
	});
}

function handleAPIResponse(resp, callback, messagesOutput) {

	if (resp.error && resp.error.status) {
		// API encountered a problem before the script started executing.
		if (resp.error.status == "UNAUTHENTICATED") {
			gapi.auth.authorize({
				client_id : CLIENT_ID,
				scope : SCOPES,
				immediate : true,
			}, function(result) {
				if (result && !result.error && AUTH_SUCCESS) {AUTH_SUCCESS()}
				else if (AUTH_FAILURE) {AUTH_FAILURE(result ? result.error : null)}
			});
		} else {
			showMessages("Error calling API:", messagesOutput);
			showMessages(JSON.stringify(resp, null, 2), messagesOutput);
			AUTH_FAILURE();
		}
	} else if (resp.error) {
		// API executed, but the script returned an error.
		// Extract the first (and only) set of error details.
		// The values of this object are the script's 'errorMessage' and
		// 'errorType', and an array of stack trace elements.
		var error = resp.error.details[0];
		showMessages('Script error message: ' + error.errorMessage, messagesOutput);
		if (error.scriptStackTraceElements) {
			// There may not be a stacktrace if the script didn't start executing.
			showMessages("Script error stacktrace:", messagesOutput);
			for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
				var trace = error.scriptStackTraceElements[i];
				showMessages('\t' + trace.function+':' + trace.lineNumber, messagesOutput);
			}
		}
	} else {

		// The structure of the result will depend upon what the Apps Script function returns.
		if (getUrlVars().debug) console.log(resp.response.result);
		if (callback) callback(resp.response.result);
	}

}

function showMessages(messages, output) {
	if (messages &&  typeof messages === "string") messages = [messages];
	var _output = $("<pre />").appendTo(output.find(".content"));
	for (var i = 0; i < messages.length; i++) {
		console.log(messages[i]);
		_output.text(_output.text() + messages[i] + '\n');
	}
}
// -- API Methods -- //


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