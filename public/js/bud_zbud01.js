// FONCTION affichageSunburst appelée par le script UPLOAD.JS qui passe en paramètre le nomdu fichier
function affichageSunburst(monfichier, monentete) {

	'use strict';

	// Il faut commencer par supprimer les images SVG existantes (cas d'un changement de fichier de données)
	d3.transition().duration(100).select('#col-centre').selectAll("svg").remove();
	
	toggleOpacity("main", 1);
	toggleOpacity("titredatavisualisation", 1);
	//toggleOpacity("sidebar", 1); trop tôt il faut attendre affichage du contenu du titre sinon décrochage écran
	
	// set the colors, voir site databrewer
	//let zColors = d3.scaleOrdinal(d3.schemeBlues[9].reverse());
	const blues = d3.schemeBlues[9].reverse();
	const oranges = d3.schemeOranges[9].reverse();
	const greens = d3.schemeGreens[9].reverse();
	const reds = d3.schemeReds[9].reverse();
	const purples = d3.schemePurples[9].reverse();
	const greys = d3.schemeGreys[9].reverse();
	const zColors = function(rang, niveau) {
		let couleur;
		switch(rang) {
			case 0:
				couleur = blues[niveau+1];
				break;
			case 1:
				couleur = greens[niveau+1];
				break;
			case 2:
				couleur = purples[niveau+1];
				break;
			case 3:
				couleur = oranges[niveau+1];
				break;
			default:
				couleur = greys[niveau+1];
				break;
		};
		return couleur;
	}
	

	// INITIALISATION DES CHECKS DES INPUTBOX 
	var togglelegendCheck = d3.select('#togglelegend').property("checked");
	var togglearcconsoCheck = d3.select('#togglearcconso').property("checked");
	var toggledonneesCheck = d3.select('#toggledonnees').property("checked");

	//var width = 960,
	//    height = 700,
	var width = 750,
		height = 600,
		radius = (Math.min(width, height) / 2) - 10;

	var formatNumber = function(val) {
		var valRound = Math.round(val,0);
		var valFormat =  d3.format(",d")(valRound);
		var valFinal = valFormat.toString().replace(/,/g,'.')+' €';
		return valFinal;
	}

	var x = d3.scaleLinear()
		.range([0, 2 * Math.PI]);

	var y = d3.scaleSqrt()
			.range([0, radius]);

	// Tableau de l'architecture des programmes
	var tableauNiveau = [];

	// Tableau des programmes
	var tableauPGM = [];
			
	// Total size of all segments; A CALCULER.
	var totalSize = 0; 

	// Liste des différents montants (à faire correspondre à des ID distincts)
	var toggleArcConsoListe = ["#ressource","#prev","#conso"];

	// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
	var b = {
		w: 75, h: 30, s: 3, t: 10
		};

	var partition = d3.partition();

	// Définition du segment ARC avec Angles début et fin, Rayon intérieur et extérieur
	var arc0 = d3.arc()
		.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
		.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
		.innerRadius(function(d) { return Math.max(0, y(d.y0)); })
		.outerRadius(function(d) { return Math.max(0, y(d.y1)); });

	// Définition du segment ARC2 avec Angles début et fin, Rayon intérieur et extérieur	
	// Le rayon extérieur est recalculé afin de représenter un quart de largeur
	var arc2 = d3.arc()
		.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
		.endAngle(function(d) {
			var startAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
			var endAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
			var ecart = endAngle - startAngle;
			var ratio = d.data.conso? d.data.conso/d.value : 0;
			var endAngleFinal = (startAngle + ecart*ratio);
			return endAngleFinal;
			})
		.innerRadius(function(d) { return Math.max(0, y(d.y0)) + 0.5*Math.max(0, y(d.y1)-y(d.y0)); })
		.outerRadius(function(d) { return 0.25*Math.max(0, y(d.y0)) + 0.75*Math.max(0, y(d.y1)); });

	// Définition du segment ARC3 avec Angles début et fin, Rayon intérieur et extérieur
	// Il faut vérifier que la prévision est plafonnée à la ressource	
	// Le rayon extérieur est recalculé afin de représenter un quart de largeur
	var arc1 = d3.arc()
		.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
		.endAngle(function(d) { 
			var startAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
			var endAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
			var ecart = endAngle - startAngle;
			var ratio = d.data.prev? Math.min(d.data.prev/d.value,1) : 0;		
			var endAngleFinal = (startAngle + ecart*ratio);
			return endAngleFinal;
			})
		.innerRadius(function(d) { return Math.max(0, y(d.y0)) + 0.5*Math.max(0, y(d.y1)-y(d.y0)); })
		.outerRadius(function(d) { return 0.25*Math.max(0, y(d.y0)) + 0.75*Math.max(0, y(d.y1)); });

	// SVG : SUNBURST principal
	const viewbox = "0 0 " + width + " " + height;
	const explanationText = 'du total de ce niveau, soit';
	d3.select('#chart').attr('class','row')
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", viewbox);

	var svg = d3.select('#chart').select('svg')
		.append("g")
		.attr("id", "container")
		.attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

	d3.select('#chart').select('svg')
		.append('text')
		.attr('x', "375")
		.attr('y', "280")
		.attr('class','explanation')
		.attr('text-anchor', 'middle')
		.property('id','libelle')
		.style('opacity', 0);
	d3.select('#chart').select('svg')
		.append('text')
		.attr('x', "375")
		.attr('y', "300")
		.attr('class','explanation')
		.attr('text-anchor', 'middle')
		.property('id','percentage')
		.style('opacity', 0);
	d3.select('#chart').select('svg')
		.append('text')
		.attr('x', "375")
		.attr('y', "320")
		.attr('class','explanation')
		.attr('text-anchor', 'middle')
		.text(explanationText)
		.style('opacity', 0);
	d3.select('#chart').select('svg')
		.append('text')
		.attr('x', "375")
		.attr('y', "340")
		.attr('class','explanation')
		.attr('text-anchor', 'middle')
		.property('id','montant')
		.style('opacity', 0);

	// Basic setup of page elements.
	initializeBreadcrumbTrail();

	d3.select("#togglelegend").on("click", toggleLegend);
	d3.select("#togglearcconso").on("click", toggleArcConso);
	d3.select("#toggledonnees").on("click", toggleDonnees);

	// Initialisation du non affichage des données
	if(!toggledonneesCheck)
		{d3.select("#affichageFichierDonnees").style("visibility", "hidden");}	
	
	var fichierJSON = monfichier;
	var root = {};
	// fichierJSON est un TSV,il faut le transformer en JSON
	var enteteCSV = monentete;
	var objectNiv1 = {};		
	tsvHierarchy();
		
	// Add the mouseleave handler to the bounding circle.
	d3.select("#container").on("mouseleave", mouseleave);

	function click(d) {
		var transitionBase = svg.transition()
			.duration(50)// prendre garde à la durée sinon problème compatibilité avec mouseover, le zoom fonctionne mal
			.tween("scale", function() {
				var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
				yd = d3.interpolate(y.domain(), [d.y0, 1]),
				yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
				return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
				});

		for(var i=0; i<toggleArcConsoListe.length; ++i){
			var transitionBaseIndice = transitionBase.selectAll(toggleArcConsoListe[i]);
			switch(i) {
				case 0:
					transitionBaseIndice.attrTween("d", function(d) {return function() { return arc0(d);}; })
					break;
				case 1:
					transitionBaseIndice.attrTween("d", function(d) {return function() { return arc1(d);}; })
					break;
				case 2:
					transitionBaseIndice.attrTween("d", function(d) {return function() { return arc2(d);}; })
					break;
			}
		}
	}


	// SURVOL PAR LA SOURIS
	function mouseover(d) {
		var totalSizeD = (d.parent)? d.parent.value : totalSize;
		var libelle = (d.data.libelle)? d.data.libelle : d.data.name;	
		// Astuce sur les montants pour avoir un séparateur de milliers
		var montant = formatNumber(d.value);
		var conso = formatNumber(d.data.conso);
		var prev = formatNumber(d.data.prev);
		var prevSuppl = formatNumber(d.data.prev - d.data.conso);
		var ecart = formatNumber(d.data.prev - d.value);
		
		var percentage = (100 * d.value / totalSizeD).toPrecision(3);
		var percentageString = percentage + "%";
		
		if (percentage < 1) { percentageString = "< 1%"; }
		
		var sequenceArray = d.ancestors().reverse();
		sequenceArray.shift(); // remove root node from the array
		updateBreadcrumbs(sequenceArray, percentageString, montant, conso, prev, prevSuppl, ecart, libelle);			

		d3.select("#libelle")
			.text(libelle);
		
		d3.select("#percentage")
			.text(percentageString);

		d3.select("#montant")
			.text(montant);
			
		d3.selectAll('.explanation')
			.style('opacity', 1);
		
		svg.selectAll("#ressource")
			.style("opacity", 0.3);

		svg.selectAll("#prev")
			.style("opacity", 0.3);
			
		svg.transition()
			.delay(300)
			.duration(100)
			.selectAll("path")
			.filter(function(node) {
				return (d.ancestors().indexOf(node) >= 0);
				})
			.style("opacity", 1);
	}
	// SORTIE DE LA SOURIS
	function mouseleave(d) {
		// Hide the breadcrumb trail
		d3.select('#trail')
//			.style("visibility", "hidden");
			.style("opacity", 0);
		  
		svg.selectAll("path")
			.transition()
			.duration(750)
			.style("opacity", 1);
			
		d3.selectAll('.explanation')
			.style('opacity', 0);
	}

	// Fonction FILLCOLOR qui retourne la couleur d'affichage du segment
	// choix en fonction du programme (couleur)du niveau dans l'architecture budgétaire (intensité)
	// l'éventail des couleurs est dans la table standard d3.schemeCategory20c
	function fillColor(d) {
		var PGMBOPUO = d.data.name.split(' ').shift();
		var PGM = d.data.name.split(' ').pop().split('-').shift();
		var rangPGM = tableauPGM.indexOf(PGM);
		var niveauPGMBOPUO = tableauNiveau.indexOf(PGMBOPUO);
		if(rangPGM < 0 || niveauPGMBOPUO === -1)
			{ 
				if(d.data.blocage > 0) {
					return "red"
				} else {
						return "white";	
					}				
				}
		else { return zColors(rangPGM, niveauPGMBOPUO)}
	}

	// Fonction FILLCOLORWarning qui retourne la couleur d'affichage du segment
	// avec gestion du dépassement de la ressource
	function fillColorWarning(d) {
		return ((d.data.prev && d.data.prev<=d.value) ? 'DarkGrey' : 'Crimson'); 
	}

	// Fonction FILLCOLORConso qui retourne la couleur d'affichage du segment
	function fillColorConso(d) {
		return ('LightGrey'); 
	}
	//----------------------------------------------------------------------------------
	// INITIALISATION DU CHEMIN HIERARCHIQUE
	function initializeBreadcrumbTrail() {
	  // Add the svg area.
		var trail = d3.select("#sequence")
			.append("svg:svg")
			.attr("width", width)
			.attr("height", 50)
			.attr("id", "trail");
	  // Zone 1ère ligne de commentaire.
		trail.append("svg:text")
			.attr("id", "endlabel1")
			.style("fill", "#000");
	  // Zone 2ème ligne de commentaire.
		trail.append("svg:text")
			.attr("id", "endlabel2")
			.style("fill", "#000");
	  // Zone 3ème ligne de commentaire. Cas du dépassement de la ressource allouée : changement de couleur
		trail.append("svg:text")
			.attr("id", "endlabel3")
			.style("fill", "Crimson");
	}

	// Generate a string that describes the points of a breadcrumb polygon.
	function breadcrumbPoints(d, i) {
		var points = [];
		points.push("0,0");
		points.push(b.w + ",0");
		points.push(b.w + b.t + "," + (b.h / 2));
		points.push(b.w + "," + b.h);
		points.push("0," + b.h);
		if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
			points.push(b.t + "," + (b.h / 2));
			}
		return points.join(" ");
	}

	// MISE A JOUR DU CHEMIN
	function updateBreadcrumbs(nodeArray, percentageString, montant, conso, prev, prevSuppl, ecart, libelle) {

	  // Data join; key function combines name and depth (= position in sequence).
		var trail = d3.select("#trail")
			.selectAll("g")
			.data(nodeArray, function(d) { return d.data.name + d.depth; });
	  // Remove exiting nodes.
		trail.exit().remove();

	  // Add breadcrumb and label for entering nodes.
		var entering = trail.enter().append("svg:g");

		entering.append("svg:polygon")
			.attr("points", breadcrumbPoints)
			.style("fill", fillColor);

		entering.append("svg:text")
			.attr("x", (b.w + b.t) / 2)
			.attr("y", b.h / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", "middle")
		  // suppression des '-' et récupération du dernier niveau
			.text(function(d) { return d.data.name.split('-').pop(); });

	  // Merge enter and update selections; set position for all nodes.
		entering.merge(trail)
			.attr("transform", function(d, i) {
				return "translate(" + i * (b.w + b.s) + ", 0)";
				});

		// Préparation de la première ligne de commentaire (libellé, % ,ressource)
		var texte1 = '',
			texte2 = texte1,
			texte3 = texte1;
		texte1 = libelle + " : " + percentageString + ' soit ' + montant;
		// Si l'affichage de la consommation a été demandée (hors Disponible et Blocage)
		togglearcconsoCheck = d3.select('#togglearcconso').property("checked");
		if(togglearcconsoCheck && nodeArray.length>0 && nodeArray[nodeArray.length - 1].data.libelle !='Disponible' && nodeArray[nodeArray.length - 1].data.libelle !='Blocage'){
			// Complément sur la première ligne de commentaire (consommation)
			texte1 += conso? (', une consommation de '+ conso) : ('');
			// Préparation de la seconde ligne de commentaire (consommation prévisionnelle)
			texte2 = prevSuppl?('Un supplément prévu de '+ prevSuppl) : ('');
			texte2 += prev?('. La cible est de '+ prev) : ('');
			// Préparation de la troisième ligne de commentaire (ccible)
			texte3 = (ecart && ecart > 0)?('Ressource manquante : '+ ecart) : ('');
		}
		// Positionnement et affichage du commentaire (endlabel1)
		d3.select("#trail")
			.select("#endlabel1")
			.attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
			.attr("y", b.h *.25)
			.attr("dy", "0.35em")
		  //.attr("text-anchor", "start")
			.text(texte1);
		// Positionnement et affichage du commentaire 2ème ligne (endlabel2)
		d3.select("#trail")
			.select("#endlabel2")
			.attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
			.attr("y", b.h *.75)
			.attr("dy", "0.35em")
			.text(texte2);
		// Positionnement et affichage du commentaire 2ème ligne (endlabel2)
		d3.select("#trail")
			.select("#endlabel3")
			.attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
			.attr("y", b.h * 1.25)
			.attr("dy", "0.35em")
			.text(texte3);

		// Make the breadcrumb trail visible, if it's hidden.
		d3.select("#trail")
//			.style("visibility", "");
			.style("opacity", 4);

	}

	// DEFINITION DE LA LEGENDE
	function drawLegend() {
	// Dimensions of legend item: width, height, spacing, radius of rounded rect.
		var li = { w: 75, h: 30, s: 3, r: 3 };

		var legend = d3.select("#legend")
			.append("svg:svg")
			.attr("width", tableauNiveau.length * (li.w + li.s))
			.attr("height", tableauPGM.length * (li.h + li.s));

		if(!togglelegendCheck)
			{legend.style("visibility", "hidden");}
		
		var g = legend.selectAll("g")
			.data(tableauNiveau.concat(tableauPGM))
			.enter()
			.append("svg:g")
			.attr("transform", function(d, i) {
				if(i < tableauNiveau.length)
					{return "translate( " + i * (li.w + li.s) + ",0)";}
				else if(i >= tableauNiveau.length)
					{return "translate(0," + (i - tableauNiveau.length) * (li.h + li.s) + ")";}
			});

		// AFFICHAGE COULEUR	
		g.append("svg:rect")
			.attr("rx", li.r)
			.attr("ry", li.r)
			.attr("width", li.w)
			.attr("height", li.h)
			.style("fill", function(d) { 
				var rangNiveau = tableauNiveau.indexOf(d);
				var rangPGM = 0;
				if(rangNiveau < 0){
					rangNiveau = 0;
					rangPGM = tableauPGM.indexOf(d);}
				return zColors(rangPGM, rangNiveau);
				});

		// AFFICHAGE TEXTE	
		g.append("svg:text")
			.attr("x", li.w / 2)
			.attr("y", li.h / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", "middle")
			.text(function(d) { return d; });
	}
	// DEFINITION DE LA LEGENDE CONSOMMATION
	function drawConsommation() {
	// Dimensions of legend item: width, height, spacing, radius of rounded rect.
		var li = { w: 150, h: 30, s: 3, r: 3 };

		if(!togglearcconsoCheck)
			{d3.select("#consommation").style("visibility", "hidden");}
		
		var consommation = d3.select("#consommation")
			.append("svg:svg")
			.attr("width", li.w + li.s)
			.attr("height", 3 * (li.h + li.s));
		
		var g = consommation.selectAll("g")
			.data(["Consommation","Prévisionnel","Ressource insuffisante"])
			.enter()
			.append("svg:g")
			.attr("transform", function(d, i) {
				{return "translate(0," + i * (li.h + li.s) + ")";}
			});
			
		// AFFICHAGE COULEUR	
		g.append("svg:rect")
			.attr("rx", li.r)
			.attr("ry", li.r)
			.attr("width", li.w)
			.attr("height", li.h)
			.style("fill", function(d) {
				switch(d){
					case "Consommation":
						return 'LightGrey';
						break;
					case "Prévisionnel":
						return 'DarkGrey';
						break;
					case "Ressource insuffisante":
						return 'Crimson';
						break;
				}
			});

		// AFFICHAGE TEXTE	
		g.append("svg:text")
			.attr("x", li.w / 2)
			.attr("y", li.h / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", "middle")
			.text(function(d) { return d; });
	}

	// Click sur LEGENDE : inversion de l'affichage
	function toggleLegend() {
		var legend = d3.select("#legend");
		toggleVisibility(legend);
	}

	// Click sur Affichage des données : inversion de l'affichage
	function toggleDonnees() {
		toggledonneesCheck = d3.select('#toggledonnees').property("checked");
		if(toggledonneesCheck){
			d3.select("#affichageFichierDonnees").style("visibility", "visible");
			affichageDatatables(fichierATraiterName,fichierEnTeteName)
		} else {
			d3.select('#fichierDonnees_wrapper').remove();
		}
		
	}
	// Click sur Affichage consommation : inversion de l'affichage
	// boucle sur les différents ID
	function toggleArcConso() {
		var consommation = d3.select("#consommation");
		toggleVisibility(consommation);
		for(var i=0; i<toggleArcConsoListe.length; ++i){
			// Le premier ID de la liste correspond à la ressource qui est toujours affichée
			if(i === 0){
				continue;
			}
			var afficheConso = d3.selectAll(toggleArcConsoListe[i]);
			toggleVisibility(afficheConso);
		}
	}
	// FONCTION TOGGLEVISIBILITY appelée suite à CLICK
	function toggleVisibility(selectId) {
		if (selectId.style("visibility") == "hidden") {
			selectId.style("visibility", "visible");
		} else {
			selectId.style("visibility", "hidden");
		}
	}

	// FONCTION chargement dans l'objet ROOT de la hiérarchie du TSV
	function tsvHierarchy() {

		d3.csv(enteteCSV).then(function(data) { 
			var objectHeader = {};
			var objectTSVint = {};
			data.forEach(function(d, i) {
				objectHeader[i] = d;
				});
			objectHeader[0].children = new Array();
			objectNiv1 = objectHeader[0];
		});

		d3.tsv(fichierJSON).then(function(data) {
			var nodeById = {};
			var ind1 = 0;
			var ind2 = 0;
			var ind3 = 0;

		// Index the nodes by id, in case they come out of order.
			data.forEach(function(d, i) {
				nodeById[i] = d;
			});

			// Lazily compute children.
			data.forEach(function(d, i) {
				if (!d.niv2) {
					objectNiv1.children[ind1] = nodeById[i];
					ind2 = 0;
					ind3 = 0;
					++ind1;
				}
			 
				if (d.niv2 && !d.niv3) {
				
					if (objectNiv1.children[ind1 - 1].children) {
						objectNiv1.children[ind1 - 1].children.push(d);
						ind3 = 0;
						++ind2;
						}
					else {
						objectNiv1.children[ind1 - 1].children = [d];
						ind3 = 0;
						++ind2;
					}
				}
				
				if (d.niv3 && !d.niv4) {
					if (objectNiv1.children[ind1 - 1].children[ind2 - 1].children) {
						objectNiv1.children[ind1 - 1].children[ind2 - 1].children.push(d);
						++ind3;
						}
					else {
						objectNiv1.children[ind1 - 1].children[ind2 - 1].children = [d];
						++ind3;
					}
				}
				
			});
			
		root = d3.hierarchy(objectNiv1);
		// Si le fichier JSON est incorrect (pas d'enfants a minima) arrêt total
		if (!root.children) {
			toggleOpacity("main", 0);
			toggleOpacity("titredatavisualisation", 0);
			toggleOpacity("sidebar", 0);
			toggleOpacity("affichageFichierDonnees", 0);
			preview.text("Contenu incorrect pour l'affichage")
				.attr('class','alert alert-danger');
			throw "Fichier JSON incorrect pour D3JS !";
			} 

		// Balayage de ROOT pour constituer les tableaux des programmes et des hiérarchies (4 maxi)
		for(var i=0; i < root.children.length; ++i){
			tableauPGM[i] = root.children[i].data.name.split(' ').pop();
			//console.log("i = " + i + " - "+root.children[i].height);
			switch(root.children[i].height) {
				case 4:
					tableauNiveau[4] = root.children[i].children[0].children[0].children[0].children[0].data.name.split(' ').shift();				
				case 3:
					tableauNiveau[3] = root.children[i].children[0].children[0].children[0].data.name.split(' ').shift();				
				case 2:
					tableauNiveau[2] = root.children[i].children[0].children[0].data.name.split(' ').shift();		
				case 1:
					tableauNiveau[1] = root.children[i].children[0].data.name.split(' ').shift();
				case 0:	
					tableauNiveau[0] = root.children[i].data.name.split(' ').shift();			
					break;
			}
		}
		
		// Les tableaux étant initialisés, les légendes peuvent être affichées
		toggleOpacity("sidebar", 1);
		drawLegend();
		drawConsommation();
		
		// Affichage de l'en-tête
		var titreDataVisualisation = d3.select('#titredatavisualisation');
		titreDataVisualisation.select('#titreDatavis1').text(root.data.name);
		var espace = " ";
		titreDataVisualisation.select('#titreDatavis2').text(
			"Répartition de la ressource"
			+ espace + root.data.type 
			+ espace + root.data.annee
			+ espace + "en" + espace + root.data.categorie
			+ espace + "par" + espace + tableauNiveau.toString().replace(/,/g,', ') );
		titreDataVisualisation.select('#titreDatavis3').text( "Source :"
			+ espace + root.data.source
			+ espace + "produit le" + espace + root.data.dateProduction);
		
		root.sum(function(d) { return d.size; });
		totalSize = (partition(root).descendants()[0].value);
		
		
		
		// Affichage des arcs proportionnels à la ressource (id = ressource)
		var sunburstBase = svg.selectAll("#ressource")
			.data(partition(root).descendants())
			.enter();	
			
		sunburstBase.append("path")
			.attr("id", "ressource")
			.attr("d", arc0)
			//.style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
			.style("fill", fillColor)
			.style("opacity", 1)
			.on("mouseover", mouseover)
			.on("click", click)
		;	
		// Affichage des arcs proportionnels à la prévision de consommation (id = prev)
		sunburstBase.append("path")
			.attr("id", "prev")
			.attr("d", arc1)
			.style("fill", fillColorWarning)
			.style("visibility", "hidden")
			.style("opacity", 1)
			.on("click", click)
		;
		// Affichage des arcs proportionnels à la consommation (id = conso)
		sunburstBase.append("path")
			.attr("id", "conso")
			.attr("d", arc2)
			.style("fill", fillColorConso)
			.style("visibility", "hidden")
			.style("opacity", 1)
			.on("click", click)
		;
		})
	}

	//----------------------------------------------------------------------------------
	d3.select(self.frameElement).style("height", height + "px");

}