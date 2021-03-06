Template.relocatePage.helpers({
		"fromdb": function() {
		var itemId, data;
		itemId = Session.get("relocateId");
		if (!itemId) {
			return {found: false};
		}
		data = Items.findOne({"_id": itemId});
		if (!data) {
			return {found: false};
		}
		return {found: true, data: data};
	}
});

Template.relocateMode.created = function () {
	this.main = new ReactiveVar;
	this.main.set(null);
	this.sub = new ReactiveVar;
	this.sub.set(null);

	this.bulk = new ReactiveVar;
	this.auto = new ReactiveVar;
	this.bulk.set(true);
	this.auto.set(false);
}

Template.relocateMode.helpers({
	main: function () {
		return Template.instance().main.get();
	},
	mainSubdivided: function () {
		var main = Template.instance().main.get();
		var fromdb = Locations.findOne({_id: main});
		return !!(fromdb.sublocations);
	},
	autoOption: function () {
		return template.auto.get();
	}
});

Template.relocateMode.events({
	"change [name='locGroup']": function (event, template) {
		var radio = template.$( ':checked' ).filter( ':radio' ).filter( '[name="locGroup"]' );
		template.sub.set(null);
		template.main.set(radio.val());
	},

	"change [name='subLocGroup']": function (event, template) {
		var radio = template.$( ':checked' ).filter( ':radio' ).filter( '[name="subLocGroup"]' );
		template.sub.set(radio.val());
	},  

	"change [name='relocateBulkOption']": function (event, template) {
		var current = template.bulk.get();
		template.bulk.set(!current);
	},

	"change [name='relocateAutoOption']": function (event, template) {
		var current = template.auto.get();
		template.auto.set(!current);
	},

	"submit .scan": function (event, template) {
		var itemId, location;
		usr = Meteor.user();
		itemId = template.$( '#rLScan' ).val();
		Session.set("relocateId", itemId);
		if (template.auto.get()) {
			var defLocation = Items.findOne({"_id": itemId}).defaultLocation;
			try {
				validate.checkLocation(defLocation);
			}
			catch (error) {
				Flash.danger(error)
			}
			location = defLocation;
			location.moved_by = template.$( '#relocateBy' ).val();
			location.comment = template.$( '#relocateComment' ).val();
		}
		else {
			location = {
				main: template.main.get(),
				sub: template.sub.get(),
				moved_by: template.$( '#relocateBy' ).val(),
				comment: template.$( '#relocateComment' ).val(),
			}
		}
		if (template.bulk.get()) {
			Meteor.call("moveItem", itemId, location, function (error, data) {
				if (error) {
					Flash.danger(error);
				}
			});
		}
		Flash.success(location.main + " " + location.sub);
		return false;
	}
});

var isSubdivided = function (location) {
		var sublocations = Meteor.settings.public.sublocations; 
		if (sublocations[location]) {
			return true;
		}
		return false;  
}

// var resolveLocation = function (template, item) {
// 	var team, defaultLocation, location;
// 	location = {};
// 	if (template.auto.get()) {
// 		if (validate.checkLocation(item.defaultLocation)) {
// 			location = item.defaultLocation;
// 		}
// 		else {
// 			Flash.danger("Item has no/invalid default location!");
// 			throw new M
// 		}
// 	}
// 	else {
// 		location.main = template.main.get();
// 		if (isSubdivided(location.main)) {
// 			location.sub = null;
// 			radio = template.$( '[name="subLocGroup"]' ).filter( ':radio' ).filter( ':checked' );
// 			if(radio.val()) {
// 				location.sub = radio.val();
// 			}
// 		}	
// 	}
// 	return location; 
// } 
