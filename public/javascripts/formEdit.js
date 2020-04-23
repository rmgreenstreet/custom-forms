var formEditor = document.querySelector('#fullForm');

var sections = document.querySelectorAll('.formSection');
var questions = document.querySelectorAll('.formQuestion');
var collapseLinks = document.querySelectorAll('.collapseSection');
var addQuestionLinks = document.querySelectorAll('.addQuestionLink');
var addSectionLinks = document.querySelectorAll('.addSection');

// for (let section of sections) {
//     section.addEventListener('click', function (e) {
//         for (let section of sections) {
//             section.querySelector('.sectionBody').classList.remove('active');
//         }
//         e.currentTarget.querySelector('.sectionBody').classList.add('active');
//     });
// }


var dragHandles = document.querySelectorAll('.dragHandle');

// for (var handle of dragHandles) {
//     handle.addEventListener('mousedown', function (e) {
//         e.target.parentNode.parentNode.parentNode.setAttribute('draggable', 'true');
//     });
    
//     handle.addEventListener('mouseup', function (e) {
//         e.target.parentNode.setAttribute('draggable', 'false')
//     });
// }

// function dragStart(e) {
//     e.preventDefault();
//     e.dataTransfer.setData('text/plain', e.target);
// }


// $( function() {
//     $( "#fullForm" )
//       .accordion({
//         header: "> div > h3"
//       })
//       .sortable({
//         axis: "y",
//         handle: ".fa-arrows-alt",
//         stop: function( event, ui ) {
//           // IE doesn't register the blur when sorting
//           // so trigger focusout handlers to remove .ui-state-focus
//           ui.item.children( "h3" ).triggerHandler( "focusout" );
 
//           // Refresh accordion to handle new order
//           $( this ).accordion( "refresh" );
//         }
//       });
//   } );