/* Required : GedcomConst */
/* Required : GedcomLang */
/* Required : GedcomPlugins */
/* Required : GedcomParser */

GedcomPlugins.setRequired("deat");
GedcomPlugins.setRequired("privacy");
GedcomPlugins.setRequired("sexe");
GedcomPlugins.setRequired("name");
GedcomPlugins.setRequired("birt");

// ///////////
// PERSONNE //
// ///////////
var Personne = Class.create();
Personne.prototype = {
	type : GedcomConst.indicator.personne,
	data : null,
	id : null,
	plugin : null,

	pluginsLoaded : false,

	getValue : function(key) {
		return this.plugin[key];
	},

	inject : function(parser) {
		GedcomPlugins.getPlugins(true).each(function(plugin) {
					if (Object.isFunction(plugin.inject)) {
						plugin.inject(this, parser);
					}
				}, this);
	},

	initialize : function(data) {
		this.plugin = {};
		this.id = data.type;
		this.data = data;
		try {
			this.loadPlugins(data, true);
		} catch (e) {
			log.error("Parser::Personne::initialize -> id:" + this.id, e);
		}
	},

	loadPlugins : function(data, required) {
		if (!this.pluginsLoaded) {
			GedcomPlugins.getPlugins(required).each(function(plugin) {
						plugin.parser(this, data);
					}, this);
			if (!required) {
				this.pluginsLoaded = true;
			}
		}
	},

	isDead : function() {
		return !!this.getValue("deat");
	},

	isPublic : function() {
		if (GedcomConst.SHOW_PRIVATE_RECORD) {
			return true;
		}
		return ("privacy" != this.getValue("privacy"));
	},

	getBoxText : function(defaultTxtAttr, navigation) {
		var lines = [];
		lines.push({
					key : "name",
					txt : this.getDisplayName("\n"),
					attrs : Object.extend({
								"font-weight" : "bold"
							}, defaultTxtAttr)
				});
		lines.push({
					key : "dates",
					txt : this.getDisplayDate(),
					attrs : defaultTxtAttr
				});
		return lines;
	},

	getDisplayName : function(nameJoiner) {
		try {
			var txt = [];
			if (this.isPublic()) {
				if (this.getValue("sexe")) {
					switch (this.getValue("sexe")) {
						case "M" :
							txt.push(GedcomLang.$.personne.sexe.M);
							break;

						case "F" :
							txt.push(GedcomLang.$.personne.sexe.F);
							break;
					}
				}
				if (this.getValue("name").length > 0) {
					txt.push(this.getValue("name").join(nameJoiner));
				}
			} else {
				txt.push("- " + GedcomLang.$.personne.privacy + " -");
			}
			return txt.join(" ");
		} catch (e) {
			log.error("Parser::getDisplayName", e);
		}
	},

	getDisplayDate : function() {
		try {
			if (!this.isPublic()) {
				return null;
			}

			if (!this.getValue("birt") && !this.getValue("deat")) {
				return null;
			}

			return [this.getValue("birt") && this.getValue("birt").date || "",
					this.getValue("deat") && this.getValue("deat").date || ""].join(" - ");

		} catch (e) {
			log.error("Parser::getDisplayDate", e);
		}
	}
};

// //////////
// FAMILLE //
// //////////
var Famille = Class.create();
Famille.prototype = {
	type : GedcomConst.indicator.famille,
	id : null,
	husb : null,
	wife : null,
	marr : null,
	childs : null,

	initialize : function(data) {
		try {
			// Extraction des données
			{
				this.id = data.type;

				// Mari
				this.husb = GedcomParser.getChild(data, "HUSB", true);

				// Femme
				this.wife = GedcomParser.getChild(data, "WIFE", true);

				// Informations du mariage
				this.marr = GedcomParser.extractDateAndPlace(GedcomParser.getChild(data, "MARR"));

				// Enfants
				this.childs = GedcomParser.getChilds(data, "CHIL", true);

			}

		} catch (e) {
			log.error("Parser::Famille::initialize -> id:" + this.id, e);
		}
	},

	inject : function(parser) {
		if (this.husb) {
			this.husb = parser.getData(this.husb);
		}
		if (this.wife) {
			this.wife = parser.getData(this.wife);
		}
		this.childs = this.childs.collect(function(child) {
					return parser.getData(child);
				}, this);
	}

};

// /////////
// SOURCE //
// /////////
var Source = Class.create();
Source.prototype = {
	type : GedcomConst.indicator.source,
	id : null,

	title : null,
	abbr : null,
	auth : null,
	publ : null,
	text : null,
	notes : null,

	initialize : function(data) {
		try {
			// Extraction des données
			{
				this.id = data.type;

				this.title = GedcomParser.getChild(data, "TITL", true);
				this.abbr = GedcomParser.getChild(data, "ABBR", true);
				this.auth = GedcomParser.getChild(data, "AUTH", true);
				this.publ = GedcomParser.getChild(data, "PUBL", true);
				this.text = GedcomParser.getChild(data, "TEXT", true);
				this.notes = GedcomParser.getChilds(data, "NOTE", true);
			}

		} catch (e) {
			log.error("Parser::Source::initialize -> id:" + this.id, e);
		}
	}
};

// ///////
// NOTE //
// ///////
var Note = Class.create();
Note.prototype = {
	type : GedcomConst.indicator.note,
	id : null,
	text : null,

	initialize : function(data) {
		try {
			// Extraction des données
			{
				this.id = data.type;

				// Text
				this.text = data.text;
			}

		} catch (e) {
			log.error("Parser::Note::initialize -> id:" + this.id, e);
		}
	}
};