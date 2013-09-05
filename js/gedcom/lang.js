/* Required : GedcomConst */
var GedcomLang = {

	language : null,

	$ : null,

	defs : {
		'fr' : {
			'common' : {
				'yes' : "Oui",
				'no' : "Non",
				'when' : "le",
				'where' : "à"
			},
			'index' : {
				'close' : "Fermer",
				'history' : "Historique",
				'log' : "Informations",
				'quickSelect' : "Choix de la personne à afficher"
			},
			'personne' : {
				'privacy' : "Donnée privée",
				'sexe' : {
					'M' : 'M.',
					'F' : 'Mme'
				}
			},
			'viewer' : {
				'clicknavigate' : "Cliquez pour centrer sur cette personne",
				'dbclicknavigate' : "Double-cliquez pour centrer sur cette personne",
				'clickopen' : "Cliquez pour ouvrir le détail de cette personne",
				'multipleNameSeparator' : " ou "
			},
			'plugins' : {
				'helper' : {
					'source' : {
						'title' : "Titre",
						'titleAbbr' : "Titre abrégé",
						'author' : "Auteur",
						'dateAndPlace' : "Date et lieu de publication",
						'text' : "Texte",
						'notes' : "Notes"
					},
					'dateAndPlace' : {
						'address' : "Adresse",
						'age' : "âge",
						'source' : "Source",
						'notes' : "Notes",
						'displayMap' : "[Afficher sur une carte]",
						'hideMap' : "[Cacher la carte]"
					}
				},
				'privacy' : {
					'title' : "Restriction"
				},
				'sexe' : {
					'title' : "Sexe",
					'M' : "Homme",
					'F' : "Femme",
					'U' : "Inconnu"
				},
				'name' : {
					'title' : "Nom"
				},
				'prenom' : {
					'title' : "Prénom"
				},
				'surn_prefix' : {
					'title' : "Nom de famille (préfix)"
				},
				'nomjf' : {
					'title' : "Nom de famille"
				},
				'name_suffix' : {
					'title' : "Nom de famille (suffix)"
				},
				'nom' : {
					'title' : "Nom d'usage"
				},
				'nickname' : {
					'title' : "Surnom"
				},
				'birt' : {
					'title' : "Naissance"
				},
				'deat' : {
					'title' : "Décès"
				},
				'burri' : {
					'title' : "Sépulture"
				},
				'crem' : {
					'title' : "Crémation"
				},
				'prob' : {
					'title' : "Validation d'un testament"
				},
				'will' : {
					'title' : "Testament"
				},
				'familleParent' : {
					'title' : "Parents"
				},
				'adop' : {
					'title' : "Adoption"
				},
				'nmr' : {
					'title' : "Nombre de mariages"
				},
				'familles' : {
					'title' : "Coinjoint(e)(s)",
					'marriage' : "Mariage",
					'children' : "enfants"
				},
				'familleParentChilds' : {
					'title' : "Frères et soeurs"
				},
				'nchi' : {
					'title' : "Nombre d'enfants du parent"
				},
				'even' : {
					'title' : "Evénements"
				},
				'dscr' : {
					'title' : "Description"
				},
				'cens' : {
					'title' : "Recencement"
				},
				'ssn' : {
					'title' : "N° de sécurité sociale"
				},
				'resi' : {
					'title' : "Lieux de résidences"
				},
				'prop' : {
					'title' : "Biens et possessions"
				},
				'grad' : {
					'title' : "Diplômes"
				},
				'educ' : {
					'title' : "Niveau d'étude"
				},
				'occu' : {
					'title' : "Professions"
				},
				'reti' : {
					'title' : "Retraite"
				},
				'nati' : {
					'title' : "Nationalité"
				},
				'emig' : {
					'title' : "Emigration"
				},
				'immi' : {
					'title' : "Immigration"
				},
				'natu' : {
					'title' : "Naturalisation"
				},
				'reli' : {
					'title' : "Religion"
				},
				'fcom' : {
					'title' : "Première communion"
				},
				'chr' : {
					'title' : "Baptême religieux (enfant)"
				},
				'chra' : {
					'title' : "Baptême religieux (adulte)"
				},
				'bapt' : {
					'title' : "Baptême"
				},
				'conf' : {
					'title' : "Confirmation"
				},
				'bless' : {
					'title' : "Bénédiction religieuse"
				},
				'ordi' : {
					'title' : "Sacrement religieux"
				},
				'ordn' : {
					'title' : "Ordination religieuse"
				},
				'barm' : {
					'title' : "Bar mitzvah"
				},
				'bars' : {
					'title' : "Bas mitzvah"
				},
				'bapl' : {
					'title' : "Baptême<br/>(Eglise des Mormons)"
				},
				'conl' : {
					'title' : "Confirmation<br/>(Eglise des Mormons)"
				},
				'endl' : {
					'title' : "Dotation<br/>(Eglise des Mormons)"
				},
				'slgc' : {
					'title' : "Scellement d'un enfant à ses parents<br/>(Eglise des Mormons)"
				},
				'slgs' : {
					'title' : "Scellement d'un mari et d'une femme<br/>(Eglise des Mormons)"
				},
				'cast' : {
					'title' : "Rang ou statut"
				},
				'titl' : {
					'title' : "Titre de noblesse ou honorifique"
				},
				'sources' : {
					'title' : "Sources"
				},
				'notes' : {
					'title' : "Notes"
				},
				'obje' : {
					'title' : "Documents"
				}
			}
		},
		'en' : {
			'common' : {
				'yes' : "Yes",
				'no' : "No",
				'when' : "the",
				'where' : "at"
			},
			'index' : {
				'close' : "Close",
				'history' : "History",
				'log' : "Log",
				'quickSelect' : "Choose the person to display"
			},
			'personne' : {
				'privacy' : "Private data",
				'sexe' : {
					'M' : '',
					'F' : ''
				}
			},
			'viewer' : {
				'clicknavigate' : "Click to focus on this person",
				'dbclicknavigate' : "Double-click to focus on this person",
				'clickopen' : "Click to open the person's detail",
				'multipleNameSeparator' : " or "
			},
			'plugins' : {
				'helper' : {
					'source' : {
						'title' : "Title",
						'titleAbbr' : "Short title",
						'author' : "Author",
						'dateAndPlace' : "Date and place of publication",
						'text' : "Text",
						'notes' : "Notes"
					},
					'dateAndPlace' : {
						'address' : "Address",
						'age' : "age",
						'source' : "Source",
						'notes' : "Notes",
						'displayMap' : "[Display on the map]",
						'hideMap' : "[Hide the map]"
					}
				},
				'privacy' : {
					'title' : "Restriction"
				},
				'sexe' : {
					'title' : "Sex",
					'M' : "Man",
					'F' : "Woman",
					'U' : "Unknown"
				},
				'name' : {
					'title' : "Name"
				},
				'prenom' : {
					'title' : "First name"
				},
				'surn_prefix' : {
					'title' : "Last name (prefix)"
				},
				'nomjf' : {
					'title' : "Last name"
				},
				'name_suffix' : {
					'title' : "Last name (suffix)"
				},
				'nom' : {
					'title' : "Common name"
				},
				'nickname' : {
					'title' : "Nickname"
				},
				'birt' : {
					'title' : "Birthday"
				},
				'deat' : {
					'title' : "Death"
				},
				'burri' : {
					'title' : "Burrial"
				},
				'crem' : {
					'title' : "Cremation"
				},
				'prob' : {
					'title' : "Validation of a will"
				},
				'will' : {
					'title' : "Will"
				},
				'familleParent' : {
					'title' : "Parents"
				},
				'adop' : {
					'title' : "Adoption"
				},
				'nmr' : {
					'title' : "Wedding count"
				},
				'familles' : {
					'title' : "Famillies",
					'children' : "Child(ren)",
					'marriage' : "Wedding"
				},
				'familleParentChilds' : {
					'title' : "Brothers and Sisters"
				},
				'nchi' : {
					'title' : "Children count"
				},
				'even' : {
					'title' : "Events"
				},
				'dscr' : {
					'title' : "Description"
				},
				'cens' : {
					'title' : "Census"
				},
				'ssn' : {
					'title' : "Social Security Number"
				},
				'resi' : {
					'title' : "Places of residence"
				},
				'prop' : {
					'title' : "Property and possessions"
				},
				'grad' : {
					'title' : "Graduates"
				},
				'educ' : {
					'title' : "Level of study"
				},
				'occu' : {
					'title' : "Occupations"
				},
				'reti' : {
					'title' : "Retreat"
				},
				'nati' : {
					'title' : "Nationality"
				},
				'emig' : {
					'title' : "Emigration"
				},
				'immi' : {
					'title' : "Immigration"
				},
				'natu' : {
					'title' : "Naturalization"
				},
				'reli' : {
					'title' : "Religion"
				},
				'fcom' : {
					'title' : "First Communion"
				},
				'chr' : {
					'title' : "Christening (child)"
				},
				'chra' : {
					'title' : "Christening (adult)"
				},
				'bapt' : {
					'title' : "Baptism"
				},
				'conf' : {
					'title' : "Confirmation"
				},
				'bless' : {
					'title' : "Religious blessing"
				},
				'ordi' : {
					'title' : "Religious sacrament"
				},
				'ordn' : {
					'title' : "Religious ordination"
				},
				'barm' : {
					'title' : "Bar mitzvah"
				},
				'bars' : {
					'title' : "Bas mitzvah"
				},
				'bapl' : {
					'title' : "Baptism<br/>(Mormon church)"
				},
				'conl' : {
					'title' : "Confirmation<br/>(Mormon church)"
				},
				'endl' : {
					'title' : "Dotation<br/>(Mormon church)"
				},
				'slgc' : {
					'title' : "Sealing of a child to his parents<br/>(Mormon church)"
				},
				'slgs' : {
					'title' : "Sealing of a husband and wife<br/>(Mormon church)"
				},
				'cast' : {
					'title' : "Cast or status"
				},
				'titl' : {
					'title' : "Title of nobility or honor"
				},
				'sources' : {
					'title' : "Sources"
				},
				'notes' : {
					'title' : "Notes"
				},
				'obje' : {
					'title' : "Documents"
				}
			}
		},
		'de' : {
			'common' : {
				'yes' : "Ja",
				'no' : "Nein",
				'when' : "am",
				'where' : "in"
			},
			'index' : {
				'close' : "Schließen",
				'history' : "Historie",
				'log' : "Log",
				'quickSelect' : "Wähle die Person um die die Ansicht zentriert werden soll"
			},
			'personne' : {
				'privacy' : "Vertrauliche Daten",
				'sexe' : {
					'M' : 'M',
					'F' : 'W'
				}
			},
			'viewer' : {
				'clicknavigate' : "Klicken, um auf diese Person zu zentrieren",
				'dbclicknavigate' : "Klicken, um auf diese Person zu zentrieren",
				'clickopen' : "Klicken, um die Details der Person anzuzeigen",
				'multipleNameSeparator' : " oder "
			},
			'plugins' : {
				'helper' : {
					'source' : {
						'title' : "Titel",
						'titleAbbr' : "Kurztitel",
						'author' : "Autor",
						'dateAndPlace' : "Datum und ort der Publikation",
						'text' : "Text",
						'notes' : "Notizen"
					},
					'dateAndPlace' : {
						'address' : "Adresse",
						'age' : "Alter",
						'source' : "Quelle",
						'notes' : "Notizen",
						'displayMap' : "[Auf der Karte anzeigen]",
						'hideMap' : "[Karte verbergen]"
					}
				},
				'privacy' : {
					'title' : "Beschränkungen"
				},
				'sexe' : {
					'title' : "Geschlecht",
					'M' : "Männlich",
					'F' : "Weiblich",
					'U' : "Unbekannt"
				},
				'name' : {
					'title' : "Name"
				},
				'prenom' : {
					'title' : "Vorname"
				},
				'surn_prefix' : {
					'title' : "Nachname (Prefix)"
				},
				'nomjf' : {
					'title' : "Nachname"
				},
				'name_suffix' : {
					'title' : "Nachname (Suffix)"
				},
				'nom' : {
					'title' : "Rufname"
				},
				'nickname' : {
					'title' : "Spitzname"
				},
				'birt' : {
					'title' : "Geboren"
				},
				'deat' : {
					'title' : "Gestorben"
				},
				'burri' : {
					'title' : "Beerdigung"
				},
				'crem' : {
					'title' : "Feuerbestattung"
				},
				'prob' : {
					'title' : "Testamentsvollstreckung"
				},
				'will' : {
					'title' : "Testament"
				},
				'familleParent' : {
					'title' : "Eltern"
				},
				'adop' : {
					'title' : "Adoption"
				},
				'nmr' : {
					'title' : "Anzahl Ehen"
				},
				'familles' : {
					'title' : "Familien",
					'marriage' : "Hochzeit",
					'children' : "Kind(er)"
				},
				'familleParentChilds' : {
					'title' : "Geschwister"
				},
				'nchi' : {
					'title' : "Anzahl Kinder"
				},
				'even' : {
					'title' : "Ereignisse"
				},
				'dscr' : {
					'title' : "Beschreibung"
				},
				'cens' : {
					'title' : "Zensus"
				},
				'ssn' : {
					'title' : "Sozialversicherungsnummer"
				},
				'resi' : {
					'title' : "Wohnorte"
				},
				'prop' : {
					'title' : "Gut und Habe"
				},
				'grad' : {
					'title' : "Abschlüsse"
				},
				'educ' : {
					'title' : "Höchster Abschluss"
				},
				'occu' : {
					'title' : "Berufe"
				},
				'reti' : {
					'title' : "Rente"
				},
				'nati' : {
					'title' : "Nationalität"
				},
				'emig' : {
					'title' : "Auswanderung"
				},
				'immi' : {
					'title' : "Einwanderung"
				},
				'natu' : {
					'title' : "Einbürgerung"
				},
				'reli' : {
					'title' : "Religion"
				},
				'fcom' : {
					'title' : "Erstkommunion"
				},
				'chr' : {
					'title' : "Kindtaufe"
				},
				'chra' : {
					'title' : "Erwachsenentaufe"
				},
				'bapt' : {
					'title' : "Taufe"
				},
				'conf' : {
					'title' : "Konfirmation"
				},
				'bless' : {
					'title' : "Segen"
				},
				'ordi' : {
					'title' : "Kommunion"
				},
				'ordn' : {
					'title' : "Ordination"
				},
				'barm' : {
					'title' : "Bar-Mizwa"
				},
				'bars' : {
					'title' : "Bat-Mizwa"
				},
				'bapl' : {
					'title' : "Baptism<br/>(Mormon church)"
				},
				'conl' : {
					'title' : "Confirmation<br/>(Mormon church)"
				},
				'endl' : {
					'title' : "Dotation<br/>(Mormon church)"
				},
				'slgc' : {
					'title' : "Sealing of a child to his parents<br/>(Mormon church)"
				},
				'slgs' : {
					'title' : "Sealing of a husband and wife<br/>(Mormon church)"
				},
				'cast' : {
					'title' : "Kaste"
				},
				'titl' : {
					'title' : "Adels- und Ehrentitel"
				},
				'sources' : {
					'title' : "Quellen"
				},
				'notes' : {
					'title' : "Notizen"
				},
				'obje' : {
					'title' : "Dokumente"
				}
			}
		}
	},

	setLanguage : function(language) {
		this.language = language;
		this.$ = this.defs[language];
	}

};

GedcomLang.setLanguage(GedcomConst.LANGUAGE);
