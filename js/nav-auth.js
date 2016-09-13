// -- Show Login Form Button in top Nav Menu -- //
function showLogin() {
	
	$("#authorise").empty();
			
	var authorise = $("<form />", {
		id: "authorise",
		class: "navbar-form",
		role: "form",
	}).appendTo("#authorise");
			
	$("<button />", {
		id: "login",
		class: "btn btn-default",
		text: "Sign In",
		title: "Click here to log into this site, you will be promped to authorise the app on your account if required",
		href: "#",
	}).click(function(e) {e.preventDefault(); return signIn();}).appendTo(authorise);
	
}

// -- Show Logout Form Button in top Nav Menu and user details -- //
function showLogout(user, after) {
	
	$("#authorise").empty();
			
	var authorise = $("<form />", {
		class: "navbar-form",
		role: "form",
	}).appendTo("#authorise");
			 
	var group =  $("<div />", {
		class: "form-group",
	}).appendTo(authorise);
			
	$("<p />", {
		id: "user",
		class: "navbar-text",
		style: "margin: 0 15px", // Hack to space things properly
		text: "Signed in as",
	}).append(
		$("<a />", {
			id: "user_details",
			class: "navbar-link username",
			text: user.getName(),
			href: "https://security.google.com/settings/security/permissions",
			target: "_blank",
			title: "To remove this app from your account (" + user.getEmail() + "), click here and follow the instructions",
		})
	).appendTo(group);
			
	$("<button />", {
		id: "logout",
		class: "btn btn-default",
		text: "Sign Out",
		title: "Click here to log out of this site, but keep the app authorised on your account",
		href: "#",
	}).click(function(e) {e.preventDefault(); var r = signOut(); if (r && after) after; return r;}).appendTo(authorise);
}