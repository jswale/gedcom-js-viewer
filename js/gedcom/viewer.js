/* Required : GedcomConst */
/* Required : GedcomLang */
/* Required : GedcomToolbox */
/* Required : GedcomPlugins */
var GedcomViewer = Class.create();
GedcomViewer.prototype = {

	// Constantes
	boxSpacerWidth : 20,
	boxSpacerHeight : 40,
	boxRadius : 10,
	boxBorderWidth : 2,
	boxMinWidth : 100,
	boxMinHeight : 20,

	sandBoxX : -500,
	sandBoxY : -500,

	margin : 10,
	textMargin : 5,

	arrow : true,

	font : "Arial",

	linkColor : "#EEEEEE",

	// Variables privées
	/** @private * */
	familleParentDim : null,
	/** @private * */
	parentDim : null,
	/** @private * */
	childsDim : null,
	/** @private * */
	canvas : null,
	/** @private * */
	history : null,
	/** @private * */
	detail : null,
	/** @private * */
	content : null,
	/** @private * */
	r : null,
	/** @private * */
	root : null,
	/** @private * */
	textSandbox : null,

	/**
	 * Constructeur
	 *
	 * @param id
	 *          identifier de l'element HTML où effectuer le rendu
	 */
	initialize : function() {
		this.canvas = $(GedcomConst.id.CANVAS_ID);
		this.history = $(GedcomConst.id.HISTORY_ID);
		this.detail = $(GedcomConst.id.DETAIL_ID);
		this.content = $(GedcomConst.id.CONTENT_ID);
		this.history.hide();
		this.detail.hide();

		GedcomPlugins.setRequired("familles");
		GedcomPlugins.setRequired("familleParent");
		GedcomPlugins.setRequired("sexe");
	},

	/**
	 * Positionne le noeud racide de l'arbre à afficher.
	 *
	 * @param {Personne /
	 *          Famille} : racine de type 'Personne' ou 'Famille'.
	 */
	setRoot : function(root) {
		log.info();
		log.info("View::Définition de la racine");

		var newRoot = root;

		// Recherche de la famille à afficher
		if (GedcomConst.indicator.personne == root.type) {
			if (root.getValue("familles").length > 0) {
				newRoot = root.getValue("familles")[0];
			} else if (root.getValue("familleParent")) {
				newRoot = root.getValue("familleParent");
			}
			this.history.appendChild(new Element("div").update(this.createHtmlLink(root)));
			this.history.show();
		}

		// Mise à jour de la racine
		if (this.root && (this.root.id == newRoot.id)) {
			return;
		} else {
			this.root = newRoot;
			location.hash = this.root.id;
		}

		// Clean
		if (this.canvas.hasChildNodes()) {
			while (this.canvas.childNodes.length >= 1) {
				this.canvas.removeChild(this.canvas.firstChild);
			}
		}

		// Création du canvas
		this.r = Raphael(this.canvas, this.width, this.height);
		this.textSandbox = this.r.text(this.sandBoxX, this.sandBoxY);

		// Début du traitement
		try {
			this.analyze();
			this.display();
			// this.addBorder();
		} catch (e) {
			log.error("Viewer::setRoot", e);
		}
		log.info("View::Fin d'affichage");
	},

	/**
	 * Analyse les données.
	 */
	analyze : function() {
		log.info("View::Analyse du noeud racine");

		var familleParent = [];
		var parents = [];
		var childs = [];

		var familleParentDimOffset = 0;

		// Si le Père existe
		if (this.root.husb) {
			// Création de la boite pour le père
			parents.push(this.addBox(this.root.husb, "P"));

			if (null != this.root.husb.getValue("familleParent")) {
				var gp = this.root.husb.getValue("familleParent").husb;
				if (gp) {
					familleParent.push(this.addBox(gp, "GP"));
				}

				var gm = this.root.husb.getValue("familleParent").wife;
				if (gm) {
					familleParent.push(this.addBox(gm, "GP"));
				}
			} else {
				familleParentDimOffset += this.getBlocDimensions(this.root.husb).width + this.boxSpacerWidth;
			}
		}

		if (this.root.wife) {
			parents.push(this.addBox(this.root.wife, "P"));

			if (null != this.root.wife.getValue("familleParent")) {
				var gp = this.root.wife.getValue("familleParent").husb;
				if (gp) {
					familleParent.push(this.addBox(gp, "GP"));
				}

				var gm = this.root.wife.getValue("familleParent").wife;
				if (gm) {
					familleParent.push(this.addBox(gm, "GP"));
				}
			}
		}

		for (var ic = 0; ic < this.root.childs.length; ic++) {
			childs.push(this.addBox(this.root.childs[ic], "C"));
		}

		// Calcul des Largeur / Hauteur
		{
			this.parentDim = this.getBlocDimensions(parents);
			this.parentDim.width += (parents.length - 1) * this.boxSpacerWidth;

			this.familleParentDim = this.getBlocDimensions(familleParent);
			this.familleParentDim.width += familleParentDimOffset + (familleParent.length - 1)
					* this.boxSpacerWidth;

			this.childsDim = this.getBlocDimensions(childs);
			this.childsDim.width += (childs.length - 1) * this.boxSpacerWidth;
		}
		// FIN ------

		log.debug("View::Détail de la racine :");
		log.debug("&#160;>&#160;" + familleParent.length + " grand parents");
		log.debug("&#160;>&#160;" + parents.length + " parents");
		log.debug("&#160;>&#160;" + childs.length + " enfants");

		var height = this.familleParentDim.height + this.boxSpacerHeight + this.parentDim.height
				+ this.boxSpacerHeight + this.childsDim.height;
		var width = Math.max(this.familleParentDim.width, this.parentDim.width, this.childsDim.width);
		this.r.setSize(this.margin * 2 + width, this.margin * 2 + height);
	},

	/**
	 * Créé une boîte pour une personne dans la sandbox
	 *
	 * @param {Personne} :
	 *          la personne à afficher
	 * @return {Personne} personne
	 */
	addBox : function(p, level) {
		log.debug("Création de (" + level + ") " + this.createHtmlLink(p), 1);
		p.box = {};

		var attrs = {
			open : {
				"img" : GedcomToolbox.getSexeImage(p.getValue("sexe")),
				"width" : 16,
				"height" : 16,
				"title" : GedcomLang.$.viewer.clickopen
			},
			tree : {
				"img" : null,
				"width" : 16,
				"height" : 16,
				"cursor" : "pointer",
				"title" : GedcomLang.$.viewer.clicknavigate
			},
			rect : {
				"stroke" : "#404040",
				"stroke-width" : this.boxBorderWidth,
				"stroke-opacity" : 0.75,
				"fill" : "#CECECE",
				"fill-opacity" : 0.75,
				"cursor" : "pointer",
				"title" : GedcomLang.$.viewer.dbclicknavigate
			}
		};

		switch (p.getValue("sexe")) {
			case "M" :
				attrs.rect.stroke = "#001E4C";
				attrs.rect.fill = "270-#B1C9ED-#698CB9";
				break;

			case "F" :
				attrs.rect.stroke = "#BF0000";
				attrs.rect.fill = "270-#F8C2E3-#EDB1B1";
				break;
		}

		if (p.isDead()) {
			attrs.rect['stroke'] = '#A0A0A0';
		}

		if ("GP" == level) {
			attrs.tree.img = "parent.png";
		}

		if ("C" == level && p.getValue("familles") && p.getValue("familles").length > 0) {
			attrs.tree.img = "childs.png";
		}

		var navigation = true;
		if (null == attrs.tree.img) {
			attrs.tree.height = 0;
			attrs.tree.width = 0;
			navigation = false;
		}

		if (!navigation) {
			delete attrs.rect.cursor;
			delete attrs.rect.title;
		}

		if (!p.isPublic()) {
			attrs.open.height = 0;
			attrs.open.width = 0;
			attrs.open.img = null;
		}

		var defaultTxtAttr = {
			"fill" : "#000",
			"font-size" : 14,
			"stroke-opacity" : 1,
			"text-anchor" : "middle",
			"cursor" : (navigation ? "pointer" : null),
			"title" : (navigation ? GedcomLang.$.viewer.dbclicknavigate : null)
		};

		var texts = p.getBoxText(defaultTxtAttr, navigation);
		var d = {
			width : 0,
			height : 0
		};
		texts.each(function(t) {
					if (t.txt) {
						var dim = this.getTextDimensions(t.txt, t.attrs);
						d.width = Math.max(d.width, dim.width);
						d.height += dim.height + this.textMargin;
					}
				}, this);
		if (d.height > 0) {
			d.height -= this.textMargin;
		}

		var w = Math.max(this.boxMinWidth, d.width);
		var h = Math.max(this.boxMinHeight, d.height);

		var imgs = ["open", "tree"];
		var imgH = 0;
		var imgW = 0;
		imgs.each(function(img) {
					var imgh = attrs[img].height;
					imgH += imgh + (imgh > 0 ? 2 : 0);
					imgW = Math.max(imgW, attrs[img].width);
				}, this);

		var x0 = this.sandBoxX;
		var y0 = this.sandBoxY;
		var W = w + this.textMargin * 2 + imgW;
		var H = Math.max(imgH, h) + this.textMargin * 2;

		p.box.rect = this.r.rect(x0, y0, W, H, this.boxRadius).attr(attrs.rect);

		var imgOffsetY = 4;
		if (null != attrs.open.img) {
			p.box.open = this.r.image("resources/" + attrs.open.img, x0 + W - imgW - 2, y0 + imgOffsetY,
					attrs.open.width, attrs.open.height).attr({
						"title" : attrs.open.title,
						"cursor" : "pointer"
					});
			p.box.open.node.onclick = function() {
				this.openDetail(p);
			}.bind(this);
		}

		imgOffsetY += 2 + attrs.open.height;

		if (attrs.tree.height > 0) {
			p.box.tree = this.r.image("resources/" + attrs.tree.img, x0 + W - imgW - 2, y0 + imgOffsetY,
					attrs.tree.width, attrs.tree.height).attr(attrs.tree);

			p.box.tree.node.onclick = function() {
				this.setRoot(p);
			}.bind(this);

		}

		var textOffsetX = w / 2;
		var textOffsetY = 0;

		texts.each(function(t) {
					var dim = this.getTextDimensions(t.txt, t.attrs);
					if (t.txt) {
						p.box["txt_" + t.key] = this.r.text(textOffsetX + this.textMargin + x0,
								this.textMargin + y0 + dim.height / 2 + textOffsetY, t.txt, this.r.getFont(this.font))
								.attr(t.attrs);
						textOffsetY += dim.height + this.textMargin;
					}
				}, this);

		// Navigation
		if (navigation) {
			[p.box.rect].compact().each(function(o) {
						o.node.ondblclick = function() {
							this.setRoot(p);
						}.bind(this);
					}, this);
		}

		return p;
	},

	/**
	 * Affiche l'arbre
	 */
	display : function() {
		log.info("View::Affichage de l'arbre");
		try {

			var yOffset = 0;
			// Cas des parents avec parents
			{
				var xOffsetFamilleParent = (this.r.width - this.familleParentDim.width) / 2;
				var yOffsetFamilleParent = 0;
				var yOffsetParent = 0;
				[this.root.husb, this.root.wife].each(function(p) {
							if (p) {
								if (null != p.getValue("familleParent")) {

									// Positionnement du GP
									var gp;
									var o = p.getValue("familleParent").husb;
									if (o) {
										gp = this.placeBox(o, xOffsetFamilleParent, 0);
										xOffsetFamilleParent += this.getBlocDimensions(gp).width + this.boxSpacerWidth;
										yOffsetFamilleParent = Math.max(yOffsetFamilleParent, this.getBlocDimensions(gp).height);
									}

									// Positionnement de la GM
									var gm;
									var o = p.getValue("familleParent").wife;
									if (o) {
										gm = this.placeBox(o, xOffsetFamilleParent, 0);
										xOffsetFamilleParent += this.getBlocDimensions(gm).width + this.boxSpacerWidth;
										yOffsetFamilleParent = Math.max(yOffsetFamilleParent, this.getBlocDimensions(gm).height);
									}

									// Positionnement du Fils
									this.placeBox(p, this.getParentX(p), this.boxSpacerHeight + this.familleParentDim.height);
									yOffsetParent = Math.max(yOffsetParent, this.getBlocDimensions(p).height);

									if (gp) {
										this.link(gp, p);
									}
									if (gm) {
										this.link(gm, p);
									}
								} else {
									xOffsetFamilleParent += this.getBlocDimensions(p).width + this.boxSpacerWidth;
								}
							}
						}, this);
				if (yOffsetFamilleParent > 0) {
					yOffsetFamilleParent += this.boxSpacerHeight;
				}
				yOffset += yOffsetFamilleParent;
			}

			// Cas des parents sans parents
			{
				if ((this.root.wife && null == this.root.wife.getValue("familleParent"))
						&& (this.root.husb && null == this.root.husb.getValue("familleParent"))) {

					var xOffsetParent = this.margin;

					var p = this.placeBox(this.root.husb, xOffsetParent, yOffset);
					xOffsetParent += this.getBlocDimensions(p).width + this.boxSpacerWidth;
					yOffsetParent = Math.max(yOffsetParent, this.getBlocDimensions(p).height);

					var m = this.placeBox(this.root.wife, xOffsetParent, yOffset);
					yOffsetParent = Math.max(yOffsetParent, this.getBlocDimensions(m).height);
				}
			}

			// Cas du mari sans parents
			{
				if ((this.root.husb && null == this.root.husb.getValue("familleParent"))
						&& (this.root.wife && null != this.root.wife.getValue("familleParent"))) {
					var offset = this.getBlocPosition(this.root.wife).x - this.boxSpacerWidth
							- this.getBlocDimensions(this.root.husb).width;

					this.placeBox(this.root.husb, offset, this.getBlocPosition(this.root.wife).y - this.margin);
				}
			}

			// Cas de la femme sans parents
			{
				if ((this.root.husb && null != this.root.husb.getValue("familleParent"))
						&& (this.root.wife && null == this.root.wife.getValue("familleParent"))) {

					var offset = this.getBlocPosition(this.root.husb).x + this.getBlocDimensions(this.root.husb).width
							+ this.boxSpacerWidth;

					this.placeBox(this.root.wife, offset, this.getBlocPosition(this.root.husb).y - this.margin);
				}
			}

			// Affichage du lien entre parents
			if (this.root.husb && this.root.wife) {
				this.link(this.root.husb, this.root.wife);
			}

			if (yOffsetParent > 0) {
				yOffsetParent += this.boxSpacerHeight;
			}
			yOffset += yOffsetParent;

			// Affichage des enfants
			if (this.root.childs.length > 0) {

				// Positionnement des enfants
				var xOffsetChilds = this.margin;
				for (var ic = 0; ic < this.root.childs.length; ic++) {
					var o = this.placeBox(this.root.childs[ic], xOffsetChilds, yOffset);
					xOffsetChilds += this.getBlocDimensions(o).width
							+ (ic < (this.root.childs.length - 1) ? this.boxSpacerWidth : 0);
				}

				// Alignement avec les parents
				var px;
				if (this.root.husb && this.root.wife) {
					px = (this.getBlocPosition(this.root.husb).x + this.getBlocPosition(this.root.wife).x + this
							.getBlocDimensions(this.root.husb).width)
							/ 2;
				} else if (this.root.husb) {
					px = (this.getBlocPosition(this.root.husb).x + this.getBlocDimensions(this.root.husb).width) / 2;
				} else if (this.root.husb) {
					px = (this.getBlocPosition(this.root.wife).x + this.getBlocDimensions(this.root.wife).width) / 2;
				}

				var xTranslate = Math.max(0, (px - (this.margin + xOffsetChilds) / 2));
				for (var ic = 0; ic < this.root.childs.length; ic++) {
					$H(this.root.childs[ic].box).each(function(pair) {
								pair.value.translate(xTranslate, 0);
							}, this);
				}

				// Ajout des lients
				for (var ic = 0; ic < this.root.childs.length; ic++) {
					this.link(this.root.childs[ic], [this.root.wife, this.root.husb]);
				}
			}

			// Vérification de la largeur
			var maxX = 0;
			var maxY = 0;
			if (this.root.husb && this.root.husb.getValue("familleParent")) {
				[this.root.husb.getValue("familleParent").husb, this.root.husb.getValue("familleParent").wife].each(
						function(o) {
							if (o) {
								maxX = Math.max(maxX, this.getBlocPosition(o).x + this.getBlocDimensions(o).width);
								maxY = Math.max(maxY, this.getBlocPosition(o).y + this.getBlocDimensions(o).height);
							}
						}, this);
			}

			if (this.root.wife && this.root.wife.getValue("familleParent")) {
				[this.root.wife.getValue("familleParent").husb, this.root.wife.getValue("familleParent").wife].each(
						function(o) {
							if (o) {
								maxX = Math.max(maxX, this.getBlocPosition(o).x + this.getBlocDimensions(o).width);
								maxY = Math.max(maxY, this.getBlocPosition(o).y + this.getBlocDimensions(o).height);
							}
						}, this);
			}

			if (this.root.husb) {
				maxX = Math.max(maxX, this.getBlocPosition(this.root.husb).x
								+ this.getBlocDimensions(this.root.husb).width);
				maxY = Math.max(maxY, this.getBlocPosition(this.root.husb).y
								+ this.getBlocDimensions(this.root.husb).height);
			}

			if (this.root.wife) {
				maxX = Math.max(maxX, this.getBlocPosition(this.root.wife).x
								+ this.getBlocDimensions(this.root.wife).width);
				maxY = Math.max(maxY, this.getBlocPosition(this.root.wife).y
								+ this.getBlocDimensions(this.root.wife).height);
			}

			if (this.root.childs.length > 0) {
				maxX = Math.max(maxX, this.getBlocPosition(this.root.childs[this.root.childs.length - 1]).x
								+ this.getBlocDimensions(this.root.childs[this.root.childs.length - 1]).width);
				$A(this.root.childs).each(function(c) {
							maxY = Math.max(maxY, this.getBlocPosition(c).y + this.getBlocDimensions(c).height);
						}, this);
			}
			maxX += this.margin;
			maxY += this.margin;

			this.r.setSize(maxX, maxY);
		} catch (e) {
			log.error("Viewer::display", e);
		}
	},

	/**
	 * Positionne le bloc d'une personne
	 *
	 * @param {Personne} :
	 *          personne à positionner
	 * @param {Long} :
	 *          offset en X par rapport à l'origine
	 * @param {Long} :
	 *          offset en Y par rapport à l'origine
	 * @return {Personne} p
	 */
	placeBox : function(p, oX, oY) {
		log.debug("&#160;>&#160;Positionnement de " + this.createHtmlLink(p));
		var hiddenOffsetX = -this.sandBoxX;
		var hiddenOffsetY = -this.sandBoxY;

		$H(p.box).each(function(pair) {
					pair.value.translate(hiddenOffsetX + oX, this.margin + hiddenOffsetY + oY);
				}, this);

		return p;
	},

	/**
	 * Affiche le lien entre deux personnes
	 *
	 * @param {Personne} :
	 *          personne source
	 * @param {Personne,Personne[]} :
	 *          personne(s) destination.
	 * @return {Element} ligne tracée
	 */
	link : function(s, d) {
		log.debug("&#160;>&#160;Création d'un lien depuis " + this.createHtmlLink(s));
		var p = [];

		var attrs = {
			stroke : this.linkColor,
			"stroke-width" : 2,
			"stroke-opacity" : 1,
			"arrow-end" : this.arrow ? "classic" : "none",
			"arrow-start" : this.arrow ? "classic" : "none"
		};

		if (Object.isArray(d)) {
			d = d.compact();
			if (1 == d.length) {
				d = d[0];
			}
		}

		if (!Object.isArray(d)) {
			// Same level
			if (this.getBlocPosition(s).y == this.getBlocPosition(d).y) {
				if (this.getBlocPosition(s).x > this.getBlocPosition(d).x) {
					var t = s;
					s = d;
					d = t;
				}

				// Recherche d

				attrs["stroke-width"] = 1;

				var ys = [0];
				if (this.root.marr) {
					ys.push(-(attrs['stroke-width'] + 2));
				}

				ys.each(function(offsetY) {
					p.push("M" + this.getBlocPosition(s).x + "," + (this.getBlocPosition(s).y + offsetY));
					p.push("m" + (this.boxBorderWidth / 2) + ",0");
					p.push("m" + this.getBlocDimensions(s).width + ","
							+ (Math.min(this.getBlocDimensions(s).height, this.getBlocDimensions(d).height) / 2));
					p
							.push("l"
									+ (this.getBlocPosition(d).x - this.getBlocPosition(s).x - this.getBlocDimensions(s).width - this.boxBorderWidth)
									+ ",0");
				}, this);

				delete attrs['arrow-end'];
				delete attrs['arrow-start'];

				// Père fils
			} else {
				if (this.getBlocPosition(s).y > this.getBlocPosition(d).y) {
					var t = s;
					s = d;
					d = t;
				}
				p.push("M" + this.getBlocPosition(s).x + "," + this.getBlocPosition(s).y);
				p.push("m" + (this.getBlocDimensions(s).width / 2) + "," + this.getBlocDimensions(s).height);
				p.push("m0," + (this.boxBorderWidth / 2));
				p.push("l0," + (this.boxSpacerHeight / 2));
				p
						.push("l0,"
								+ (this.getBlocPosition(d).y - this.getBlocPosition(s).y - this.getBlocDimensions(s).height - this.boxSpacerHeight));
				p.push("L" + ((this.getBlocPosition(d).x + this.getBlocDimensions(d).width / 2)) + ","
						+ (this.getBlocPosition(d).y - this.boxSpacerHeight / 2 + (this.boxBorderWidth / 2)));
				p.push("l0," + (this.boxSpacerHeight / 2 - this.boxBorderWidth / 2));

				delete attrs['arrow-start'];
			}
		} else {
			// Cas des parents
			if (this.getBlocPosition(d[0]).x > this.getBlocPosition(d[1]).x) {
				d.reverse();
			}
			var midx = this.getBlocPosition(d[1]).x
					- (this.getBlocPosition(d[1]).x - this.getBlocPosition(d[0]).x - this.getBlocDimensions(d[0]).width)
					/ 2;
			var midy = this.getBlocPosition(d[0]).y
					+ Math.min(this.getBlocDimensions(d[0]).height, this.getBlocDimensions(d[1]).height) / 2;

			p.push("M" + this.getBlocPosition(s).x + "," + this.getBlocPosition(s).y);
			p.push("m0,-" + (this.boxBorderWidth / 2));
			p.push("m" + (this.getBlocDimensions(s).width / 2) + ",0");
			p.push("l0,-" + (this.boxSpacerHeight / 2));
			p.push("L" + midx + ","
					+ (this.getBlocPosition(s).y - (this.boxSpacerHeight / 2) - (this.boxBorderWidth / 2)));
			p.push("L" + midx + "," + midy);

			delete attrs['arrow-end'];
		}

		if (0 == p.length) {
			return null;
		}

		return this.r.path(p.join("")).attr(attrs);
	},

	/**
	 * Ajoute une bordure à l'arbre
	 */
	addBorder : function() {
		log.debug("View::Ajout du cadre");
		if (false) {
			var step = 50;
			for (var i = step; i < this.r.width; i = i + step) {
				this.r.path(["M" + i + ",0", "l0," + this.r.height].join("")).attr({
							stroke : "#CECECE",
							"stroke-width" : 1,
							"stroke-opacity" : 0.5
						});
				this.r.text(i, 5, i, this.r.getFont("Museo"));
			}
			for (var i = step; i < this.r.height; i = i + step) {
				this.r.path(["M0," + i, "l" + this.r.width + ",0"].join("")).attr({
							stroke : "#CECECE",
							"stroke-width" : 1,
							"stroke-opacity" : 0.5
						});
				this.r.text(10, i, i, this.r.getFont("Museo"));
			}
		}

		this.r.rect(1, 1, this.r.width - 1, this.r.height - 1, 0).attr({
					stroke : "#000000",
					"stroke-width" : 1,
					"stroke-opacity" : 1
				});
	},

	/**
	 * Retourne les dimensions en largeur et hauteur d'un texte
	 *
	 * @param {String} :
	 *          texte à écrire
	 * @return {width:'', height:''}
	 */
	getTextDimensions : function(text, attr) {
		if (null == text) {
			return {
				width : 0,
				height : 0
			};
		}
		this.textSandbox.attr(Object.extend({
					'text-anchor' : 'start',
					'text' : text
				}, (attr || {})));
		return {
			width : this.textSandbox.getBBox().width,
			height : this.textSandbox.getBBox().height
		};
	},

	/**
	 * Calcule la place occupée par pour un groupe de personnes.
	 *
	 * @param {Personne /
	 *          Personne[]} : personne ou tableau de personne
	 * @return { width : '', height : ''}
	 */
	getBlocDimensions : function(a) {
		a = Object.isArray(a) ? a : [a];
		return {
			width : $A(a).sum(function(p) {
						return p.box.rect.getBBox().width;
					}, this),

			height : $A(a).max(function(p) {
						return p.box.rect.getBBox().height;
					})
		};
	},

	/**
	 * Retour la position d'une personne
	 *
	 * @param {Personne} :
	 *          personne
	 * @return {x:'', y:''}
	 */
	getBlocPosition : function(p) {
		return {
			x : p.box.rect.getBBox().x,
			y : p.box.rect.getBBox().y
		};
	},

	/**
	 * Calcule la position en X d'une personne par rapport à ses deux parents
	 *
	 * @param {Personne} :
	 *          personne
	 * @return {Long} position en x
	 */
	getParentX : function(p) {
		var gp = p.getValue("familleParent").husb;
		var gm = p.getValue("familleParent").wife;

		if (gp && gm) {
			// Aligment sur le milieu de l'espace entre les des deux parents
			return (this.getBlocPosition(gp).x + this.getBlocPosition(gm).x + this.getBlocDimensions(gp).width - this
					.getBlocDimensions(p).width)
					/ 2;
		} else if (gp) {
			// Alignement sur le grand père
			return (this.getBlocPosition(gp).x + (this.getBlocDimensions(gp).width - this.getBlocDimensions(p).width)
					/ 2);
		} else {
			// Alignement sur la grand mère
			return (this.getBlocPosition(gm).x + (this.getBlocDimensions(gm).width - this.getBlocDimensions(p).width)
					/ 2);
		}

		// Aligment sur le milieu de la largeur des deux parents
		return (this.getBlocPosition(gm).x + this.getBlocDimensions(gm).width - this.getBlocPosition(gp).x - this
				.getBlocDimensions(p).width)
				/ 2 + this.getBlocPosition(gp).x;
	},

	openDetail : function(p) {
		if (!p.isPublic()) {
			return;
		}

		log.debug("Affichage de " + this.createHtmlLink(p));

		p.loadPlugins(p.data, false);

		this.content.update("<table>" + GedcomPlugins.getPlugins().collect(function(plugin) {
					var v = plugin.writer(p, this);
					if (v) {
						return "<tr><th>" + plugin.name + "</th><td>" + v + "</td></tr>";
					} else {
						return "";
					}
				}, this).join("") + "</table>");

		this.detail.show();
	},

	createHtmlLink : function(p, f) {
		if (null == p) {
			return null;
		}
		return '<a href="javascript:void(GedcomToolbox.show(\'' + (f ? f.id : p.id) + '\'));">'
				+ "<img src='resources/" + GedcomToolbox.getSexeImage(p.getValue("sexe")) + "'/>" + " "
				+ p.getDisplayName(GedcomLang.$.viewer.multipleNameSeparator) + '</a>';
	}

};