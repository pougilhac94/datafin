// FONCTION affichageDatatables appelée par le script UPLOAD.JS qui passe en paramètre le nomdu fichier
function affichageDatatables(monfichier, monentete) {
	'use strict';
	// Affichage 
	toggleOpacity("affichageFichierDonnees", 1);
	// codeHTMLtable à charger en récupérant élégamment le code html et non en l'écrivant dans la variable
	var codeHTMLtable = '<table id="fichierDonnees" class="display" width="100%"><thead><tr><th>Niveau</th><th>Libellé</th><th >Ressource</th><th>Consommation</th><th>Conso. prévisionnelle</th></tr></thead><tfoot><tr><th colspan="2" style="text-align:right">Total :</th><th></th><th></th><th></th></tr></tfoot></table>';
	// Il faut commencer par réinitialiser le tableau (cas d'un changement de fichier de données)
	d3.select("#affichageFichierDonnees").selectAll("*").remove();
	d3.select("#affichageFichierDonnees").html(codeHTMLtable);
	//document.getElementById("affichageFichierDonnees").html(codeHTMLtable);

	var formatNumber = function(val) {
		var valRound = Math.round(val,0);
		var valFormat =  d3.format(",d")(valRound);
		var valFinal = valFormat.toString().replace(/,/g,'.');
		return valFinal;
	}

	//--------------------------------------------------------------------------------------
	var fichierJSON = monfichier
	var root = {};
	var enteteTSV = monentete;
	var objectNiv1 = {};		

	//d3.tsv(enteteTSV, function(error, data) {
	d3.tsv(enteteTSV).then(function(data) {
		var objectHeader = {};
		var objectCSVint = {};
		data.forEach(function(d, i) {
			objectHeader[i] = d;
			});
		objectHeader[0].children = new Array();
		objectNiv1 = objectHeader[0];
	});

	//d3.tsv(fichierJSON, function(error, data) {
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
	
	if (!root.leaves()[0].data.name) {
		toggleOpacity("main", 0);
		toggleOpacity("titredatavisualisation", 0);
		toggleOpacity("sidebar", 0);
		toggleOpacity("affichageFichierDonnees", 0);
		throw "Fichier CSV incorrect pour Datatables !";
		} 
	
	var leaves = root.leaves();
	var tableau = [];
	for(var i=0; i<leaves.length; i++) {
		leaves[i].data.name = leaves[i].data.name.split(' ').pop();
		if(!leaves[i].data.conso)leaves[i].data.conso=0;
		if(!leaves[i].data.prev)leaves[i].data.prev=0;
		tableau.push(leaves[i].data);
	}
	
	$(document).ready(function() {		
		maDataTables = $('#fichierDonnees').DataTable( {	
			data: tableau,
			language: { url: urlFrench	},
			columns: [
				{ data: "name" },
				{ data: "libelle" },
				{ data: "size"},
				{ data: "conso" },
				{ data: "prev" }
			],
			columnDefs: [
				{ "render": $.fn.dataTable.render.number('.',',',0,''), "targets": [2,3,4]},
				{className: "dt-right", "targets": [2,3,4]}
			],
			order: [[ 0, "asc" ]],
			iDisplayLength: 25,
			
			dom: 'Bfrtip',
			buttons: [
				'copy', 'csv', 'excel', 'pdf', 'print'
			],
			
			footerCallback: function( row, data, start, end, display ) {
				var api = this.api(), data;
				var total2 = api
					.column(2, { search: "applied"} )
					.data()
					.reduce( function (a, b) {
						return a*1 + b*1;
					}, 0);
				var total3 = api
					.column(3, { search: "applied"} )
					.data()
					.reduce( function (a, b) {
						return a*1 + b*1;
					}, 0);
				var total4 = api
					.column(4, { search: "applied"} )
					.data()
					.reduce( function (a, b) {
						return a*1 + b*1;
					}, 0);
				var pageTotal2 = api
					.column(2, { page: "current"} )
					.data()
					.reduce( function (a, b) {
						return a*1 + b*1;
					}, 0);
				var pageTotal3 = api
					.column(3, { page: "current"} )
					.data()
					.reduce( function (a, b) {
						return a*1 + b*1;
					}, 0);
				var pageTotal4 = api
					.column(4, { page: "current"} )
					.data()
					.reduce( function (a, b) {
						return a*1 + b*1;
					}, 0);
				$( api.column(2).footer() ).html(formatNumber(total2));
				$( api.column(3).footer() ).html(formatNumber(total3));
				$( api.column(4).footer() ).html(formatNumber(total4));
			}
		} );
	} );

	})

}