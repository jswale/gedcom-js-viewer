/* Required : GedcomConst */
/* Required : GedcomLang */
var GedcomIHM = {
	init : function() {
		$(GedcomConst.id.DETAIL_ID).hide();

		if (!GedcomConst.SHOW_LOG) {
			$(GedcomConst.id.LOG_ID).hide();
		}

		if (!GedcomConst.SHOW_DOWNLOAD) {
			$(GedcomConst.id.DOWNLOAD_ID).hide();
		}

		$(GedcomConst.id.CLOSE_DETAIL_ID).update(GedcomLang.$.index.close);
		$(GedcomConst.id.HISTORY_ID).firstDescendant().update(GedcomLang.$.index.history);
		$(GedcomConst.id.LOG_ID).firstDescendant().update(GedcomLang.$.index.log);
	},

	fillQuickValues : function(options) {
		var select = $(GedcomConst.id.QUICK_SELECT_ID);

		options = [{
					text : "--- " + GedcomLang.$.index.quickSelect + " ---",
					value : ""
				}].concat(options);

		options.each(function(option) {
					select.appendChild(new Element("option").update(option.text).writeAttribute("value", option.value));
				}, this);

	}
};