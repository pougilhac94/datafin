// il faut encore traiter le cas des trous (au moins après filtrage) en ajoutant les postes avec valeur 0


'use strict';
function createKeymap(kmap, data) {
	function createKeys1map(data,key){
		let arrayKey = [];
		d3.map(data)
			.each(function(d) {
					if (arrayKey.indexOf(d.key)<0)
						arrayKey.push(d.key);
			});
		return arrayKey.sort();
	}
	function createKeys2map(data,key){
		let arrayKey = [];
		d3.map(data)
			.each(function(d1) {
				d3.map(d1[key]).each(function(d) {
					if (arrayKey.indexOf(d.key)<0)
						arrayKey.push(d.key);
					});
			});
		return arrayKey.sort();
	}
	kmap[key1a] = createKeys1map(data[key1a], key1a);
	kmap[key1b] = createKeys1map(data[key1b], key1b);
	kmap[key2a] = createKeys2map(data[key1a], key2a);
	kmap[key2b] = createKeys2map(data[key1a], key2b);
	kmap[key2c] = createKeys2map(data[key1a], key2c);
	kmap[key2d] = createKeys2map(data[key1a], key2d);
	return kmap;
}
function datasetTraitement(){
	function fonctionTotal(data, keyP, keyS) {
		d3.map(data).each(function(d) {
			let valuesArray = [];
			d3.map(d.values).each(function(d1) { valuesArray.push(d1.value); });
			
			d.max = Math.max.apply(null, valuesArray);
			d.min = Math.min.apply(null, valuesArray);
			d.total = valuesArray.reduce(function(accumulateur, valeurCourante, index, array){
				 return accumulateur + valeurCourante;
				});
			switch(keyP) {
				case(key1a):
				case(key1b):
					d3.map(d.values).each(function(d1) { d1.percentage = d1.value/d.total; });
					break;
				case(key2a): 
				case(key2c): 
					d3.map(d.values).each(function(d1,i) {
						let totalKey2ac;
						totalKey2ac = nestedDataset[keyS][i].total;
						d1.percentage = d1.value/totalKey2ac; 
						});
					break;
			}			
		})
		return data;
	}
	function copieValueNested(origine, destination, key2origine) {
		d3.map(origine)
			.each(function(d,i) {
				destination[i][key2origine] = d.values					
				})
	}
	function deleteValueNested(data) {
		d3.map(data)
			.each(function(d) {
				delete d.values					
				})
		return data;
	}
	function creationNested(data, keyP, keyS) {
		let datasetNested ;
		datasetNested = d3.nest()
							.key(function(d) {
								switch(keyP){
									case key1b:
										return d[key1a].split('-')[0];
										break;
									default:
										return d[keyP];
									}
								})
							.sortKeys(d3.ascending)
							.key(function(d) { 
								switch(keyS){
									case key1b:
										return d[key1a].split('-')[0];
										break;
									case key2d:
										return d[keyS] + ' - ' + d[key2e];
										break;
									default:
										return d[keyS];
									}							
								return d[keyS];
								})
							.sortKeys(d3.ascending)
							.rollup(function(leaves) {
								return d3.sum(leaves, function(d) {return  +d.nbre});
								})
							.entries(data);
		return datasetNested;
	}
	function alimKey1abNestedDataset(d, keyP) {
		let nestedDataset2a;
		let nestedDataset2b, nestedDataset2c, nestedDataset2d;
		nestedDataset2a = creationNested(d, keyP, key2a);
		nestedDataset2b = creationNested(d, keyP, key2b);
		nestedDataset2c = creationNested(d, keyP, key2c);
		nestedDataset2d = creationNested(d, keyP, key2d);
		fonctionTotal(nestedDataset2a, keyP, key2a);
		fonctionTotal(nestedDataset2b, keyP, key2b);
		fonctionTotal(nestedDataset2c, keyP, key2c);
		fonctionTotal(nestedDataset2d, keyP, key2d);
		copieValueNested(nestedDataset2b, nestedDataset2a, key2b);
		copieValueNested(nestedDataset2c, nestedDataset2a, key2c);
		copieValueNested(nestedDataset2d, nestedDataset2a, key2d);
		copieValueNested(nestedDataset2a, nestedDataset2a, key2a);	
		deleteValueNested(nestedDataset2a);
		return nestedDataset2a;
	}
	function alimKey2acNestedDataset(d, keyP) {
		let nestedDataset1a, nestedDataset1b;
		nestedDataset1a = creationNested(d, keyP, key1a);		
		nestedDataset1b = creationNested(d, keyP, key1b);
		fonctionTotal(nestedDataset1a, keyP, key1a);
		fonctionTotal(nestedDataset1b, keyP, key1b);
		copieValueNested(nestedDataset1b, nestedDataset1a, key1b);
		copieValueNested(nestedDataset1a, nestedDataset1a, key1a);	
		deleteValueNested(nestedDataset1a);
		
		return nestedDataset1a;
	}
	function datasetNested(d, keyPrincipale){
		switch(keyPrincipale) {
			case(key1a):
			case(key1b):
				return alimKey1abNestedDataset(d, keyPrincipale);
				break;
			case(key2a):
			case(key2b):
			case(key2c):
				return alimKey2acNestedDataset(d, keyPrincipale);
				break;
		}
	}
	function creationForStack(data, kmap, keyP, keyS) {
		// balayer l'array nestedDatset KeyP KeyS 
		// chaque item est un objet avec key % value
		// si une valeur de l'array keymapF keyS n'est pas une key d'un des items
		// push dans nestedDatset KeyP KeyS un item avec cette key et 0 0
		// sort array nestedDatset KeyP KeyS sur key
		// exemple du sort : nestedDataset["ANNEE_MOIS"][0]["CHAINE_FINANCIERE"].sort(function (a, b) { return (a.key > b.key);})
		//let key2ArrayInter = d3.map(nestedDataset[keyP]).values().map(d => d3.map(d[keyS]).values().map((d,i) => {let d0={};d0[d.key] = d.value; return d0}));
		let key2Array = d3.map(nestedDataset[keyP]).values().map(d => d3.map(d[keyS]).values().map(d => d.value));
		key2Array = key2Array.map((d, j) => d.reduce(function(acc, cur, i) {
					  let ind = nestedDataset[keyS][i].key;				  
					  acc[ind] = cur;
					  acc[keyP] = nestedDataset[keyP][j].key;
					  return acc;
					}, {}));
		for(let i = 0; i < keymapF[keyS].length; i++) {
			for(let j = 0; j < key2Array.length; j++) {
				let index = keymapF[keyS][i];
				//if (key2Array[j].indexOf(keymapF[keyS][i]) < 0) {key2Array[j][keymapF[keyS][i]] = 0}
				//if (key2Array[j][index] === undefined) {key2Array[j][index]] = 0;}
				if (key2Array[j][index] === undefined) {console.log("Absence "+index);key2Array[j][index]=0;}
			}
		}
	//1*nestedDataset[keyS].map(function(d,i) { if(d.key === "DSN") return i}).filter(d=> Number.isInteger(d)).toString()
	//1*nestedDataset["CHAINE_FINANCIERE"].map(function(d,i) { if(d.key === "DSN") return i}).filter(d=> Number.isInteger(d)).toString()
		return key2Array.sort();
		}
	
	datasetFiltered = filtrageRow(dataset);
	nestedDataset[key1a] = datasetNested(datasetFiltered, key1a);
	nestedDataset[key1b] = datasetNested(datasetFiltered, key1b);
	nestedDataset[key2a] = datasetNested(datasetFiltered, key2a);
	nestedDataset[key2b] = datasetNested(datasetFiltered, key2b);
	// par CATEGORIE ENTREPRISE : peu d'intérêt sauf si réduction sur un type démat
	nestedDataset[key2c] = datasetNested(datasetFiltered, key2c);
	let key1a2a = key1a + "/" + key2a;
	let key1a2b = key1a + "/" + key2b;
	let key1a2c = key1a + "/" + key2c;
	let keymapF = {};
	keymapF = createKeymap(keymapF, nestedDataset);
	nestedDataset[key1a2a] = creationForStack(datasetFiltered, keymapF, key1a, key2a);
	nestedDataset[key1a2b] = creationForStack(datasetFiltered, keymapF, key1a, key2b);
	nestedDataset[key1a2c] = creationForStack(datasetFiltered, keymapF, key1a, key2c);
}

function afficheLegendeVertical(g, key, keysmapLegende, width) {
	let legend = g.append("g")
				.attr("font-family", "sans-serif")
				.attr("font-size", 9)
				//.attr("text-anchor", "start")
			.selectAll("g")
			.data(keysmapLegende.slice().reverse())
			//.data(keysmapLegende.slice())
			.enter().append("g")
				.attr("transform", function(d, i) { return "translate(0," + i * 17 + ")"; });

	legend.append("rect")
			.attr("x", width + 5)
			.attr("width", 15)
			.attr("height", 15)
			//.attr("fill", z);
			.attr("fill", (function(d) {return c20c(d, key);}));

	legend.append("text")
			.attr("x", width + 30)
			.attr("y", 9.5)
			.attr("dy", "0.32em")
			.text(function(d) { return d; });
	}

function prepAfficheTooltip(idSVG) {
	// Prep the tooltip bits, initial display is hidden
	let tooltip = d3.select(idSVG).append("g")
		.attr("class", "tooltip1")
		.style("z-index", 100)
		.style("display", "none");
	
	tooltip.append("rect")
		.attr("width", 60)
		.attr("height", 20)
		.attr("fill", "white")
		.style("opacity", 0.5);

	tooltip.append("text")
		.attr("x", 30)
		.attr("dy", "1.2em")
		.style("text-anchor", "middle")
		.attr("font-size", "12px")
		.attr("font-weight", "bold");
	
	return tooltip;
}

// Fonction afficheValeursFiltres
function afficheValeursFiltres(array) {
	d3.map(columnListFilterArray).each(function(d) {	
		if(d3.select(d.id).selectAll("option")._groups[0].length == 0) {
			d3.select(d.id).append("option").property("value", "").text(d.text);
			array[d.filter].sort().forEach(function(element) {
				d3.select(d.id).append("option").property("value", element).text(element);
			});
		}
	})
}

// FORMAT affichage avec séparateur milliers
let locale = d3.formatLocale({
	decimal: ",",
	thousands: ".",
	grouping: [3]
});
//let format = locale.format(",.2f");
let format = locale.format(",");

let fileName = 'data/20180627_NP_DAF-RFC5_Synthese-demat-services.txt';
let separateur = '|';

let keysmap = {};
let dataset, datasetFiltered;
let nestedDataset = new Object();

let key1a  = 'ANNEE_MOIS';
let key1b  = 'ANNEE';
let key2a = 'INDIC DEMAT';
let key2b = 'CHAINE_FINANCIERE';
let key2c = 'CATEGORIE_ENTREPRISE';
let key2d = 'SE';
let key2e = 'SE_LIBELLE';

let idSvgArray = ['svg01','svg02', 'svg03'];
let columnListFilterArray = [
	{filter:'ANNEE', id:'#choixAnnee', text:"Annee...", selection:""},
	{filter:'CHAINE_FINANCIERE', id:'#choixChaine', text:"Chaîne...", selection:""},
	{filter:'INDIC DEMAT', id:'#choixDemat', text:"Dématérialisation...", selection:""},
	{filter:'CATEGORIE_ENTREPRISE', id:'#choixTypeTiers', text:"Entreprises...", selection:""}
	];

// set the colors
let z = d3.scaleOrdinal()
		.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

// ou usage des catégories de couleurs
let c10 = d3.scaleOrdinal(d3.schemeCategory10);
let c20 = d3.scaleOrdinal(d3.schemeCategory20);
let c20b = d3.scaleOrdinal(d3.schemeCategory20b);
//let c20c = d3.scaleOrdinal(d3.schemeCategory20c);	
function c20c(val, key) { 
	let ind = keysmap[key].indexOf(val);
	switch(ind) {
		case(-1):
			return "red";
			break;
		default:
			return d3.schemeCategory20c[ind % d3.schemeCategory20c.length];
	}
}

// Fonction FILTRAGEROW filtrage des lignes du fichier
function filtrageRow(donnees) {
	let filtered = [];
	d3.map(columnListFilterArray).each(function(d) {
		filtered = [];
		d3.map(donnees).each(function(data) {
			if (d.selection === null
				|| (d.selection + " ").length === 1 
				|| d.selection === data[d.filter]
				|| (d.filter === key1b &&  d.selection === data[key1a].substring(0,4))
				)
				{ filtered.push(data) }
		})
		donnees = filtered ;
	})
	donnees = filtered ;
	return donnees;	
}

//d3.text(fileName).then(function(raw){
d3.text(fileName, function(error, raw){
	let dsv = d3.dsvFormat(separateur);
	dataset = dsv.parse(raw);
	datasetTraitement();
	keysmap = createKeymap(keysmap, nestedDataset);
	
	// Mise à jour liste de choix au premier affichage
	afficheValeursFiltres(keysmap);
	
	function afficheSvgBarStack(key1, key2, idSVG, valeur, displayAxisX) {
	// Arguments : clé axe X, clé axe Y, valeur ou pourcentage, affichage axe X
		let svg = d3.select(idSVG).style("display", "none");
		let margin = {top: 20, right: 100, bottom: 30, left: 40};
		let width = +svg.attr("width") - margin.left - margin.right;
		let height = +svg.attr("height") - margin.top - margin.bottom;
		let g = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// create the tooltip
		let tooltip = prepAfficheTooltip(idSVG);
		// set x scale
		let x = d3.scaleBand()
				.rangeRound([0, width])
				.paddingInner(0.05)
				.align(0.1);


		// set y scale
		let y = d3.scaleLinear()
				.rangeRound([height, 0]);
		// ValeurY permet de rapatrier value ou pourcentage
		function valeurY(d, val) {
			switch(val) {
				case("percentage"):
					return y(d.percentage);
					break;
				case("value"):
					return y(d.value);
					break;
				default:
					return y(0);
			}
		}	
		
		x.domain(keysmap[key1]);
				// distinction domaine ordonnée en valeur ou en pourcentage
		if(valeur === "value") {
			y.domain([0, d3.max(nestedDataset[key1], function(d) { return d.total; })]).nice();
		} else {
			y.domain([0, 1]);
		}
		z.domain(keysmap[key2]);
		// L'axe des abcisses étant un scaleBand il faut décaler les points de la ligne : il ne faut pas passer directement par la fonctionx
		let xBandwidth = function(d) {return (.5 * x.bandwidth()) + x (d) }
		
				// Affichage axe abcisses
		if (displayAxisX) {
			g.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));
		}
		let formatAxisY;
		switch(valeur) {			
			case("percentage"):
				formatAxisY = d3.axisLeft(y).ticks().tickFormat(d3.format(".0%"));
				break;
			default:
				formatAxisY = d3.axisLeft(y).ticks().tickFormat(format);
		};

		let key1_2 = key1 + "/" + key2;

		g.append("g")
				.selectAll("g")
				.data(d3.stack().keys(keysmap[key2])(nestedDataset[key1_2]))
				.enter()
				.append("g")
					.attr("fill", (function(d) { return c20c(d.key, key2);}))
				.selectAll("rect")
				.data(function(d) { return d; })
				.enter()
					.append("rect")
					.attr("x", function(d) { return x(d.data[key1]); })
					.attr("y", function(d) { 
						if(isNaN(d[0])) d[0]=0;
						if(isNaN(d[1])) d[1]=d[0];
						return y(d[1]); 
						})
					.attr("height", function(d) { return y(d[0]) - y(d[1]); })
					.attr("width", x.bandwidth())
				.on("mouseover", function() { tooltip.style("display", "inline"); })
				.on("mouseout", function() { tooltip.style("display", "none"); })
				.on("mousemove", function(d) {
					let xPosition = d3.mouse(this)[0] - 5;
					let yPosition = d3.mouse(this)[1] - 5;
					tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
					tooltip.select("text").text(format(d[1]-d[0]));
				});
		
		// Affichage des axes
		g.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));

		g.append("g")
				.attr("class", "axis")
				.call(d3.axisLeft(y).ticks())
			.append("text")
				.attr("x", 2)
				.attr("y", y(y.ticks().pop()) + 0.5)
				.attr("dy", "0.32em")
				.attr("fill", "#000")
				.attr("text-anchor", "start");
		
		// Affichage de la légende
		afficheLegendeVertical(g, key2, keysmap[key2], width);

		// Set-up the export button
		d3.select('#generateSVG03').on('click', function(){	envoiSVG(idSvgArray[2], width, height) });
	}
	
/*	
	// Affichage de l'image des commentaires ou des annotations
	d3.select('#generateSVG01C').on('click', function(){afficheAnnotation('#img01Comm')});
	d3.select('#generateSVG02C').on('click', function(){afficheAnnotation('#img02Comm')});
*/	
	
	function afficheSvgLineChart(key1, key2, idSVG, valeur, displayAxisX) {
	// Arguments : clé axe X, clé axe Y, valeur ou pourcentage, affichage axe X
		let svg = d3.select(idSVG).style("display", "none");
		let margin = {top: 20, right: 100, bottom: 30, left: 40};
		let width = +svg.attr("width") - margin.left - margin.right;
		let height = +svg.attr("height") - margin.top - margin.bottom;
		let g = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// create the tooltip
		let tooltip = prepAfficheTooltip(idSVG);
		// set x scale
		let x = d3.scaleBand()
				.rangeRound([0, width])
				.paddingInner(0.05)
				.align(0.1);

		// set y scale
		let y = d3.scaleLinear()
				.rangeRound([height, 0]);
		// ValeurY permet de rapatrier value ou pourcentage
		function valeurY(d, val) {
			switch(val) {
				case("percentage"):
					return y(d.percentage);
					break;
				case("value"):
					return y(d.value);
					break;
				default:
					return y(0);
			}
		}	
		
		x.domain(keysmap[key2]);
		// distinction domaine ordonnée en valeur ou en pourcentage
		if(valeur === "value") {
			y.domain([0, d3.max(nestedDataset[key1], function(d) { return d.max; })]).nice();
		} else {
			y.domain([0, 1]);
		}
		z.domain(keysmap[key1]);
		// L'axe des abcisses étant un scaleBand il faut décaler les points de la ligne : il ne faut pas passer directement par la fonctionx
		let xBandwidth = function(d) {return (.5 * x.bandwidth()) + x (d) };
		
		// calcul des coordonnées de la ligne (avec décalage sur x)
		let line = d3.line()
			.x(function(d) { return xBandwidth(d.key); })
			.y(function(d) {return valeurY(d, valeur)});
		// Affichage axe abcisses
		if (displayAxisX) {
			g.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));
		}
		let formatAxisY;
		switch(valeur) {
			case("percentage"):
				formatAxisY = d3.axisLeft(y).ticks().tickFormat(d3.format(".0%"));
				break;
			default:
				formatAxisY = d3.axisLeft(y).ticks().tickFormat(format);
		};
			
		g.append("g")
			.attr("class", "axis")
			.call(formatAxisY)
			.append("text")
				.attr("x", 2)
				.attr("y", y(y.ticks().pop()) + 0.5)
				.attr("dy", "0.32em")
				.attr("fill", "#000")
				.attr("text-anchor", "start");
		
		let typeClass = g.selectAll(".type")
			.data(nestedDataset[key1])
			.enter()
				.append("g")
				.attr("class", "type");			
		
		typeClass.append("path")
			.attr("class", function(d) { return "line " + d.key; })
			.attr("d", function(d) { return line(d[key2]); })
			.style("stroke", function(d) { return c20c(d.key, key1); });

		typeClass.append("text")
			.datum(function(d) { return {key: d.key, valeur: d[key2][d[key2].length - 1]}; })
			.attr("class", function(d) { return "textLine " + d.key})
			.attr("transform", function(d) { return "translate(" + xBandwidth(d.valeur.key) + "," + valeurY(d.valeur, valeur) + ")"; })
			.attr("x", 10)
			.attr("dy", "0.35em")
			.attr("text-anchor", "start")
			.style("fill", function(d) { return c20c(d.key, key1); })
			.text(function(d) { return d.key; });
			
		let dKey;
		typeClass.selectAll("circle")
			.data(function(d) { dKey = d.key; return d[key2] })
			.enter()
				.append("circle")
				.attr("class", dKey)
				.attr("cx", function(d) { return xBandwidth(d.key)})
				.attr("cy", function(d) {return valeurY(d, valeur)})				
				.attr("r", 3)
				.style("fill", c20c(dKey, key1));	

		let focus = g.append("g")
			.attr("class", "focus")
			.style("display", "none");
		focus.append("line")
			.attr("class", "x-hover-line hover-line")
			.attr("y1", 0)
			.attr("y2", height);
		focus.append("line")
			.attr("class", "y-hover-line hover-line")
			.attr("x1", width)
			.attr("x2", width);
		focus.append("circle")
			.attr("r", 7.5);
		focus.append("text")
			.attr("x", 15)
			.attr("dy", ".31em");			
				
		svg.append("rect")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.attr("class", "overlay")
			.attr("width", width)
			.attr("height", height)
			.on("mouseover", function() { focus.style("display", null); })
			.on("mouseout", function() { focus.style("display", "none"); })
			.on("mousemove", mousemove);
		
		// ANNOTATIONS
		const annotationsPercentage = [
			{
				type: d3.annotationCalloutCircle,
				note: {
					label: "1er janvier 2017",
					title: "Obligation pour les GE et le secteur public",
					wrap: 150,
					align: "middle"
					},
				x: xBandwidth("2017-01"), y: y(0.299),
				dy: -130, dx: 80,
				subject: { radius: 20 }
			},
			{
				type: d3.annotationLabel,
				note: {
					label: "Alerte !",
					title: "Chute non justifiée",
					wrap: 150,
					align: "middle"
					},
				connector: {
					end: "arrow" // 'dot' also available
					},
				x: xBandwidth("2017-12"), y: y(0.45),
				dy: 80, dx: -100
			},
			{
				type: d3.annotationCalloutCircle,
				note: {
					label: "1er janvier 2018",
					title: "Obligation pour les ETI",
					wrap: 150,
					align: "middle"
					},
				x: xBandwidth("2018-01"), y: y(0.503),
				dy: -70, dx: 60,
				subject: { radius: 20 }
			}
		];
		const annotationsValue = [
			{
				type: d3.annotationLabel,
				note: {
					label: "Alerte !",
					title: "Chute non justifiée",
					wrap: 150,
					align: "middle"
					},
				connector: {
					end: "arrow" // 'dot' also available
					},
				x: xBandwidth("2017-12"), y: y(19247),
				dy: 60, dx: -100
			}
		].map(function(d){ d.color = "red"; return d});
		
		const makeAnnotationsPercentage = d3.annotation()
			//.type(d3.annotationLabel)
			.annotations(annotationsPercentage);
		const makeAnnotationsValue = d3.annotation()
			//.type(d3.annotationLabel)
			.annotations(annotationsValue);
		
		if(idSVG === "#" + idSvgArray[0]){
			document.fonts.ready.then(function(){
				g.append("g")
					.attr("class", "annotation-group")
					.attr("id", idSvgArray[0] + "Annotation")
					.call(makeAnnotationsPercentage)
				});		
		};
		
		if(idSVG === "#" + idSvgArray[1]){
			document.fonts.ready.then(function(){
				g.append("g")
					.attr("class", "annotation-group")
					.attr("id", idSvgArray[1] + "Annotation")
					.call(makeAnnotationsValue)
				});
		}
		function mousemove() {
			// recherche abcisse en fonction de la position de la souris
			let bandMouse = Math.trunc(d3.mouse(this)[0]/x.bandwidth());
			if (bandMouse >= x.domain().length) bandMouse = x.domain().length - 1;
			let periodeMouse = x.domain()[bandMouse];
			// recherche ordonnée en fonction de la position de la souris
			let volumeMouse = y.invert(d3.mouse(this)[1]);
			let yArray = [];
			for(let i=0; i < nestedDataset[key1].length; i++){
				let yType;
				if(typeof nestedDataset[key1][i][key2][bandMouse] != "undefined") {
					if(valeur === "value") {
						yType = nestedDataset[key1][i][key2][bandMouse].value;
						} else {
						yType = nestedDataset[key1][i][key2][bandMouse].percentage;
						}
					} else {
					yType = 0;
					}
				yArray.push(yType);				
				}
			yArray.sort(function(a, b) {
					return a - b;
				});
			let i=0;
			let indicateur = false;
			do {
				if (volumeMouse <= yArray[i]) {
					volumeMouse = yArray[i];
					indicateur = true ;
					}
				if (!indicateur && volumeMouse > yArray[yArray.length - 1]) {
					volumeMouse = yArray[yArray.length - 1];
					indicateur = true ;
					}
				i++;
				} while (i < yArray.length && !indicateur);
				
			if (!indicateur) volumeMouse = yArray[0];
			focus.attr("transform", "translate(" + xBandwidth(periodeMouse) + "," + y(volumeMouse) + ")");
			focus.select(".x-hover-line").attr("y2", height - y(volumeMouse));
			focus.select(".y-hover-line").attr("x2", width + width);
			focus.select("text").text(function(d) {
				if(valeur === "value") {
					return format(volumeMouse);
					} else {
					return d3.format(".1%")(volumeMouse);
					}
				});
		}	
		// Set-up the export button
		d3.select('#generateSVG01').on('click', function(){	envoiSVG(idSvgArray[0], width, height) });
		d3.select('#generateSVG02').on('click', function(){	envoiSVG(idSvgArray[1], width, height) });
	}

	// Affichage de l'image des commentaires ou des annotations
	d3.select('#generateSVG01C').on('click', function(){afficheAnnotation('#' + idSvgArray[0]+ 'Annotation')});
	d3.select('#generateSVG02C').on('click', function(){afficheAnnotation('#' + idSvgArray[1]+ 'Annotation')});
	d3.select('#generateSVG03C').on('click', function(){afficheAnnotation('#' + idSvgArray[2]+ 'Annotation')});
		
	// Affichage / Masquage d'une annotation	
	function afficheAnnotation(idAnnotation) {
		if (d3.select(idAnnotation).style("display") === "none") {
			d3.select(idAnnotation).style("display", "inline");
		} else {
			d3.select(idAnnotation).style("display", "none");
		}
	}
	// Affichage des indicateurs
	function afficheIndicateurs(key1, key2){
		let traductionMois = {
			"January": "Janvier",
			"February": "Février",
			"March": "Mars",
			"April": "Avril",
			"May": "Mai",
			"June": "Juin",
			"July": "Juillet",
			"August": "Août",
			"September": "Septembre",
			"October": "Octobre",
			"November": "Novembre",
			"December": "Décembre"};
		let textePeriode ="";
		let textePercentagePeriode ="";
		let textePeriodePrec ="";
		let textePercentagePeriodePrec ="";
		let arrayKey1 = nestedDataset[key1].map(function(d){return d.key;});
		let indice1 = arrayKey1.indexOf("NATIVE");
		// Les indicateurs sont à 100% si un filtre sur la démat est chargé ==> ne rien afficher
		//if (arrayKey1.indexOf(columnListFilterArray[2].selection) >= 0) {indice1 = arrayKey1.indexOf(columnListFilterArray[2].selection) }
		if (arrayKey1.indexOf(columnListFilterArray[2].selection) >= 0) {indice1 = -1; }
		if (indice1 >= 0 && typeof nestedDataset[key1][indice1][key2] != "undefined"){
			let indice2Max = nestedDataset[key1][indice1][key2].length - 1;
			let parseAnneeMois = d3.timeParse("%Y-%m");
			textePeriode = nestedDataset[key1][indice1][key2][indice2Max].key;
			textePercentagePeriode = d3.format(".0%")(nestedDataset[key1][indice1][key2][indice2Max].percentage);
			if (indice2Max > 0){
				textePeriodePrec = nestedDataset[key1][indice1][key2][indice2Max - 1].key;
				textePercentagePeriodePrec = d3.format(".0%")(nestedDataset[key1][indice1][key2][indice2Max - 1].percentage);
			};
			if(key2 === "ANNEE_MOIS" && textePeriode != "") {textePeriode = traductionMois[d3.timeFormat("%B")(parseAnneeMois(textePeriode))];}
			if(key2 === "ANNEE_MOIS" && textePeriodePrec != "") {textePeriodePrec = traductionMois[d3.timeFormat("%B")(parseAnneeMois(textePeriodePrec))];}
		};
		d3.select('#ind'+key2+'Text00').text(textePeriode);
		d3.select('#ind'+key2+'Text01').text(textePercentagePeriode);
		d3.select('#ind'+key2+'Text02').text(textePeriodePrec + " " + textePercentagePeriodePrec);		
	}
	// AFFICHAGE DES GRAPHIQUES et des INDICATEURS
	function afficheSVGs() {
		// Suppression des anciens graphiques
		d3.select("#" + idSvgArray[0]).selectAll("g").transition().duration(200).ease(d3.easeLinear).remove();
		d3.select("#" + idSvgArray[1]).selectAll("g").transition().duration(200).ease(d3.easeLinear).remove();
		d3.select("#" + idSvgArray[2]).selectAll("g").transition().duration(200).ease(d3.easeLinear).remove();
		//Préparation de l'affichage  (Display none par défaut)
		afficheIndicateurs(key2a, key1b);
		afficheIndicateurs(key2a, key1a);
		afficheSvgLineChart(key2a, key1a, "#" + idSvgArray[0],"percentage",true);
		afficheSvgLineChart(key2a, key1a, "#" + idSvgArray[1],"value",true);
		afficheSvgBarStack(key1a, key2b, "#" + idSvgArray[2],"value",true);
		//afficheSvgLineChart(fileName, separateur, key2b, key1, "#" + idSVG03);
		// Affichage des graphiques
		d3.select("#" + idSvgArray[0]).transition().duration(500).ease(d3.easeLinear).style("display", "inline");
		d3.select("#" + idSvgArray[1]).transition().duration(500).ease(d3.easeLinear).style("display", "inline");
		d3.select("#" + idSvgArray[2]).transition().duration(500).ease(d3.easeLinear).style("display", "inline");
	}
	
	afficheSVGs();
	
	// RE AFFICHAGE DES GRAPHIQUES et des INDICATEURS DES QU'UN FILTRE EST MODIFIE	
	d3.map(columnListFilterArray).each(function(d) {
		d3.select(d.id).on("change", function() {
			d.selection = d3.select(this).property("value");
			datasetFiltered = filtrageRow(dataset);
			datasetTraitement();
			keysmap = createKeymap(keysmap, nestedDataset);
			afficheSVGs();
		});
	})
	
});

// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )

function envoiSVG(idSVG, width, height) {
	let svgString = getSVGString(d3.select('#' + idSVG).node());
	svgString2Image( svgString, width, height, 'png', save ); // passes Blob and filesize String to the callback
	function save( dataBlob, filesize ){
		saveAs( dataBlob, idSVG +'.png' ); // FileSaver.js function
	}
}

function getSVGString( svgNode ) {
	svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
	let cssStyleText = getCSSStyles( svgNode );
	appendCSS( cssStyleText, svgNode );

	let serializer = new XMLSerializer();
	let svgString = serializer.serializeToString(svgNode);
	svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
	svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

	return svgString;

	function getCSSStyles( parentElement ) {
		let selectorTextArr = [];

		// Add Parent element Id and Classes to the list
		selectorTextArr.push( '#'+parentElement.id );
		for (let c = 0; c < parentElement.classList.length; c++)
				if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
					selectorTextArr.push( '.'+parentElement.classList[c] );

		// Add Children element Ids and Classes to the list
		let nodes = parentElement.getElementsByTagName("*");
		for (let i = 0; i < nodes.length; i++) {
			let id = nodes[i].id;
			if ( !contains('#'+id, selectorTextArr) )
				selectorTextArr.push( '#'+id );

			let classes = nodes[i].classList;
			for (let c = 0; c < classes.length; c++)
				if ( !contains('.'+classes[c], selectorTextArr) )
					selectorTextArr.push( '.'+classes[c] );
		}

		// Extract CSS Rules
		let extractedCSSText = "";
		for (let i = 0; i < document.styleSheets.length; i++) {
			let s = document.styleSheets[i];
			
			try {
			    if(!s.cssRules) continue;
			} catch( e ) {
		    		if(e.name !== 'SecurityError') throw e; // for Firefox
		    		continue;
		    	}

			let cssRules = s.cssRules;
			for (let r = 0; r < cssRules.length; r++) {
				if ( contains( cssRules[r].selectorText, selectorTextArr ) )
					extractedCSSText += cssRules[r].cssText;
			}
		}
	
		return extractedCSSText;

		function contains(str,arr) {
			return arr.indexOf( str ) === -1 ? false : true;
		}
	}

	function appendCSS( cssText, element ) {
		let styleElement = document.createElement("style");
		styleElement.setAttribute("type","text/css"); 
		styleElement.innerHTML = cssText;
		let refNode = element.hasChildNodes() ? element.children[0] : null;
		element.insertBefore( styleElement, refNode );
	}
}

function svgString2Image( svgString, width, height, formatImage, callback ) {
	let format = formatImage ? formatImage : 'png';

	let imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

	let canvas = document.createElement("canvas");
	let context = canvas.getContext("2d");

	canvas.width = width;
	canvas.height = height;

	let image = new Image();
	image.onload = function() {
		context.clearRect ( 0, 0, width, height );
		context.drawImage(image, 0, 0, width, height);

		canvas.toBlob( function(blob) {
			let filesize = Math.round( blob.length/1024 ) + ' KB';
			if ( callback ) callback( blob, filesize );
		});
	};
	
	image.src = imgsrc;
}




