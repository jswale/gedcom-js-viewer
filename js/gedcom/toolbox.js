/* Required : GedcomConst */
/* Required : GedcomLang */
var GedcomToolbox = {

	idSeed : 100,

	id : function(prefix) {
		return (prefix || "") + ++this.idSeed;
	},

	getSexeImage : function(s) {
		switch (s) {
			case "M" :
				return "male.png";
			case "F" :
				return "female.png";
			default :
				return "unknown.png";
		}
	},

	getQueryParameter : function(parameterName) {
		var queryString = window.top.location.search.substring(1);
		var parameterName = parameterName + "=";
		if (queryString.length > 0) {
			begin = queryString.indexOf(parameterName);
			if (begin != -1) {
				begin += parameterName.length;
				end = queryString.indexOf("&", begin);
				if (end == -1) {
					end = queryString.length;
				}
				return unescape(queryString.substring(begin, end));
			}
		}
		return null;
	},

	displayAddress : function(id) {
		var o = $("map" + id);
		if (o.visible()) {
			o.hide();
			$("mapLink" + id).update(GedcomLang.$.plugins.helper.dateAndPlace.displayMap);
		} else {
			if (o.src == "") {
				var q = $(id).innerHTML.replace(new RegExp("<br\/?>", "g"), " ");
				o.src = "http://maps.google.fr/maps?&q=" + q + "&output=embed";
			}
			o.show();
			$("mapLink" + id).update(GedcomLang.$.plugins.helper.dateAndPlace.hideMap);
		}
	},

	show : function(id) {
		var query = id || GedcomToolbox.getQueryParameter(GedcomConst.QUERY_PARAM)
				|| parser.DATAS.find(function(d) {
							return d.value.type == GedcomConst.indicator.famille;
						})[0];

		var p = parser.getData(query);
		if (!p) {
			return;
		}
		viewer.setRoot(p);

		switch (p.type) {
			case GedcomConst.indicator.personne :
				viewer.openDetail(p);
				break;

			case GedcomConst.indicator.famille :
				$(GedcomConst.id.DETAIL_ID).hide();
				break;
		}
	}

};

var log = {

	debug : function(t) {
		if (GedcomConst.logLevel <= GedcomConst.logLevels.DEBUG) {
			this.display(GedcomConst.logLevels.DEBUG, t);
		}
	},
	info : function(t) {
		if (GedcomConst.logLevel <= GedcomConst.logLevels.INFO) {
			this.display(GedcomConst.logLevels.INFO, t);
		}
	},
	warn : function(t) {
		if (GedcomConst.logLevel <= GedcomConst.logLevels.WARN) {
			this.display(GedcomConst.logLevels.WARN, t);
		}
	},
	error : function(t, error) {
		if (GedcomConst.logLevel <= GedcomConst.logLevels.ERROR) {
			this.display(GedcomConst.logLevels.ERROR, t);
		}
		console.log(error);
	},

	display : function log(level, t) {
		if(!GedcomConst.SHOW_LOG) {
			return;
		}

		var c = "&#160;";
		if (null != t) {

			// Calcul de la date;
			var d = new Date();
			var dts = [2, 2, 2, 3];
			var dt = [d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()].collect(function(v, i) {
						v = v.toString();
						return $R(v.length, dts[i], true).collect(function() {
									return "0";
								}).join("") + v;
					}, this).join(":");

			var lt;
			switch (level) {
				case GedcomConst.logLevels.DEBUG :
					lt = "DEBUG";
					break;
				case GedcomConst.logLevels.INFO :
					lt = "INFO";
					break;
				case GedcomConst.logLevels.WARN :
					lt = "WARN";
					break;
				case GedcomConst.logLevels.ERROR :
					lt = "ERROR";
					break;
			}

			//
			c = "[" + dt + "]&#160;[" + lt + "]&#160;" + t;
		}
		$(GedcomConst.id.LOG_ID).appendChild(new Element("div").addClassName(lt).update(c));
	}
};