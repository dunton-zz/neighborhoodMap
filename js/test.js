var viewModel = function(first) {
	this.array = ko.observableArray([
			{name: "ryan"},
			{name: "sam"},
			{name: "dave"}
		])
	this.ryan = ko.observable("my time")
}

ko.applyBindings(new viewModel("Ryan"));