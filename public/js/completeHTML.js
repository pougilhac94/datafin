'use strict';

const TITREGENERAL = "DATAVISUALISATION : LE SUIVI BUDGETAIRE";

const TITTRES_TABLES_HEAD_ARRAY = ['Niveau', 'Libellé', 'Ressource', 'Consommation', 'Conso. prévisionnelle'];
const TITTRES_TABLES_FOOT_ARRAY = ['Total :', '', '', ''];

const FORM_UPLOAD_TEXT_ACTION = 'Veuillez choisir le fichier tsv à afficher';
const FORM_UPLOAD_FORMAT_FICHIER = '.tsv';

d3.select('#titregeneral')
    .select('h1')
    .text(TITREGENERAL);

d3.select('#formupload')
    .append('form')
    .attr('method','post')
    .attr('enctype','multipart/form-data')
    .append('div').attr('class','form-group')
    .append('label').attr('class','font-weight-bold p-1')
    .attr('for','fileselect')
    .text(FORM_UPLOAD_TEXT_ACTION);
d3.select('#formupload')
    .select('form')
    .select('div')
    .append('input').attr('class','form-control-file')
    .attr('type','file')
    .property('id','fileselect')
    .attr('name','fileselect')
    .attr('accept',FORM_UPLOAD_FORMAT_FICHIER);
d3.select('#formupload')
    .select('form')
    .append('div')
    .attr('class','previewfile')
    .append('p');

d3.select('#enteteload')
	.append('form')
	.append('div').attr('class', 'form-row align-items-center')
	.append('div').attr('class', 'col-auto')
	.append('label').attr('class', 'col-form-label col-form-label-sm sr-only')
	.attr('for','inlineFormInput')
	.text('name');
d3.select('#enteteload')
	.select('form')
	.select('div')
	.select('div')
	.append('input').attr('class','form-control form-control-sm mb2')
	.property('id','inlineFormInput')
	.attr('placeholder','Mission Défense');

// suppression du formulaire upload lors du scrolling
let dernierePositionScroll = 0;
let ticking = false;
function supprimerUpload(position) {
    let  displayUpload = "none"
    if(position == 0) displayUpload = "inline";
    d3.select('#formupload').style("display", displayUpload); 
}
window.addEventListener('scroll', function(e) { 
    dernierePositionScroll = scrollY;
    if(!ticking) {
        window.requestAnimationFrame(function() {
            supprimerUpload(dernierePositionScroll); 
            ticking = false;
        });
    };
    ticking = true;
});

d3.select('#titredatavisualisation')
    .append('h2').attr('class','row col-12').property('id','titreDatavis1');
d3.select('#titredatavisualisation')
    .append('h3').attr('class','row col-12').property('id','titreDatavis2');
d3.select('#titredatavisualisation')
    .append('h5').attr('class','row col-12').property('id','titreDatavis3');

    d3.select('#sequence').attr('class','row')

const TOGGLE_LEGEND_TEXT = 'Légende';
const TOGGLE_CONSO_TEXT = 'Affichage de la consommation';
const TOGGLE_DONNEES_TEXT = 'Affichage des données';

d3.select('#sidebar')
    .append('div').attr('class','form-check').property('id','form-check-legend')
    .append('input').attr('class','form-check-input')
    .attr('type','checkbox')
    .property('id','togglelegend')
    .attr('name','affichage')
    .attr('value','legende')
	.property('checked',true);
d3.select('#form-check-legend')
    .append('label').attr('class','form-check-label')
    .attr('for','togglelegend')
    .text(TOGGLE_LEGEND_TEXT);
d3.select('#sidebar')
    .append('div')
    .property('id','legend');
d3.select('#sidebar')
    .append('br');

d3.select('#sidebar')
    .append('div').attr('class','form-check').property('id','form-check-conso')
    .append('input').attr('class','form-check-input')
    .attr('type','checkbox')
    .property('id','togglearcconso')
    .attr('name','affichageArcConso')
    .attr('value','afficheArcConso');
d3.select('#form-check-conso')
    .append('label').attr('class','form-check-label')
    .attr('for','togglearcconso')
    .text(TOGGLE_CONSO_TEXT);
d3.select('#sidebar')
    .append('div')
    .property('id','consommation');
d3.select('#sidebar')
    .append('br');

d3.select('#sidebar')
    .append('div').attr('class','form-check').property('id','form-check-donnees')
    .append('input').attr('class','form-check-input')
    .attr('type','checkbox')
    .property('id','toggledonnees')
    .attr('name','affichageDonnees')
    .attr('value','afficheDonnees');
d3.select('#form-check-donnees')
    .append('label').attr('class','form-check-label')
    .attr('for','toggledonnees')
    .text(TOGGLE_DONNEES_TEXT);

let titresTablesEcart = TITTRES_TABLES_HEAD_ARRAY.length - TITTRES_TABLES_FOOT_ARRAY.length ;

d3.select('#affichageFichierDonnees')
    .append('table')
    .attr('class','display col-12')
    .property('id','fichierDonnees')
    .property('width', '100%')
    .append('thead')
    .append('tr')
    .selectAll('th')
    .data(TITTRES_TABLES_HEAD_ARRAY, function(d) { return d; })
    .enter()
    .append('th')
    .text(function(d) { return d; });
d3.select('#fichierDonnees')
    .append('tfoot')
    .append('tr')
    .selectAll('th')
    .data(TITTRES_TABLES_FOOT_ARRAY, function(d, i) { return d; })
    .enter()
    .append('th')
    .attr('colspan',function(d, i) {
        if (d.length > 0) 
            { return titresTablesEcart+i+1; }
            else { return 1; }
        })
    .style('text-align', function(d, i) {
        if (d.length > 0) 
            { return 'right'; } 
            else {return 'left'; }
        })
    .text(function(d) { return d; });

const LOREM_IPSUM1	='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.'
const LOREM_IPSUM2 = 'Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue.';
const LOREM_IPSUM3 = 'Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit. Ut velit mauris, egestas sed, gravida nec, ornare ut, mi. Aenean ut orci vel massa suscipit pulvinar. Nulla sollicitudin.';
const LOREM_IPSUM4	=' Fusce varius, ligula non tempus aliquam, nunc turpis ullamcorper nibh, in tempus sapien eros vitae ligula. Pellentesque rhoncus nunc et augue. Integer id felis. Curabitur aliquet pellentesque diam. Integer quis metus vitae elit lobortis egestas. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi vel erat non mauris convallis vehicula. Nulla et sapien. Integer tortor tellus, aliquam faucibus, convallis id, congue eu, quam. Mauris ullamcorper felis vitae erat. Proin feugiat, augue non elementum posuere, metus purus iaculis lectus, et tristique ligula justo vitae magna.';
const LOREM_IPSUM5 = 'Aliquam convallis sollicitudin purus. Praesent aliquam, enim at fermentum mollis, ligula massa adipiscing nisl, ac euismod nibh nisl eu lectus. Fusce vulputate sem at sapien. Vivamus leo. Aliquam euismod libero eu enim. Nulla nec felis sed leo placerat imperdiet. Aenean suscipit nulla in justo. Suspendisse cursus rutrum augue. Nulla tincidunt tincidunt mi. Curabitur iaculis, lorem vel rhoncus faucibus, felis magna fermentum augue, et ultricies lacus lorem varius purus.';
const LOREM_IPSUM6 = 'Curabitur eu amet.';
const P_DEBUT = '<p>';
const P_FIN = '</p>';
const SAUT_LIGNE = '<br>';
let loremIpsum = P_DEBUT;
loremIpsum += LOREM_IPSUM1;
loremIpsum += SAUT_LIGNE;
loremIpsum += LOREM_IPSUM2;
loremIpsum += SAUT_LIGNE;
loremIpsum += LOREM_IPSUM3;
loremIpsum += SAUT_LIGNE;
loremIpsum += LOREM_IPSUM4;
loremIpsum += SAUT_LIGNE;
loremIpsum += LOREM_IPSUM5;
loremIpsum += SAUT_LIGNE;
loremIpsum += LOREM_IPSUM6;
loremIpsum += P_FIN;
d3.select('#col-gauche').html(loremIpsum);
d3.select('#col-droite').html(loremIpsum);