var formEditor = document.querySelector('#fullForm');

// var sections = document.querySelectorAll('.formSection');
var questions = document.querySelectorAll('.formQuestion');
var collapseLinks = document.querySelectorAll('.collapseSection');
var addQuestionLinks = document.querySelectorAll('.addQuestionLink');
var addSectionLinks = document.querySelectorAll('.addSection');

formEditor.addEventListener('click', function (e) {
    var sectionTitles = Array.from(document.querySelectorAll('.sectionTitle'));
    for (let i = 0; i < sectionTitles.length; i++) {
        var panel = sectionTitles[i].parentElement.parentElement.nextElementSibling;
        panel.classList.remove('active');
    }

    if (e.target !== e.currentTarget) {
        var tgt = e.target.parentElement.parentElement.nextElementSibling;
        tgt.classList.add("active");
      }
});



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