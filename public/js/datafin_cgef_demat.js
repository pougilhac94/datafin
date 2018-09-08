'use strict';
// Si Javascript est émulé, la mention de blocage doit disparaître
d3.select('#noJavascript').style("display", "none");

const titreGeneral = 'DATAVISUALISATION : LA DEMATERIALISATION DES FACTURES';
d3.select('#titregeneral')
    .select('h1')
    .text(titreGeneral);
let texteColGaucheHTML = "<p class='font-weight-bold'>Le suivi de la dématérialisation des factures</p>";
texteColGaucheHTML += "<p>Le sujet reste encore à développer...</p>"
let texteColDroiteMTML = "<p class='font-weight-bold'>Règles générales d'usage</p>";
texteColDroiteMTML += "<p>Il s'agit de décrire les principales règles de navigation dans les graphes, l'usage des filtres, les possibilités d'exportation, la récupération des images,...</p>"
d3.select('#col-gauche').html(texteColGaucheHTML);
d3.select('#col-droite').html(texteColDroiteMTML);

// VERSION SERVEUR WEB (voir routes pour l'arborescence) ou SOLO (firefox sans serveur)
let radicalCheminSolo = '';
let radicalCheminSoloDatatables = '';
if (window.location.protocol === 'file:') {radicalCheminSolo = './public/data/'; radicalCheminSoloDatatables = './public/js_generic/datatables/';}
let fileName = radicalCheminSolo +  '20180828_NP_DAF-RFC5_Synthese-demat-services.txt';
let myFileDatabase1 = radicalCheminSolo + '20180524_NP_DAF-RFC5_Synthese-demat-GE-PUBLIC.json';
let myFileDatabase2 = radicalCheminSolo + '20180524_NP_DAF-RFC5_Synthese-demat-ETI.json';
let myFileDatabase3 = radicalCheminSolo + '20180524_NP_DAF-RFC5_Synthese-demat-PME-PMI.json';
let urlFrench = radicalCheminSoloDatatables + 'French.json';

const separateur = '|';
const pourcentage = "pourcentage"; 

let myFileDatabase;

let myDatabase, myDatabaseOrigine;
	
// FORMAT affichage avec séparateur milliers
const locale = d3.formatLocale({
	decimal: ",",
	thousands: ".",
	grouping: [3]
});
//let format = locale.format(",.2f");
const format = locale.format(",");

// set the colors, voir site databrewer
let zColors = d3.scaleOrdinal(d3.schemeBlues[9].reverse());

let dataset;
let datasetCF;

let datasetByANNEE_MOIS, datasetByCHAINE_FINANCIERE, datasetByCATEGORIE_ENTREPRISE, datasetByINDIC_DEMAT, datasetBySE;
let datasetByAll;
let datasetByANNEE_MOISandINDIC_DEMAT, datasetByANNEE_MOISandCATEGORIE_ENTREPRISE, datasetByANNEE_MOISandCHAINE_FINANCIERE, datasetByANNEE_MOISandSE;
let datasetNombreByANNEE_MOIS, datasetNombreByCHAINE_FINANCIERE, datasetNombreByCATEGORIE_ENTREPRISE, datasetNombreByINDIC_DEMAT, datasetNombreBySE;
let datasetArrayNombreByANNEE_MOIS;
let datasetArrayKeyANNEE_MOIS, datasetArrayKeyCHAINE_FINANCIERE, datasetArrayKeyINDIC_DEMAT, datasetArrayKeyCATEGORIE_ENTREPRISE, datasetArrayKeySE;
let datasetNombreByANNEE_MOISandINDIC_DEMAT,datasetNombreByANNEE_MOISandCATEGORIE_ENTREPRISE,datasetNombreByANNEE_MOISandCHAINE_FINANCIERE, datasetNombreByANNEE_MOISandSE;
let datasetTopByANNEE_MOISandINDIC_DEMAT, datasetTopByANNEE_MOISandCATEGORIE_ENTREPRISE, datasetTopByANNEE_MOISandCHAINE_FINANCIERE, datasetTopByANNEE_MOISandSE;
let datasetTopByANNEE_MOISandINDIC_DEMATmax, datasetTopByANNEE_MOISandCATEGORIE_ENTREPRISEmax,datasetTopByANNEE_MOISandCHAINE_FINANCIEREmax, datasetTopByANNEE_MOISandSEmax;
let datasetNombreByANNEE, datasetNombreByANNEEandINDIC_DEMAT;
let datasetStackANNEE_MOISandSEArray = new Array();
let datasetStackSE, dataStackTotalMax;

const key1a = 'ANNEE_MOIS';
const key1b = 'ANNEE';
const key2a = 'CHAINE_FINANCIERE';
const key2b = "INDIC DEMAT";
const key2c = "CATEGORIE_ENTREPRISE";
const key2d = "SE";
const arrayChaineAvecNumerisation = ["DGA",, "DIRISI", "Hors CGEF", "SCA-SC","SEA", "SFACT", "SID", "SPAC"];
const arrayChainePourDetailSE = ["SCA-SC","SCA-OME", "SCA-OPEX", "DGA", "SID", "Hors CGEF"];
const columnListFilter = [key1b, key2a, key2b, key2c];
let valFiltres = ['*', '*', '*', '*'];
let valFiltresPrecedents = ['*', '*', '*', '*'];
const arrayItemBigCircle = ["NATIVE", "GE"];

let filtersOkForDatatables = false;
let calculFiltersOkForDatatables = (val) => (val[0] != '*' && val[2] != '*' && val[3] != '*' ) ? true : false;

// Fonction afficheValeursFiltres
let	afficheValeursFiltres = function(key, array) {
	switch(key) {
		case("ANNEE_MOIS"):
			if(d3.select("#choixAnnee").selectAll("option")._groups[0].length == 0)	{
				d3.select("#choixAnnee").append("option").attr("id", "optionAnnee").property("value", "*").property('selected', true).text("Annee...");
				array.sort().reverse().forEach(d => d3.select("#choixAnnee").append("option").attr("id", d).property("value", d).text(d));
			}
			break;
		case("CHAINE_FINANCIERE"):
			if(d3.select("#choixChaine").selectAll("option")._groups[0].length == 0)	{
				d3.select("#choixChaine").append("option").attr("id", "optionChaine").property("value", "*").property('selected', true).text("Chaîne...");
				array.sort().forEach(d => d3.select("#choixChaine").append("option").attr("id", d).property("value", d).text(d));
			}
		break;
		case("INDIC DEMAT"):
			if(d3.select("#choixDemat").selectAll("option")._groups[0].length == 0)	{
				d3.select("#choixDemat").append("option").attr("id", "optionDemat").property("value", "*").property('selected', true).text("Type...");
				array.sort().forEach(d => d3.select("#choixDemat").append("option").attr("id", d).property("value", d).text(d));
			}
			break;
		case("CATEGORIE_ENTREPRISE"):
			if(d3.select("#choixTypeTiers").selectAll("option")._groups[0].length == 0)	{
				d3.select("#choixTypeTiers").append("option").attr("id", "optionTypeTiers").property("value", "*").property('selected', true).text("Entreprises...");
				array.sort().forEach(d => d3.select("#choixTypeTiers").append("option").attr("id", d).property("value", d).text((d === '-')? 'Non classifiée' : d));
			}
		break;
	};
}

//d3.text(fileName).then(function(raw){
//	let dsv = d3.dsvFormat(separateur);
//	dataset = dsv.parse(raw);
//datasetCF = crossfilter(dsv.parse(raw));
d3.dsv(separateur,fileName, function(d) {
	return {
		SOCIETE: d.SOCIETE,
		SE: d.SE,
		CHAINE_FINANCIERE: d.CHAINE_FINANCIERE,
		ANNEE_MOIS: d.ANNEE_MOIS,
		OBS: d.OBS,
		CATEGORIE_ENTREPRISE: d.CATEGORIE_ENTREPRISE,
		CODE_DEPOT: d.CODE_DEPOT,
		LIBELLE_CODE_DEPOT: d.LIBELLE_CODE_DEPOT,
		STATUT: d.STATUT,
		LIBELLE_STATUT: d.LIBELLE_STATUT,
		CODE_APPLI: d.CODE_APPLI,
		nbre: d.nbre,
		// on en profite pour ajouter _ dans le camp
		// la DEMAT_IND est NATIVE lorsque la chaîne financière ne pratique pas la numérisation
		INDIC_DEMAT: (
			d["INDIC DEMAT"] != "DEMAT_IND" ? d["INDIC DEMAT"] :
				//(arrayChaineAvecNumerisation.indexOf(d.CHAINE_FINANCIERE) < 0 ? "NATIVE" : d["INDIC DEMAT"])
				(arrayChaineAvecNumerisation.indexOf(d.CHAINE_FINANCIERE) < 0 ? "NATIVE" : 
					(Math.random() < 0.8 ? "NATIVE" : "NUMERISATION")
				)
			),
		SE_LIBELLE: d.SE_LIBELLE		
	};}).then(function(raw){
	dataset = raw;
	datasetCF = crossfilter(raw);

	datasetByANNEE_MOIS = datasetCF.dimension(d => d.ANNEE_MOIS);
	datasetByCHAINE_FINANCIERE = datasetCF.dimension(d => d.CHAINE_FINANCIERE);
	datasetByINDIC_DEMAT = datasetCF.dimension(d => d.INDIC_DEMAT);
	datasetByCATEGORIE_ENTREPRISE = datasetCF.dimension(d => d.CATEGORIE_ENTREPRISE);
	datasetByAll = datasetCF.dimension(d => d.ANNEE_MOIS + '|' + d.CHAINE_FINANCIERE + '|' + d.INDIC_DEMAT + '|' + d.CATEGORIE_ENTREPRISE);
	
	let datasetByANNEE = datasetCF.dimension(d => d.ANNEE_MOIS.substring(0,4));
	const datasetArrayKeyANNEE = datasetByANNEE.group().all().map(d => d.key).sort();
	afficheValeursFiltres(key1a, datasetArrayKeyANNEE);
	datasetByANNEE.remove();

	let calculDataDimensions = function() {
		datasetNombreByANNEE_MOIS = datasetByANNEE_MOIS.group().reduceSum(d => d.nbre);
		datasetArrayNombreByANNEE_MOIS = datasetNombreByANNEE_MOIS.all();
		datasetNombreByCHAINE_FINANCIERE = datasetByCHAINE_FINANCIERE.group().reduceSum(d => d.nbre);
		datasetNombreByINDIC_DEMAT = datasetByINDIC_DEMAT.group().reduceSum(d => d.nbre);
		datasetNombreByCATEGORIE_ENTREPRISE = datasetByCATEGORIE_ENTREPRISE.group().reduceSum(d => d.nbre);

		if (arrayChainePourDetailSE.indexOf(valFiltres[1]) >= 0) {
			datasetBySE = datasetCF.dimension(d => d.CHAINE_FINANCIERE + '  ' + d.SE);
			datasetNombreBySE = datasetBySE.group().reduceSum(d => d.nbre);
			datasetByANNEE_MOISandSE = datasetCF.dimension(d => d.ANNEE_MOIS + '  ' + d.CHAINE_FINANCIERE + '  ' + d.SE);
			datasetNombreByANNEE_MOISandSE = datasetByANNEE_MOISandSE.group().reduceSum(d => d.nbre);
			datasetTopByANNEE_MOISandSE = datasetNombreByANNEE_MOISandSE.top(1);
			datasetTopByANNEE_MOISandSEmax = datasetTopByANNEE_MOISandSE[0].value;
			datasetArrayKeySE = datasetNombreBySE.all().map(d => d.key).sort();
			
			let datasetStackANNEE_MOISandSE = datasetNombreByANNEE_MOISandSE.all().filter(d => d.key.split('  ')[1] === valFiltres[1]);
			let datasetStackAM = datasetStackANNEE_MOISandSE.map(d => d.key.split('  ')[0])
			datasetStackAM = datasetStackAM.filter((item, pos) => datasetStackAM.indexOf(item) === pos)
			datasetStackSE = datasetStackANNEE_MOISandSE.map(d => d.key.split('  ')[2])
			datasetStackSE = datasetStackSE.filter((item, pos) => datasetStackSE.indexOf(item) === pos)
			dataStackTotalMax = 0;
			for(let i = 0; i < datasetStackAM.length; i++){
				let datasetStackANNEE_MOISandSEObject = new Object();
				let datasetStackANNEE_MOISandSEIndex;
				datasetStackANNEE_MOISandSEObject.key = datasetStackAM[i];
				datasetStackANNEE_MOISandSEObject.total = 0;
				for(let j = 0; j < datasetStackSE.length; j++){
					datasetStackANNEE_MOISandSEIndex = datasetStackANNEE_MOISandSE.findIndex(d => d.key === datasetStackAM[i] + '  ' + valFiltres[1] + '  ' + datasetStackSE[j]);
					if (datasetStackANNEE_MOISandSEIndex < 0 ) {
						datasetStackANNEE_MOISandSEObject[datasetStackSE[j]] = 0;						
					} else {
						datasetStackANNEE_MOISandSEObject[datasetStackSE[j]] = datasetStackANNEE_MOISandSE[datasetStackANNEE_MOISandSEIndex].value;
						datasetStackANNEE_MOISandSEObject.total += datasetStackANNEE_MOISandSE[datasetStackANNEE_MOISandSEIndex].value;
					}
				}
				datasetStackANNEE_MOISandSEArray[i] = datasetStackANNEE_MOISandSEObject;
				dataStackTotalMax = Math.max(dataStackTotalMax, datasetStackANNEE_MOISandSEObject.total);
			}
		}
		
		datasetArrayKeyANNEE_MOIS = datasetNombreByANNEE_MOIS.all().map(d => d.key).sort();
		datasetArrayKeyCHAINE_FINANCIERE = datasetNombreByCHAINE_FINANCIERE.all().map(d => d.key).sort();
		datasetArrayKeyINDIC_DEMAT = datasetNombreByINDIC_DEMAT.all().map(d => d.key).sort();
		datasetArrayKeyCATEGORIE_ENTREPRISE = datasetNombreByCATEGORIE_ENTREPRISE.all().map(d => d.key).sort();
		
		datasetByANNEE_MOISandINDIC_DEMAT = datasetCF.dimension(d => d.ANNEE_MOIS + d.INDIC_DEMAT);
		datasetNombreByANNEE_MOISandINDIC_DEMAT = datasetByANNEE_MOISandINDIC_DEMAT.group().reduceSum(d => d.nbre);
		datasetTopByANNEE_MOISandINDIC_DEMAT = datasetNombreByANNEE_MOISandINDIC_DEMAT.top(1);
		datasetTopByANNEE_MOISandINDIC_DEMATmax = datasetTopByANNEE_MOISandINDIC_DEMAT[0].value;

		datasetByANNEE_MOISandCATEGORIE_ENTREPRISE = datasetCF.dimension(d => d.ANNEE_MOIS + d.CATEGORIE_ENTREPRISE);
		datasetNombreByANNEE_MOISandCATEGORIE_ENTREPRISE = datasetByANNEE_MOISandCATEGORIE_ENTREPRISE.group().reduceSum(d => d.nbre);
		datasetTopByANNEE_MOISandCATEGORIE_ENTREPRISE = datasetNombreByANNEE_MOISandCATEGORIE_ENTREPRISE.top(1);
		datasetTopByANNEE_MOISandCATEGORIE_ENTREPRISEmax = datasetTopByANNEE_MOISandCATEGORIE_ENTREPRISE[0].value;

		datasetByANNEE_MOISandCHAINE_FINANCIERE = datasetCF.dimension(d => d.ANNEE_MOIS + d.CHAINE_FINANCIERE);
		datasetNombreByANNEE_MOISandCHAINE_FINANCIERE = datasetByANNEE_MOISandCHAINE_FINANCIERE.group().reduceSum(d => d.nbre);
		datasetTopByANNEE_MOISandCHAINE_FINANCIERE = datasetNombreByANNEE_MOISandCHAINE_FINANCIERE.top(1);
		datasetTopByANNEE_MOISandCHAINE_FINANCIEREmax = datasetTopByANNEE_MOISandCHAINE_FINANCIERE[0].value;

		datasetNombreByANNEE = datasetCF.dimension(d => d.ANNEE_MOIS.substring(0,4)).group().reduceSum(d => d.nbre).all();
		datasetNombreByANNEEandINDIC_DEMAT = datasetCF.dimension(d => d.ANNEE_MOIS.substring(0,4) + d.INDIC_DEMAT).group().reduceSum(d => d.nbre).all();
	}

	calculDataDimensions();
	
	afficheValeursFiltres(key2a, datasetArrayKeyCHAINE_FINANCIERE);
	afficheValeursFiltres(key2b, datasetArrayKeyINDIC_DEMAT);
	afficheValeursFiltres(key2c, datasetArrayKeyCATEGORIE_ENTREPRISE);
	
	// Affichage des indicateurs
	let afficheIndicateurs = function (key1, key2){
		const traductionMois = {
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
			"December": "Décembre"
		};
		let textePeriode ="";
		let textePercentagePeriode ="";
		let textePeriodePrec ="";
		let textePercentagePeriodePrec ="";
		let datasetNombreByANNEE_All, datasetNombreByANNEEandINDIC_DEMAT_All;
		let datasetNombreByANNEE_MOIS_All, datasetNombreByANNEE_MOISandINDIC_DEMAT_All;

		let parseAnneeMois = d3.timeParse("%Y-%m");
		
		datasetNombreByANNEE_All = datasetNombreByANNEE.filter(d => d.key === valFiltres[0] || valFiltres[0] === "*");
		datasetNombreByANNEEandINDIC_DEMAT_All = datasetNombreByANNEEandINDIC_DEMAT.filter(d => (d.key.substring(0,4) === valFiltres[0] || valFiltres[0] === "*") && d.key.substring(4) === "NATIVE");
		datasetNombreByANNEE_MOIS_All = datasetNombreByANNEE_MOIS.all().filter(d => d.key.substring(0,4) === valFiltres[0] || valFiltres[0] === "*");
		datasetNombreByANNEE_MOISandINDIC_DEMAT_All = datasetNombreByANNEE_MOISandINDIC_DEMAT.all().filter(d => (d.key.substring(0,4) === valFiltres[0] || valFiltres[0] === "*") && d.key.substring(7) === "NATIVE");

		textePeriode = datasetNombreByANNEE_All[datasetNombreByANNEE_All.length - 1].key;
		if(datasetNombreByANNEE_All.length > 1) textePeriodePrec = datasetNombreByANNEE_All[datasetNombreByANNEE_All.length - 2].key;

		if(key2 === "ANNEE_MOIS" && textePeriode != "")
			textePeriode = traductionMois[d3.timeFormat("%B")(parseAnneeMois(datasetNombreByANNEE_MOIS_All[datasetNombreByANNEE_MOIS_All.length - 1].key))];
		if(key2 === "ANNEE_MOIS" && textePeriode != "" && datasetNombreByANNEE_MOIS_All.length > 1)
			textePeriodePrec = traductionMois[d3.timeFormat("%B")(parseAnneeMois(datasetNombreByANNEE_MOIS_All[datasetNombreByANNEE_MOIS_All.length - 2].key))];

		textePercentagePeriode = d3.format(".0%")(datasetNombreByANNEEandINDIC_DEMAT_All[datasetNombreByANNEEandINDIC_DEMAT_All.length - 1].value/datasetNombreByANNEE_All[datasetNombreByANNEE_All.length - 1].value);
		if(datasetNombreByANNEE_All.length > 1)
			textePercentagePeriodePrec = d3.format(".0%")(datasetNombreByANNEEandINDIC_DEMAT_All[datasetNombreByANNEEandINDIC_DEMAT_All.length - 2].value/datasetNombreByANNEE_All[datasetNombreByANNEE_All.length - 2].value);

		if(key2 === "ANNEE_MOIS" && textePercentagePeriode != "" && datasetNombreByANNEE_MOIS_All[datasetNombreByANNEE_MOIS_All.length - 1].value !=0)
			textePercentagePeriode = d3.format(".0%")(datasetNombreByANNEE_MOISandINDIC_DEMAT_All[datasetNombreByANNEE_MOISandINDIC_DEMAT_All.length - 1].value/datasetNombreByANNEE_MOIS_All[datasetNombreByANNEE_MOIS_All.length - 1].value);
		if(key2 === "ANNEE_MOIS" && textePercentagePeriode != "" && datasetNombreByANNEE_MOIS_All[datasetNombreByANNEE_MOIS_All.length - 1].value ===0)
			textePercentagePeriode = d3.format(".0%")(0);
		if(key2 === "ANNEE_MOIS" && textePercentagePeriode != "" && datasetNombreByANNEE_MOIS_All.length > 1 && datasetNombreByANNEE_MOIS_All[datasetNombreByANNEE_MOIS_All.length - 2].value != 0)
			textePercentagePeriodePrec = d3.format(".0%")(datasetNombreByANNEE_MOISandINDIC_DEMAT_All[datasetNombreByANNEE_MOISandINDIC_DEMAT_All.length - 2].value/datasetNombreByANNEE_MOIS_All[datasetNombreByANNEE_MOIS_All.length - 2].value);
		if(key2 === "ANNEE_MOIS" && textePercentagePeriode != "" && datasetNombreByANNEE_MOIS_All.length > 1 && datasetNombreByANNEE_MOIS_All[datasetNombreByANNEE_MOIS_All.length - 2].value === 0)
			textePercentagePeriodePrec = d3.format(".0%")(0);
		
		d3.select('#ind'+key2+'Text00').text(textePeriode);
		d3.select('#ind'+key2+'Text01').text(textePercentagePeriode);
		d3.select('#ind'+key2+'Text02').text(textePeriodePrec + " " + textePercentagePeriodePrec);
		
	}

	/* FONCTION CREATION SVG : ATTRIBUTS
		idSVG : id selectionne
		titre : titre du chart
		domainX_Array : array des abcisses
		domainY_Max : valeur max des ordonnees
		domainZ_Array : array des couleurs 
		axeZ : range de l'axe z
		valeur : pourcentage sinon en nombre par defaut
								RETURN :
		object.id : id du svg
		object.x : fonction x
		object.y : fonction y
		object.z : fonction z
		object.g : element g du svg
		object.height : hauteur du svg
		object.width : largeur du svg
	*/
	let createSVG = function(idSVG, titre, domainX_Array, domainY_Max, domainZ_Array, axeZ, valeur) {
		// affichage du titre du graphique
		d3.select("#titre" + idSVG).text(titre);
		// create the svg
		let svg = d3.select("#" + idSVG).style("display", "inline");
		let margin = {top: 20, right: 100, bottom: 30, left: 40};
		let width = +svg.attr("width") - margin.left - margin.right;
		let height = +svg.attr("height") - margin.top - margin.bottom;
		let g = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// set x scale
		let x = d3.scaleBand()
				.rangeRound([0, width])
				.paddingInner(0.05)
				.align(0.1);

		// set y scale
		let y = d3.scaleLinear()
				.rangeRound([height, 0]);
		let formatAxisY;
		switch(valeur) {
			case("pourcentage"):
				formatAxisY = d3.axisLeft(y).ticks().tickFormat(d3.format(".0%"));
				break;
			default:
				formatAxisY = d3.axisLeft(y).ticks().tickFormat(format);
		};
		
		x.domain(domainX_Array);
		y.domain([0, domainY_Max]).nice();

		// set z scale
		let z = axeZ;
		z.domain(domainZ_Array);
		
		// Affichage des axes
		g.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

		g.append("g")
			.attr("class", "axis")
			.call(formatAxisY)
			.append("text")
				.attr("x", 2)
				.attr("y", y(y.ticks().pop()) + 0.5)
				.attr("dy", "0.32em")
				.attr("fill", "#000")
				.attr("text-anchor", "start");

		let objectXYZG = new Object();
		objectXYZG.id = idSVG;
		objectXYZG.x = x;
		objectXYZG.y = y;
		objectXYZG.z = z;
		objectXYZG.g = g;
		objectXYZG.svg = svg;
		objectXYZG.margin = margin;
		objectXYZG.height= height;
		objectXYZG.width= width;
		return objectXYZG;

	};
	
	/* FONCTION AFFICHAGE DES LIGNES : ATTRIBUTS
		objectSVG
		dimensionLine : dimension pour la ligne
		dimensionLineArrayKey : array des cles de la dimension, pour produire chaque ligne
		arrayNombre : array des valeurs
		valeur : pourcentage sinon en nombre par defaut; appel des fonctions line et autres
	*/
	let afficheLines = function(objectSVG, dimensionLine, dimensionLineArrayKey, arrayNombre, valeur) {
		let id, x, y, z, g, svg, margin, height, width;
		id = objectSVG.id;
		x = objectSVG.x;
		y = objectSVG.y;
		z = objectSVG.z;
		g = objectSVG.g;
		svg = objectSVG.svg;
		margin = objectSVG.margin;
		height = objectSVG.height;
		width = objectSVG.width;
		let type = g.append("g").attr("class", "type");
		let lineY, transformY, circleY;
		// L'axe des abcisses étant un scaleBand il faut décaler les points de la ligne : il ne faut pas passer directement par la fonctionx
		let xBandwidth = (d  => (.5 * x.bandwidth()) + x(d) );
		switch(valeur) {
			case("pourcentage"):
				lineY = d3.line()
					.x(d => xBandwidth(d.key))
					//.y((d, j) => y(d.value/datasetArrayNombreByANNEE_MOIS_nonFiltre[j].value));
					.y(function(d, j) {
						if (datasetArrayNombreByANNEE_MOIS_nonFiltre[j].value != 0) {
							return y(d.value/datasetArrayNombreByANNEE_MOIS_nonFiltre[j].value);
						}
						else return y(1);
					});
						
				transformY = function(d,j){
					if (datasetArrayNombreByANNEE_MOIS_nonFiltre[datasetArrayNombreByANNEE_MOIS_nonFiltre.length - 1].value != 0) {
						return "translate(" + xBandwidth(d.key) + "," + y(d.value/datasetArrayNombreByANNEE_MOIS_nonFiltre[datasetArrayNombreByANNEE_MOIS_nonFiltre.length - 1].value) + ")"
					}
					else {return "translate(" + xBandwidth(d.key) + "," + y(1) + ")"}
				}
				circleY = function(d,j){
					//return y(d.value/datasetArrayNombreByANNEE_MOIS_nonFiltre[j].value)
					if (datasetArrayNombreByANNEE_MOIS_nonFiltre[j].value != 0) {
							return y(d.value/datasetArrayNombreByANNEE_MOIS_nonFiltre[j].value);
						}
						else return y(1);
				}
				break;
			default:
				lineY = d3.line()
						.x(d => xBandwidth(d.key))
						.y(d => y(d.value));
				transformY = function(d){
					return "translate(" + xBandwidth(d.key) + "," + y(d.value) + ")"
				}
				circleY = function(d){
					return y(d.value)
				}
		};
		let datasetArrayNombreByANNEE_MOIS_nonFiltre;
		for (let i = 0; i < dimensionLineArrayKey.length; ++i) {
			if(i === 0) datasetArrayNombreByANNEE_MOIS_nonFiltre = datasetByANNEE_MOIS.group().dispose().reduceSum(d => d.nbre).all().filter(d => d.key.substring(0,4) === valFiltres[0] || valFiltres[0] === "*");
			let dimensionItemLineKey = dimensionLineArrayKey[i];
			dimensionLine.filter(dimensionItemLineKey);
			type.append("path")
				.datum(arrayNombre)
				.attr("class", "line " + dimensionItemLineKey)
				.attr("d", lineY)
				.style("stroke", z(dimensionItemLineKey));

			type.append("text")
				.datum(arrayNombre[arrayNombre.length - 1])
				.attr("class", dimensionItemLineKey)
				.attr("transform", transformY)
				.attr("x", 10)
				.attr("dy", "0.35em")
				.attr("text-anchor", "start")
				.style("fill", z(dimensionItemLineKey))
				//.text(dimensionItemLineKey   );
				.text((dimensionItemLineKey === '-')? 'Non classifiée' : dimensionItemLineKey);

			type.selectAll("circle")
				.filter('.'+ dimensionItemLineKey)
				.data(arrayNombre)
				.enter()
					.append("circle")
					.attr("class", dimensionItemLineKey)
					.attr("cx", d => xBandwidth(d.key))
					.attr("cy", circleY)
					.attr("r", arrayItemBigCircle.indexOf(dimensionItemLineKey) >= 0 ? 6:3)
					.style("fill", z(dimensionItemLineKey));

		}
		dimensionLine.filterAll();

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
		focus.append("rect")
			.attr("transform", "translate(" + 10 + "," + (-10) + ")")
			.attr("width", 50)
			.attr("height", 20)
			.attr("fill", "white")
			.style("opacity", 0.5);
		focus.append("text")
			.attr("x", 15)
			.attr("dy", ".31em");					
		svg.append("rect")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.attr("class", "overlay")
			.attr("width", width)
			.attr("height", height)
			.on("mouseover", d => focus.style("display", "none"))
			.on("mouseout", d => focus.style("display", "none"))
			.on("mousemove", focusMousemove);

		function focusMousemove() {
			// recherche abcisse en fonction de la position de la souris
			let bandMouse = Math.trunc(d3.mouse(this)[0]/x.bandwidth());
			if (bandMouse >= x.domain().length) bandMouse = x.domain().length - 1;
			let periodeMouse = x.domain()[bandMouse];
			// recherche ordonnée en fonction de la position de la souris
			let volumeMouse = y.invert(d3.mouse(this)[1]);
			let yArray = new Array();
			let datasetArrayNombreByANNEE_MOIS_nonFiltre;
			for(let i=0; i < dimensionLineArrayKey.length; i++){				
				if(i === 0) datasetArrayNombreByANNEE_MOIS_nonFiltre = datasetByANNEE_MOIS.group().dispose().reduceSum(d => d.nbre).all().filter(d => d.key.substring(0,4) === valFiltres[0] || valFiltres[0] === "*");
				let dimensionLineItemKey = dimensionLineArrayKey[i];
				dimensionLine.filter(dimensionLineItemKey);
				switch(valeur) {
					case("pourcentage"):
						if(datasetArrayNombreByANNEE_MOIS_nonFiltre[bandMouse].value != 0){
							yArray.push(arrayNombre[bandMouse].value/datasetArrayNombreByANNEE_MOIS_nonFiltre[bandMouse].value);
						}
						else {yArray.push(1);}
						break;
					default:
						yArray.push(arrayNombre[bandMouse].value);
				};
			}
			dimensionLine.filterAll();
			yArray.sort((a, b) => a - b);
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
			let formatFocus;
			switch(valeur) {
				case("pourcentage"):
					formatFocus = d3.format(".0%");
					break;
				default:
					formatFocus = format;
			};
			focus.select("text").text( d => formatFocus(volumeMouse));
			focus.style("display", "inline");
		}

		// ANNOTATIONS
		let annotations = new Array();
		switch(id) {
			case("SVG01"):
				annotations = [{
					type: d3.annotationCalloutCircle,
					note: {
						label: "1er janvier 2017",
						title: "Obligation pour les GE",
						wrap: 150,
						align: "middle"
						},
					myFilter: {
						ind0: ["*","2017"],
						ind1: ["*"],
						ind2: ["*"],
						ind3: ["*"]
						},
					//x: (xBandwidth("2017-01")), y: y(.30),
					x: (xBandwidth("2017-01")), y: y(.34),
					dy: 40, dx: 70,
					subject: { radius: 20 }
					},
					{
					note: {
						label: "Alerte !",
						title: "Chute non justifiée",
						wrap: 150,
						align: "middle"
						},
					myFilter: {
						ind0: ["*","2017"],
						ind1: ["*"],
						ind2: ["*"],
						ind3: ["*"]
						},
					connector: {
						end: "arrow" // 'dot' also available
						},
					//x: (xBandwidth("2017-12")), y: y(.45),
					x: (xBandwidth("2017-12")), y: y(.51),
					dy: 20, dx: -100
					},
					{
					type: d3.annotationCalloutCircle,
					note: {
						label: "1er janvier 2018",
						title: "Obligation pour les ETI",
						wrap: 150,
						align: "middle"
						},
					myFilter: {
						ind0: ["*","2018"],
						ind1: ["*"],
						ind2: ["*"],
						ind3: ["*"]
						},
					//x: (xBandwidth("2018-01")), y: y(.5),
					x: (xBandwidth("2018-01")), y: y(.57),
					dy: 20, dx: 100,
					subject: { radius: 20 }
					}]
					.map(function(d){ d.color = "#e22127"; return d});
				break;
			case("SVG02"):
				annotations = [{
					type: d3.annotationCalloutCircle,
					note: {
						label: "1er janvier 2017",
						title: "Obligation pour les GE",
						wrap: 150,
						align: "middle"
						},
					myFilter: {
						ind0: ["*","2017"],
						ind1: ["*"],
						ind2: ["*"],
						ind3: ["*"]
						},
					//x: (xBandwidth("2017-01")), y: y(19055),
					x: (xBandwidth("2017-01")), y: y(21393),
					dy: 70, dx: 70,
					subject: { radius: 20 }
					},
					{
					note: {
						label: "Alerte !",
						title: "Chute non justifiée",
						wrap: 150,
						align: "middle"
						},
					myFilter: {
						ind0: ["*","2017"],
						ind1: ["*"],
						ind2: ["*"],
						ind3: ["*"]
						},
					connector: {
						end: "arrow" // 'dot' also available
						},
					//x: (xBandwidth("2017-12")), y: y(19247),
					x: (xBandwidth("2017-12")), y: y(21739),
					dy: 50, dx: -100
					},
					{
					type: d3.annotationCalloutCircle,
					note: {
						label: "1er janvier 2018",
						title: "Obligation pour les ETI",
						wrap: 150,
						align: "middle"
						},
					myFilter: {
						ind0: ["*","2018"],
						ind1: ["*"],
						ind2: ["*"],
						ind3: ["*"]
						},
					//x: (xBandwidth("2018-01")), y: y(31993),
					x: (xBandwidth("2018-01")), y: y(36330),
					dy: -10, dx: 100,
					subject: { radius: 20 }
					}]
					.map(function(d){ d.color = "#e22127"; return d});
				break;
			default:
				annotations = [{

					}];				
		};
		if (annotations[0].myFilter) annotations = annotations.filter(d => d.myFilter.ind0.indexOf(valFiltres[0]) >= 0 
																			&& d.myFilter.ind1.indexOf(valFiltres[1]) >= 0
																			&& d.myFilter.ind2.indexOf(valFiltres[2]) >= 0
																			&& d.myFilter.ind3.indexOf(valFiltres[3]) >= 0
																			);
		const makeAnnotations = d3.annotation()
			.type(d3.annotationLabel)
			.annotations(annotations);
		g.append("g")
			.attr("class", "annotation-group")
			.attr("id", id + "Annotation")
			.call(makeAnnotations);
	}

	let afficheBarStack = function(objectSVG, data, keys) {
		let id, x, y, z, g, svg, margin, height, width;
		id = objectSVG.id;
		x = objectSVG.x;
		y = objectSVG.y;
		z = objectSVG.z;
		g = objectSVG.g;
		svg = objectSVG.svg;
		margin = objectSVG.margin;
		height = objectSVG.height;
		width = objectSVG.width;
		let tooltip = svg.append("g")
			.attr("class", "focus")
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
		// L'axe des abcisses étant un scaleBand il faut décaler les points de la ligne : il ne faut pas passer directement par la fonctionx
		let xBandwidth = (d  => (.5 * x.bandwidth()) + x(d) );
		g.append("g")
			.selectAll("g")
			.data(d3.stack().keys(keys)(data))
			.enter().append("g")
				.attr("fill", d => z(d.key))
			.selectAll("rect")
			.data(d => d)
			.enter().append("rect")
				.attr("x", d => x(d.data.key))
				.attr("y", d => y(d[1]))
				.attr("height", d => y(d[0]) - y(d[1]))
				.attr("width", x.bandwidth())
			.on("mouseover", d => tooltip.style("display", null))
			.on("mouseout", d => tooltip.style("display", "none"))
			.on("mousemove", function(d) {
				// recherche abcisse en fonction de la position de la souris
				var xPosition = d3.mouse(this)[0] - 5;
				var yPosition = d3.mouse(this)[1] - 5;
				tooltip.style("display", "inline")
				tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
				tooltip.select("text").text(format(d[1]-d[0]));
			});
		
		var legend = g.append("g")
			.attr("font-family", "sans-serif")
			.attr("font-size", 10)
			.attr("text-anchor", "end")
			.selectAll("g")
			.data(keys.slice().reverse())
			.enter().append("g")
			.attr("transform", function(d, i) { return "translate(100," + i * 20 + ")"; });

		legend.append("rect")
			.attr("x", width - 19)
			.attr("width", 19)
			.attr("height", 19)
			.attr("fill", z);

		legend.append("text")
			.attr("x", width - 24)
			.attr("y", 9.5)
			.attr("dy", "0.32em")
			.text(d => d);
	}

	let afficheSVGs = function(){
		let objectSVG = new Object();
		const texteSVG01 = 'Variation du taux mensuel de dematérialisation des factures';
		const texteSVG02 = 'Variation du volume mensuel de factures';
		const texteSVG03 = "Ventilation par type d'entreprises du volume mensuel de factures";
		const texteSVG04 = 'Ventilation par chaine du volume mensuel de factures';
		const texteSVG05 = 'Ventilation par SE du volume mensuel de factures';
		let dimensionLine, dimensionLineArrayKey, arrayNombre, axeYmax, axeXArrayKey;
		
		// Suppression des anciens graphiques
		d3.select("#SVG01").selectAll("g").transition().duration(400).ease(d3.easeCircleIn).remove();
		d3.select("#SVG02").selectAll("g").transition().duration(400).ease(d3.easeCircleIn).remove();
		d3.select("#SVG03").selectAll("g").transition().duration(400).ease(d3.easeCircleIn).remove();
		d3.select("#SVG04").selectAll("g").transition().duration(400).ease(d3.easeCircleIn).remove();
		d3.select("#SVG05").selectAll("g").transition().duration(400).ease(d3.easeCircleIn).remove();

		datasetArrayNombreByANNEE_MOIS.filter(d => d.key.substring(0,4) === valFiltres[0] || valFiltres[0] === "*");
		
		dimensionLine = datasetByINDIC_DEMAT;
		dimensionLineArrayKey = datasetArrayKeyINDIC_DEMAT.filter(d => d === valFiltres[2] || valFiltres[2] === "*");
		arrayNombre = datasetNombreByANNEE_MOIS.all().filter(d => d.key.substring(0,4) === valFiltres[0] || valFiltres[0] === "*");
		axeYmax = datasetTopByANNEE_MOISandINDIC_DEMATmax;
		axeXArrayKey = datasetArrayKeyANNEE_MOIS.filter(d => d.substring(0,4) === valFiltres[0] || valFiltres[0] === "*");
		
		if ( ['*'].indexOf(valFiltres[2]) >= 0){
			// Affichage des indicateurs
			d3.select('#indicateurs').style("display", "inline");
			afficheIndicateurs(key2b, key1b);
			afficheIndicateurs(key2b, key1a);
			// CHART DU SVG01
			d3.select('#chart01').style("display", "inline");
			objectSVG = createSVG('SVG01', texteSVG01, axeXArrayKey, 1, dimensionLineArrayKey, zColors, pourcentage);
			d3.select('#generateSVG01').on('click', function(){	envoiSVG(objectSVG.id, objectSVG.width, objectSVG.height) });
			afficheLines(objectSVG, dimensionLine, dimensionLineArrayKey, arrayNombre, pourcentage);
		} else {
			d3.select('#indicateurs').style("display", "none");
			d3.select('#chart01').style("display", "none");
		}
		// CHART DU SVG02
		objectSVG = createSVG('SVG02', texteSVG02, axeXArrayKey, axeYmax, dimensionLineArrayKey, zColors);
		d3.select('#generateSVG02').on('click', function(){	envoiSVG(objectSVG.id, objectSVG.width, objectSVG.height) });
		afficheLines(objectSVG, dimensionLine, dimensionLineArrayKey, arrayNombre);
		// CHART DU SVG03
		dimensionLine = datasetByCATEGORIE_ENTREPRISE;
		dimensionLineArrayKey = datasetArrayKeyCATEGORIE_ENTREPRISE.filter(d => d === valFiltres[3] || valFiltres[3] === "*");
		axeYmax = datasetTopByANNEE_MOISandCATEGORIE_ENTREPRISEmax;
		objectSVG = createSVG('SVG03', texteSVG03, axeXArrayKey, axeYmax, dimensionLineArrayKey, zColors);
		afficheLines(objectSVG, dimensionLine, dimensionLineArrayKey, arrayNombre);
		// CHART DU SVG04
		dimensionLine = datasetByCHAINE_FINANCIERE;
		dimensionLineArrayKey = datasetArrayKeyCHAINE_FINANCIERE.filter(d => d === valFiltres[1] || valFiltres[1] === "*");
		axeYmax = datasetTopByANNEE_MOISandCHAINE_FINANCIEREmax;
		objectSVG = createSVG('SVG04', texteSVG04, axeXArrayKey, axeYmax, dimensionLineArrayKey, zColors);
		afficheLines(objectSVG, dimensionLine, dimensionLineArrayKey, arrayNombre);
		// CHART DU SVG05
		if (arrayChainePourDetailSE.indexOf(valFiltres[1]) >= 0){
			d3.select("#chart05").style("display", "inline");
			let dataStack = datasetStackANNEE_MOISandSEArray;
			axeYmax = dataStackTotalMax;
			objectSVG = createSVG('SVG05', texteSVG05, axeXArrayKey, axeYmax, datasetStackSE, zColors);
			afficheBarStack(objectSVG, dataStack, datasetStackSE);
		}
		else {
			d3.select("#chart05").style("display", "none");
			if (datasetBySE) datasetBySE.remove();
			if (datasetByANNEE_MOISandSE) datasetByANNEE_MOISandSE.remove();
		}
	}
	
	afficheSVGs();

	// tentative pour reduire les bugs lorsque l'on joue trop avec lec filtres
	let removeDimensions = function(){
		datasetByANNEE_MOISandINDIC_DEMAT.remove();
		datasetByANNEE_MOISandCHAINE_FINANCIERE.remove();
		datasetByANNEE_MOISandCATEGORIE_ENTREPRISE.remove();
		if(datasetBySE) datasetBySE.remove();
		if(datasetByANNEE_MOISandSE) datasetByANNEE_MOISandSE.remove();
	}

	// RE AFFICHAGE DES GRAPHIQUES DES QU'UN FILTRE EST MODIFIE
	let dimensionFilter = function(dim, val) {
		dim.filterFunction(function(d){
			let dataArray = d.split('|');
			dataArray[0] = dataArray[0].substring(0,4);
			let retour = false;
			let compteur = 0;
			for (let i = 0; i < dataArray.length; i++)
				if(dataArray[i] === val[i] || val[i] === "*") compteur++;
			if (compteur === 4) retour = true;
			return retour;
			});
	};
	
	d3.select("#choixAnnee").on("change", function() { 
		valFiltres[0] = d3.select(this).property("value");
		removeDimensions();
		dimensionFilter(datasetByAll, valFiltres);
		calculDataDimensions();
		afficheSVGs();
		preparationDatatables();
	});
	d3.select("#choixChaine").on("change", function() {
		valFiltres[1] = d3.select(this).property("value");
		removeDimensions();
		dimensionFilter(datasetByAll, valFiltres);
		calculDataDimensions();
		afficheSVGs();
		preparationDatatables();
	});
	d3.select("#choixDemat").on("change", function() {
		valFiltres[2] = d3.select(this).property("value");
		removeDimensions();
		dimensionFilter(datasetByAll, valFiltres);
		calculDataDimensions();
		afficheSVGs();
		preparationDatatables();
	});
	d3.select("#choixTypeTiers").on("change", function() {
		valFiltres[3] = d3.select(this).property("value");
		removeDimensions();
		dimensionFilter(datasetByAll, valFiltres);
		calculDataDimensions();
		afficheSVGs();
		preparationDatatables();
	});	
	d3.select("#resetFiltres").on("click", function() {
		valFiltres = ['*', '*', '*', '*'];
		valFiltresPrecedents = ['*', '*', '*', '*'];
		removeDimensions();
		datasetByAll.filterAll();
		calculDataDimensions();
		d3.select("#choixAnnee").selectAll("option").property('selected', false);
		d3.select("#choixChaine").selectAll("option").property('selected', false);
		d3.select("#choixDemat").selectAll("option").property('selected', false);
		d3.select("#choixTypeTiers").selectAll("option").property('selected', false);
		d3.select("#optionAnnee").property('selected', true);
		d3.select("#optionChaine").property('selected', true);
		d3.select("#optionDemat").property('selected', true);
		d3.select("#optionTypeTiers").property('selected', true);
		afficheSVGs();
		preparationDatatables();
	});
});

let databaseFilter = function(data, val) {
		let dataFiltered = data.filter(function(d){
			let retour = false;
			let compteur = 0;
			if(d.ANNEE_MOIS.substring(0,4) === val[0] || val[0] === "*") compteur++;
			if(d.CHAINE_FINANCIERE === val[1] || val[1] === "*") compteur++;
			if(d['INDIC DEMAT'] === val[2] || val[2] === "*") compteur++;
			if(d.CATEGORIE_ENTREPRISE === val[3] || val[3] === "*") compteur++;
			if (compteur === 4) retour = true;
			return retour;
			});
		return dataFiltered;
	};
let table;
let afficheDataTables = function(){
	if(d3.select('#checkDatatables').property('checked')){
		myDatabase = databaseFilter(myDatabaseOrigine, valFiltres);
		$(document).ready(function() {
			if (table) table.destroy();
			table = $('#datatables').DataTable( {
				language: { url: urlFrench	},
				data: myDatabase,
				columns: [
					{ data: "ANNEE_MOIS", title:"Période"},
					{ data: "SIREN", title:"SIREN" },
					{ data: "NOM_FOURNISSEUR", title:"Fournisseur" },
					{ data: "CATEGORIE_ENTREPRISE", title:"Type" },
					{ data: "CHAINE_FINANCIERE", title:"Chaîne" },           
					{ data: "INDIC DEMAT", title:"Démat." },
					{ data: "nbre", title:"Nb Factures" }
				],
				dom: 'Bfrtip',
				buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
				scrollY:        '50vh',
				scrollCollapse: true,
				paging:         false
			} );
		} );
	}		
}

function preparationDatatables() {
	filtersOkForDatatables = calculFiltersOkForDatatables(valFiltres);
	if (d3.select('#checkDatatables').property('checked') && filtersOkForDatatables) {
		if(valFiltres != valFiltresPrecedents) {
			if (valFiltres[3] != valFiltresPrecedents[3]){
				switch(valFiltres[3]){
					case("GE"):
					case("PUBLIC"):
						myFileDatabase = myFileDatabase1;
						break;
					case("ETI"):
						myFileDatabase = myFileDatabase2;
						break;
					case("PME"):
						myFileDatabase = myFileDatabase3;
						break;
				}
				d3.json(myFileDatabase).then(function(data){
					myDatabaseOrigine = data;
					afficheDataTables();
				});
			} else afficheDataTables();
			valFiltresPrecedents = [d3.select(choixAnnee).property("value"),
									d3.select(choixChaine).property("value"),
									d3.select(choixDemat).property("value"),
									d3.select(choixTypeTiers).property("value")]
		}			
		d3.select('#zoneDatatables').style("display", "inline");
	}
	else {d3.select('#zoneDatatables').style("display", "none");}
}
d3.select('#checkDatatables').on('click', function(){preparationDatatables()});