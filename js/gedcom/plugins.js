/* Required : GedcomConst */
/* Required : GedcomLang */
/* Required : GedcomParser */
/* Required : GedcomToolbox */
var GedcomPlugins = {

	plugins : [],

	pluginsLoaded : $H(),

	pluginsRequired : $H(),

	setRequired : function(key) {
		this.pluginsRequired.set(key, true);
	},

	addPlugin : function(plugin) {
		if (this.pluginsLoaded.get(plugin.key)) {
			console.log("Plugins:: Plugin [" + plugin.key + "]" + plugin.name + " already loaded");
			return;
		}

		if (plugin.active) {
			this.plugins.push(plugin);
			this.pluginsLoaded.set(plugin.key, true);
		}
	},

	getPlugins : function(required) {
		return this.plugins.filter(function(plugin) {
			return (Object.isUndefined(required) || (required && this.pluginsRequired.get(plugin.key)) || (!required && !this.pluginsRequired
					.get(plugin.key)));
		}, this);
	},

	sort : function() {
		log.info("Plugins:: Tri des plugins");
		this.plugins = this.plugins.sortBy(function(plugin) {
					return plugin.order;
				});
	},

	checkRequired : function() {
		log.info("Plugins:: Vérification des plugins requis");
		var error = false;
		this.pluginsRequired.keys().each(function(plugin) {
					if (!this.pluginsLoaded.get(plugin)) {
						log.error("Plugin::checkRequired => plugin " + plugin + " missing");
						error = true;
					}
				}, this);
		if (error) {
			throw "Plugins manquant";
		}
	},

	doParserDateAndPlaceGroupHelper : function(key, me, data) {
		this.plugin[me.key] = GedcomParser.getChilds(data, key).collect(function(o) {
					return GedcomParser.extractDateAndPlace(o);
				}, this);
	},

	doWriterDateAndPlaceGroupHelper : function(data, scope) {
		var d = data.plugin[this.key];
		return d && d.length > 0
				? GedcomPlugins.displayData(d, GedcomPlugins.displayDateAndPlace.bind(scope))
				: null;
	},

	doParserDateAndPlaceHelper : function(key, me, data) {
		this.plugin[me.key] = GedcomParser.extractDateAndPlace(GedcomParser.getChild(data, key));
	},

	doWriterDateAndPlaceHelper : function(data, scope) {
		return GedcomPlugins.displayDateAndPlace(data.plugin[this.key]);
	},

	doWriterGroupHelper : function(data, scope) {
		var d = data.plugin[this.key];
		return d && d.length > 0 ? GedcomPlugins.displayData(d) : null;
	},

	displayNotes : function(notes) {
		return GedcomPlugins.displayData(notes, function(n) {
					if (n.match(new RegExp("@N[0-9]+@"))) {
						return parser.getData(n).text.replace(new RegExp("\n", "g"), "<br/>");
					} else {
						return n;
					}
				});
	},

	displaySources : function(notes) {
		return GedcomPlugins.displayData(notes, function(n) {

					if (n.match(new RegExp("@.+@"))) {
						var o = parser.getData(n);
						var s = [];
						if (o.title) {
							s.push("<b>" + GedcomLang.$.plugins.helper.source.title + " :</b> " + o.title);
						}
						if (o.abbr) {
							s.push("<b>" + GedcomLang.$.plugins.helper.source.titleAbbr + " :</b> " + o.abbr);
						}
						if (o.auth) {
							s.push("<b>" + GedcomLang.$.plugins.helper.source.author + " :</b> " + o.auth);
						}
						if (o.publ) {
							s.push("<b>" + GedcomLang.$.plugins.helper.source.dateAndPlace + " :</b> " + o.publ);
						}
						if (o.text) {
							s.push("<b>" + GedcomLang.$.plugins.helper.source.text + " :</b> " + o.text);
						}
						if (o.notes && o.notes.length > 0) {
							s.push("<b>" + GedcomLang.$.plugins.helper.source.notes + " :</b> <span class='childs'>"
									+ GedcomPlugins.displayNotes(o.notes) + "</span>");
						}
						return s.join("<br/>");
					} else {
						return n;
					}

				});
	},

	displayDateAndPlace : function(n) {
		if (null == n) {
			return null;
		}

		var fn = function(n) {
			var shtml = [];
			if (n.value) {
				switch (n.value) {
					case "Y" :
						shtml.push(GedcomLang.$.common.yes);
						break;

					case "N" :
						shtml.push(GedcomLang.$.common.no);
						break;

					default :
						shtml.push(n.value);
				}
				shtml.push("<br/>");
			}
			if (n.date) {
				shtml.push(GedcomLang.$.common.when + " " + n.date);
			}
			if (n.age) {
				shtml.push("(" + GedcomLang.$.plugins.helper.dateAndPlace.age + " " + n.age + ")");
			}
			if (n.place) {
				shtml.push(GedcomLang.$.common.where + " " + GedcomPlugins.displayLocation(n.place, true));
			}
			if (n.address) {
				shtml.push("<div style='margin-top:5px;'><b>" + GedcomLang.$.plugins.helper.dateAndPlace.address
						+ " :</b><br/>" + GedcomPlugins.displayLocation(n.address, false))
						+ "</div>";
			}
			if (n.source) {
				shtml.push("<div style='margin-top:5px;'><b>" + GedcomLang.$.plugins.helper.dateAndPlace.source
						+ " :</b>" + parser.getData(n.source).text)
						+ "</div>";
			}
			if (n.notes && n.notes.length > 0) {
				shtml.push("<div style='margin-top:5px;'><b>" + GedcomLang.$.plugins.helper.dateAndPlace.notes
						+ " :</b><div class='childs'>" + GedcomPlugins.displayNotes(n.notes) + "</div>" + "</div>");
			}
			return shtml.join(" ");
		}.bind(this);

		return GedcomPlugins.displayData(n, fn);
	},

	displayLocation : function(s, linkInline) {
		var id = GedcomToolbox.id("address");
		var html = [];
		html.push("<span id='" + id + "'>" + s + "</span>");
		if (GedcomConst.SHOW_GEOLOC) {
			html.push(linkInline ? " " : "<br/>");
			html.push('<a href="javascript:void(0);" onclick="GedcomToolbox.displayAddress(\'' + id
					+ '\');" id="mapLink' + id + '">' + GedcomLang.$.plugins.helper.dateAndPlace.displayMap + '</a>');
			html.push('<iframe id="map' + id + '" style="display:none;width:100%;height:400px;"></iframe>');
			html.push(linkInline ? " " : "<br/>");
		}
		return html.join("");
	},

	displayData : function(n, fn) {
		fn = fn ? fn : function(o) {
			return o;
		};
		if (Object.isArray(n)) {
			if (0 == n.length) {
				return null;
			}
			n = n.compact();
			if (n.length > 1) {
				return "<ul>" + $A(n).collect(function(o) {
							return "<li>" + fn(o) + "</li>";
						}, this).join("") + "</ul>";
			} else {
				return fn(n[0]);
			}
		} else {
			return fn(n);
		}
	}
};

var Plugin = Class.create();
Plugin.prototype = {
	key : null,
	name : null,
	order : 5000,
	active : true,

	initialize : function(data) {
		try {
			// Initialisation des données
			Object.extend(this, data);
			this.name = GedcomLang.$.plugins[this.key] && GedcomLang.$.plugins[this.key].title || this.key;
			GedcomPlugins.addPlugin(this);
		} catch (e) {
			log.error("Plugin::initialize", e);
		}
	},

	parser : function(p, data) {
		try {
			if (Object.isFunction(this.doParser)) {
				this.doParser.call(p, this, data);
			}
		} catch (e) {
			log.error("Plugin::" + this.key + "::parser", e);
		}
	},

	writer : function(data, scope) {
		try {
			if (Object.isFunction(this.doWriter)) {
				return this.doWriter.call(this, data, scope);
			} else {
				return data.plugin[this.key];
			}
		} catch (e) {
			log.error("Plugin::" + this.key + "::writer", e);
		}
	},

	inject : function(p, parser) {
		try {
			if (Object.isFunction(this.doInject)) {
				this.doInject.call(p, this, parser);
			}
		} catch (e) {
			log.error("Plugin::" + this.key + "::inject", e);
		}
	}

};

new Plugin({
			order : 50,
			key : "privacy",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChild(data, "RESN", true);
			}
		});

new Plugin({
			order : 1000,
			key : "sexe",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChild(data, "SEX", true);
			},
			doWriter : function(data, scope) {
				var s = data.plugin[this.key];
				var r = ["<img src='resources/" + GedcomToolbox.getSexeImage(s) + "'/>"];
				switch (s) {
					case "M" :
						r.push(GedcomLang.$.plugins.sexe.M);
						break;

					case "F" :
						r.push(GedcomLang.$.plugins.sexe.F);
						break;

					case "U" :
					default :
						r.push(GedcomLang.$.plugins.sexe.U);
				}
				return r.join(" ");
			}
		});

new Plugin({
			order : 1050,
			key : "name",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChilds(data, "NAME", true);
			},
			doWriter : GedcomPlugins.doWriterGroupHelper
		});

new Plugin({
			order : 1100,
			key : "prenom",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChild(GedcomParser.getChild(data, "NAME"), "GIVN", true);
			}
		});

new Plugin({
			order : 1150,
			key : "surn_prefix",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChild(GedcomParser.getChild(data, "NAME"), "SPFX", true);
			}
		});

new Plugin({
			order : 1200,
			key : "nomjf",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChild(GedcomParser.getChild(data, "NAME"), "SURN", true);
			}
		});

new Plugin({
			order : 1250,
			key : "name_suffix",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChild(GedcomParser.getChild(data, "NAME"), "NSFX", true);
			}
		});

new Plugin({
			order : 1300,
			key : "nom",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChild(GedcomParser.getChild(data, "NAME"), "_MARNM", true);
			}
		});

new Plugin({
			order : 1350,
			key : "nickname",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChild(GedcomParser.getChild(data, "NAME"), "NICK", true);
			}
		});

new Plugin({
			order : 1400,
			key : "birt",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("BIRT"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 1450,
			key : "deat",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("DEAT"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 1500,
			key : "burri",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("BURRI"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 1550,
			key : "crem",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("CREM"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 1600,
			key : "prob",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("PROB"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 1650,
			key : "will",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("WILL"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 2000,
			key : "familleParent",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChild(data, "FAMC", true);
			},
			doInject : function(me, parser) {
				if (this.plugin[me.key]) {
					this.plugin[me.key] = parser.getData(this.plugin[me.key]);
				}
			},
			doWriter : function(data, scope) {
				var d = data.plugin[this.key];
				return null == d ? null : GedcomPlugins.displayData([d.husb, d.wife], scope.createHtmlLink
								.bind(scope));
			}
		});

new Plugin({
			order : 2050,
			key : "adop",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("ADOP"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 2100,
			key : "nmr",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("NMR"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 2150,
			key : "familles",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChilds(data, "FAMS", true);
			},
			doInject : function(me, parser) {
				if (this.plugin[me.key]) {
					this.plugin[me.key] = this.plugin[me.key].collect(function(famille) {
								return parser.getData(famille);
							}, this);
				}
			},
			doWriter : function(data, scope) {
				return GedcomPlugins.displayData(data.plugin[this.key], function(f) {
							var s = [];

							if (f.husb && f.husb.id != data.id) {
								s.push(scope.createHtmlLink(f.husb, f));
							}

							if (f.wife && f.wife.id != data.id) {
								s.push(scope.createHtmlLink(f.wife, f));
							}

							if (f.childs.length > 0) {
								s.push("<div class='childs'>");
								{
									if (f.marr) {
										s.push("<b>" + GedcomLang.$.plugins.familles.marriage + " :</b> "
												+ GedcomPlugins.displayDateAndPlace(f.marr) + "<br/>");
									}
									s.push("<b>" + f.childs.length + " " + GedcomLang.$.plugins.familles.children + " :</b>");
									{
										s.push("<div class='childs'>");
										s.push(GedcomPlugins.displayData(f.childs, function(c) {
													return scope.createHtmlLink(c);
												}));
										s.push("</div>");
									}
								}
								s.push("</div>");
							}
							return s.join(" ");
						}.bind(this));
			}
		});

new Plugin({
			order : 2200,
			key : "familleParentChilds",
			doWriter : function(data, scope) {
				var p = data.getValue("familleParent");
				return p && p.childs.length > 0 ? GedcomPlugins.displayData(p.childs.filter(function(c) {
									return c.id != data.id;
								}, this), function(c) {
							return this.createHtmlLink(c);
						}.bind(scope)) : null;
			}
		});

new Plugin({
			order : 2250,
			key : "nchi",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("NCHI"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 3000,
			key : "even",
			doParser : function(me, data) {
				var d = [];
				GedcomParser.getChilds(data, "EVEN").each(function(event) {
							var t = GedcomParser.extractDateAndPlace(event);
							if (t) {
								t.type = GedcomParser.getChild(event, "TYPE", true);
								d.push(t);
							};
						}, this);
				this.plugin[me.key] = d;
			},
			doWriter : function(data, scope) {
				var d = data.plugin[this.key];
				return d && d.length > 0 ? GedcomPlugins.displayData(d, function(event) {
							var s = [];
							s.push(event.type);
							s.push(GedcomPlugins.displayDateAndPlace(event));
							return s.compact().join(" ");
						}.bind(scope)) : null;
			}
		});

new Plugin({
			order : 3050,
			key : "dscr",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("DSCR"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 3100,
			key : "cens",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("CENS"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 4000,
			key : "ssn",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChilds(data, "SSN", true);
			},
			doWriter : GedcomPlugins.doWriterGroupHelper
		});

new Plugin({
			order : 4050,
			key : "resi",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("RESI"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 4100,
			key : "prop",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("PROP"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 5000,
			key : "grad",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("GRAD"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 5050,
			key : "educ",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("EDUC"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 5100,
			key : "occu",
			doParser : function(me, data) {
				var d = [];
				GedcomParser.getChilds(data, "OCCU").each(function(occu) {
							var t = GedcomParser.extractDateAndPlace(occu);
							if (t) {
								t.type = occu.value;
								d.push(t);
							};
						}, this);
				this.plugin[me.key] = d;
			},
			doWriter : function(data, scope) {
				var d = data.plugin[this.key];
				return d && d.length > 0 ? GedcomPlugins.displayData(d, function(event) {
							var s = [];
							s.push(event.type);
							s.push(GedcomPlugins.displayDateAndPlace(event));
							return s.compact().join(" ");
						}.bind(scope)) : null;
			}
		});

new Plugin({
			order : 5150,
			key : "reti",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("RETI"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 6000,
			key : "nati",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("NATI"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 6050,
			key : "emig",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("EMIG"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 6100,
			key : "immi",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("IMMI"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 6150,
			key : "natu",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("NATU"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 7000,
			key : "reli",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("RELI"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 7050,
			key : "fcom",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("FCOM"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 7100,
			key : "chr",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("CHR"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 7150,
			key : "chra",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("CHRA"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 7200,
			key : "bapt",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("BAPT"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 7250,
			key : "conf",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("CONF"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 7300,
			key : "bles",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("BLES"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 7350,
			key : "ordi",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("ORDI"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 7400,
			key : "ordn",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("ORDN"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 8000,
			key : "barm",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("BARM"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 8050,
			key : "bars",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("BASM"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 9000,
			key : "bapl",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("BAPL"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 9050,
			key : "conl",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("CONL"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 9100,
			key : "endl",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("ENDL"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 9150,
			key : "slgc",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("SLGC"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 9200,
			key : "slgs",
			doParser : GedcomPlugins.doParserDateAndPlaceGroupHelper.curry("SLGS"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceGroupHelper
		});

new Plugin({
			order : 10000,
			key : "cast",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("CAST"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 10050,
			key : "titl",
			doParser : GedcomPlugins.doParserDateAndPlaceHelper.curry("TITL"),
			doWriter : GedcomPlugins.doWriterDateAndPlaceHelper
		});

new Plugin({
			order : 20000,
			key : "sources",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChilds(data, "SOUR", true);
			},
			doWriter : function(data, scope) {
				var d = data.plugin[this.key];
				return d && d.length > 0 ? GedcomPlugins.displaySources(d) : null;
			}
		});

new Plugin({
			order : 20050,
			key : "notes",
			doParser : function(me, data) {
				this.plugin[me.key] = GedcomParser.getChilds(data, "NOTE", true);
			},
			doWriter : function(data, scope) {
				var d = data.plugin[this.key];
				return d && d.length > 0 ? GedcomPlugins.displayNotes(d) : null;
			}
		});

new Plugin({
			order : 20100,
			key : "obje",
			doParser : function(me, data) {
				var d = [];
				GedcomParser.getChilds(data, "OBJE").each(function(n) {
							// On ignore les objets avec une référence
							if (n.value) {
								return;
							}
							d.push({
										form : GedcomParser.getChild(n, "FORM", true),
										title : GedcomParser.getChild(n, "TITL", true),
										file : GedcomParser.getChild(n, "FILE", true)
									});
						}, this);

				this.plugin[me.key] = d;
			},
			doWriter : function(data, scope) {
				var d = data.plugin[this.key];
				return d && d.length > 0 ? GedcomPlugins.displayData(d, function(n) {
							switch (n.form.toLowerCase()) {
								case "url" :
									return "<a href='" + n.file + "' target='_blank'>" + n.title + "</a>";
									break;

								case "bmp" :
								case "gif" :
								case "jpeg" :
									return "<img src='" + GedcomConst.path.RESSOURCE_PATH + n.file + "'/>";
									break;

								default :
									return "<a href='" + GedcomConst.path.RESSOURCE_PATH + n.file + "' target='_blank'>" + n.title
											+ "</a>";
									break;

							}
						}) : null;
			}
		});

// LISTE DES PLUGINS POSSIBLES
// ABBR {abbreviation} : titre abrégé, description abrégée ou nom abrégé.
// ADDR {address} : adresse postale d'un individu, de l'auteur d'un fichier, d'une entreprise, d'une école,
// etc
// ADR1 {address1} : première ligne d'une adresse
// ADR2 {address2} : deuxième ligne d'une adresse
// ADOP {adoption} : création du lien enfant-parent quand il n'existe pas de lien biologique.
// AFN {AFN} : numéro unique et permanent du fichier Ancestral File qui contient les informations relatives à
// l'individu
// AGE {age} : âge de l'individu au moment de l'événement ou âge qui figure dans le document.
// AGNC {agency} : institution ou individu responsable ou décisionnaire
// ALIA {alias} : indicateur qui associe des informations différentes sur une personne.
// ANCE {ancestors} : ancêtres d'un individu
// ANCI {ances_interest} : indique un intérêt à rechercher des informations complémentaires sur les ancêtres
// d'un individu (voir DESI)
// ANUL {annulment} : déclaration de nullité d'un mariage (comme s'il n'avait pas eu lieu)
// ASSO {associates} : indicateur qui relie des amis, des voisins, des parents ou d'autres personnes à un
// individu
// AUTH {author} : nom de la personne qui a relevé les informations ou qui a constitué le fichier
// BAPL {baptism-LDS} : baptême de l'Eglise des Mormons (à partir de l'âge de huit ans)
// BAPM {baptism}: baptême (non Mormon, voir aussi BAPL et CHR)
// BARM {bar_mitzvah} : cérémonie juive qui a lieu pour les garçons à l'âge de 13 ans
// BASM {bas_mitzvah}: cérémonie juive qui a lieu pour les filles à l'âge de 13 ans, aussi appelée "Bat
// Mitzvah."
// BIRT {birth} : naissance
// BLES {blessing} : bénédiction religieuse
// BLOB {binary_object} : ensemble de données utilisé par un système multimédia qui gére des données binaires
// qui représentent des images, du son et de la vidéo.
// BURI {burial} : sépulture
// CALN {call_number} : numéro dans un répertoire qui sert à identifier une pièce dans une collection.
// CAST {caste} : rang ou statut d'un individu dans une société, selon des critères raciaux ou religieux, des
// critères de richesse ou autres
// CAUS {cause} : description de la cause de l'événement ou du fait associé, cause du décès par exemple.
// CENS {census} : recensement de population
// CHAN {change} : correction ou modification; en relation avec une DATE qui indique quand le changement est
// survenu.
// CHAR {character} : indique le jeu de caractères utilisé pour l'écriture des informations dans le fichier.
// CHIL {child} : enfant naturel ou adopté
// CHR {christening} : baptême religieux (non Mormon) d'un enfant.
// CHRA {adult_christening} : baptême religieux (non Mormon) d'une personne adulte.
// CITY {city} : ville ou village
// CONC {concatenation} : indicateur de continuation des informations qui précédent. Ces informations doivent
// être mises à la suite de celles qui précédent sans espace ni retour au début de ligne. La coupure avec les
// informations précédentes doit être faite au milieu d'un champ et non pas sur un espace (l'espace est un
// délimiteur GEDCOM).
// CONF {confirmation} : confirmation - cérémonie religieuse (non Mormon) par laquelle un individu acquiert la
// qualité de membre à part entière de son Eglise.
// CONL {confirmation_l} : confirmation (cérémonie religieuse par laquelle un individu devient membre de
// l'Eglise des Mormons)
// CONT {continued} : indicateur de continuation des informations qui précédent, après un retour à la ligne.
// COPR {copyright} : protection des informations contre la reproduction et la diffusion.
// CORP {corporate} : nom d'une entreprise, d'une institution ou autre.
// CREM {cremation} : incinération du corps d'un individu décédé.
// CTRY {country} : nom ou code du pays
// DATA {data} : informations stockées automatiquement.
// DATE {date} : date d'un événement au format prévu pour les dates
// DEAT {death} : décès
// DESC {descendants} : descendance d'un individu
// DESI {descendant_int} : indique un intérêt à rechercher des descendants de l'individu (voir aussi ANCI)
// DEST {destination} : système ou programme destinataire des données.
// DIV {divorce} : dissolution du mariage
// DIVF {divorce_filed} : dossier de divorce d'un époux
// DSCR {phy_description} : caractères physiques de description d'une personne, d'un lieu ou d'une chose
// EDUC {education} : niveau d'instruction
// EMIG {emigration} : départ de son pays avec l'intention de résider ailleurs.
// ENDL {endowment} : dotation (sacrement de l'Eglise des Mormons reçu par un individu dans un temple).
// ENGA {engagement} : fiancailles
// EVEN {event} : événement intéressant à propos d'un individu, d'un groupe ou d'une organisation
// FAM {family} : association d'un homme, d'une femme et de leurs enfants selon la loi ou les coutumes, ou
// famille créée par la naissance d'un enfant d'un père et d'une mère biologiques.
// FAMC {family_child} : indique la famille à laquelle un enfant appartient
// FAMF {family_file} : nom d'un fichier de familles de l'Eglise des Mormons
// FAMS {family_spouse} : indique la famille dans laquelle l'individu est l'un des conjoints
// FCOM {first_communion} : cérémonie religieuse de première communion
// FILE {file} : unité de conservation d'informations classées pouvant être référencées.
// FORM {format} : nom donné à un format dans lequel des informations peuvent être transcrites
// GEDC {gedcom} : information sur l'utilisation de la norme GEDCOM dans un fichier.
// GIVN {given_name} : prénom
// GRAD {graduation} : diplôme ou certificat
// HEAD {header} : identification des informations du fichier GEDCOM
// HUSB {husband} : individu marié ou père
// IDNO {ident_number} : numéro d'identification d'une personne dans un fichier, une source ou un système
// externe
// IMMI {immigration} : arrivée dans un nouveau lieu avec intention d'y résider
// INDI {individual} : une personne
// LANG {language} : langage utilisé dans le fichier
// LEGA {legatee} : légataire
// MARB {marriage_bann} : publication des bans de mariage
// MARC {marr_contract} : contrat de mariage
// MARL {marr_license} : autorisation légale de mariage
// MARR {marriage} : création d'une famille
// MARS {marr_settlement} : convention, contrat avant mariage
// MEDI {media} : information sur le support des données stockées
// NAME {name} : mot ou ensemble de mots utilisés pour l'identification d'un individu, d'un titre, etc. Il
// faut utiliser plusieurs lignes NAME pour les personnes qui ont des noms multiples.
// NATI {nationality} : nationalité d'une personne
// NATU {naturalization} : obtention de la nationalité
// NCHI {children_count} : nombre d'enfants du parent (tous mariages confondus) s'il s'agit d'un individu ou
// de la famille s'il s'agit d'une famille.
// NICK {nickname} : surnom
// NMR {marriage_count} : nombre de mariages de la personne
// NOTE {note} : informations complémentaires ajoutées pour la compréhension des données
// NPFX {name_prefix} : texte ou titre qui apparait avant le nom d'une personne (Docteur, Général,
// Monseigneur...)
// NSFX {name_suffix} : texte qui apparait après le nom (Junior ou fils, par exemple)
// OBJE {object} : référence aux données utilisées comme description (généralement un enregistrement audio,
// une photo ou une vidéo)
// OCCU {occupation} : profession
// ORDI {ordinance} : sacrement religieux en général
// ORDN {ordination} : ordination religieuse
// PAGE {page} : numéro ou description de l'endroit où l'information se trouve dans un ouvrage référencé
// PEDI {pedigree} : Information relative à l'individu dans un tableau d'ascendance.
// PHON {phone} : numéro de téléphone
// PLAC {place} : lieu de l'événement
// POST {postal_code} : code postal
// PROB {probate} : validation d'un testament
// PROP {property} : biens et possessions
// PUBL {publication} : date et lieu de publication d'un ouvrage
// QUAY {quality_of-data} : degré de confiance à accorder à une information
// REFN {reference} : description ou numéro d'identification d'un fichier ou de tout autre objet pouvant être
// référencé
// RELA {relationship} : valeur du lien dans le contexte
// RELI {religion} : religion
// REPO {repository} : établissement ou personne dépositaire de l'information
// RESI {residence} : domicile
// RESN {restriction} : indicateur d'accès restreint ou interdit à une information
// RETI {retirement} : retraite
// RFN {rec_file_number} : numéro permanent affecté à un enregistrement pour l'identifier de manière unique
// dans un fichier
// RIN {rec_id_number} : numéro affecté à un enregistrement automatiquement par un système émetteur qui est
// utilisé pour identifier cet enregistrement dans les résultats produits par un système récepteur
// ROLE {role} : rôle joué par un individu dans un événement
// SEX {sex} : sexe
// SLGC {sealing_child} : scellement d'un enfant à ses parents (cérémonie de l'Eglise des Mormons)
// SLGS {sealing_spouse} : scellement d'un mari et d'une femme (cérémonie de l'Eglise des Mormons)
// SOUR {source} : document d'origine ou source initiale de l'information
// SPFX {surn_prefix} : partie d'un nom de famille qui n'est pas indexée
// SSN {soc_sec_number} : numéro de sécurité sociale
// STAE {state} : état (division géographique ou juridictionnelle)
// STAT {status} : état (condition)
// SUBM {submitter} : individu ou organisation qui fournit les données généalogiques
// SUBN {submission} : ensemble de données à traiter
// SURN {surname} : nom de famille
// TEMP {temple} : nom ou code d'identification d'un temple de l'Eglise des Mormons
// TEXT {text} : texte exact provenant d'un document original
// TIME {time} : heures (entre 0 et 24), minutes et secondes séparées par les deux points (:). Secondes et
// centièmes de secondes sont optionnels.
// TITL {title} : description d'un ouvrage, comme le titre d'un livre; titre de noblesse ou titre honorifique
// pour un individu
// TRLR {trailer} : marque de fin d'un fichier GEDCOM
// TYPE {type} : définition complémentaire de l'identificateur précédent.
// VERS {version} : indique la version d'un produit, d'un composant ou d'un ouvrage utilisé ou référencé
// WIFE {wife} : épouse
// WILL {will} : testament (voir aussi PROB)

// FIN DE LA LISTE
