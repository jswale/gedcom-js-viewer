/* Required : GedcomToolbox */
/* Required : GedcomConst */
/* Required : GedcomLang */
var GedcomParser = Class.create();
GedcomParser.prototype = {

	// Variables privées
	DATAS : null,

	initialize : function() {
	},

	load : function(file) {
		log.info();
		log.info("Parser::Loading " + file);
		new Ajax.Request(file, {
					method: 'GET',
					onSuccess : function(response) {
						log.debug("loading ok");
						this.parse(response.responseText);
					}.bind(this)
				});
	},

	node : function(type, value, level) {
		return {
			value : value,
			type : type,
			level : level,
			childs : []
		};
	},

	parse : function(gedcom) {
		var lines = gedcom.match(/[^\r\n]+/g);
		log.debug(lines.length + " lines extracted");

		// Create root node
		var data = this.node(null, null);

		// Initialise parents
		var parents = [data];

		// Previous node level
		var _level = null;

		$A(lines).each(function(line, i) {
					var current = this.extract(line, i);

					// Erreur de traitement de la ligne
					if (null == current) {
						return;
					}

					// Réduction de la liste des parents
					if (null != _level && current.level <= _level) {
						$R(current.level, _level).each(function() {
									parents.pop();
								}, this);
					}

					// Recherche du dernier parent
					parent = parents[parents.length - 1];

					if (current.ident == GedcomConst.indicator.append || current.ident == GedcomConst.indicator.newLine) {
						node = parent;
						var key = (node.level == 0) ? "text" : "value";

						var v = current.value || "";
						if (Object.isUndefined(node[key])) {
							node[key] = v;
						} else {
							node[key] += (current.ident == GedcomConst.indicator.newLine ? "<br/>" : "") + v;
						}

					} else {
						// Nouveau noeud
						var node = this.node(current.ident, current.value, current.level);

						// Ajout du nouveau noeud au parent
						parent.childs.push(node);
					}

					// Ajout du dernier noeud en tant que parent
					parents.push(node);

					// Mémorisation du niveau du noeud
					_level = current.level;
				}, this);

		// analyze
		this.analyze(data);
	},

	extract : function(line, i) {
		var result = line.trim().match(/(\d) ([^ ]*) ?(.*)?/);
		// Ligne non conforme
		if (null == result) {
			return null;
		}
		result.shift();

		result = result.compact();
		return {
			level : result[0],
			ident : result[1],
			value : result[2]
		};
	},

	getData : function(id) {
		return this.DATAS.get(id);
	},

	analyze : function(data) {
		log.info();
		log.info("Parser::Extraction :");

		this.DATAS = $H();
		(data.childs || []).each(function(child, i) {
					try {

						var data = null;

						if (GedcomConst.indicator.personne == child.value) {
							data = new Personne(child);
						} else if (GedcomConst.indicator.famille == child.value) {
							data = new Famille(child);
						} else if (GedcomConst.indicator.source == child.value) {
							data = new Source(child);
						} else if (GedcomConst.indicator.note == child.value) {
							data = new Note(child);
						} else {
							log.warn("Parser::analyze -> unknow -> " + child.type
									+ (child.value ? ' (' + child.value + ')' : ''));
						}

						if (data) {
							this.DATAS.set(child.type, data);
						}

					} catch (e) {
						log.error("Parser::analyze -> each", e);
					}
				}, this);

		log.debug(this.DATAS.size() + " bloc chargés");

		// Post traitement
		var options = [];
		[GedcomConst.indicator.personne, GedcomConst.indicator.famille].each(function(type) {
					try {
						log.debug("Parser::analyze -> inject for " + type);
						this.DATAS.each(function(pair) {
									if (pair.value.type != type) {
										return;
									}
									try {
										if (Object.isFunction(pair.value.inject)) {
											pair.value.inject(this);
										}
										if (pair.value.type == GedcomConst.indicator.personne && pair.value.isPublic()) {
											options.push({
														text : pair.value.getDisplayName(GedcomLang.$.viewer.multipleNameSeparator),
														value : pair.value.id
													});
										}
									} catch (e) {
										log.error("Parser::analyze -> inject", e);
									}
								}, this);
					} catch (e) {
						log.error("Parser::inject -> each", e);
					}
				}, this);

		GedcomIHM.fillQuickValues(options);

		GedcomToolbox.show();

	}
};

GedcomParser.getChild = function(n, type, value) {
	if (null == n) {
		return null;
	}
	var v = (n.childs || []).find(function(c) {
				return c.type == type;
			});
	if (v && value) {
		v = v.value;
	}
	return v;
};

GedcomParser.getChilds = function(n, type, value) {
	var res = [];
	(n.childs || []).each(function(c) {
				if (c.type == type) {
					if (value) {
						res.push(c.value);
					} else {
						res.push(c);
					}
				}
			});
	return res;
};

GedcomParser.extractDateAndPlace = function(n) {
	if (null == n) {
		return null;
	}
	return {
		value : n.value,
		date : this.getChild(n, "DATE", true),
		place : this.getChild(n, "PLAC", true),
		address : this.getChild(n, "ADDR", true),
		age : this.getChild(n, "AGE", true),
		source : this.getChild(n, "SOUR", true),
		notes : this.getChilds(n, "NOTE", true)
	};
};