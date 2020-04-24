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

for (var handle of dragHandles) {
    handle.onmousedown = makeParentDraggable
    handle.onmouseup = makeParentNotDraggable
}

for (var section of sections) {
    section.ondragstart = dragStart;
    section.ondragend = dragEnd;
}

function makeParentDraggable() {
    this.closest('section').setAttribute('draggable', 'true');
}

function makeParentNotDraggable() {
    this.closest('section').setAttribute('draggable', 'false');
}

function dragStart() {
    this.classList.add('dragging');
};
function dragEnd() {
    this.classList.remove('dragging');
};

formEditor.ondragover = dragOver;

function dragOver(e) {
    const draggable = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(this, e.clientY);
    if (afterElement === null) {
        this.appendChild(draggable);
    } else {
        this.insertBefore(draggable, afterElement);
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('section:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return {offset: offset, element: child};
        } else {
            return closest;
        };
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}