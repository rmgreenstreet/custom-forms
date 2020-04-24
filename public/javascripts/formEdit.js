var formEditor = document.querySelector('#fullForm');

var sections = document.querySelectorAll('.formSection');
var questions = document.querySelectorAll('.formQuestion');
var collapseLinks = document.querySelectorAll('.collapseSection');
var addQuestionLinks = document.querySelectorAll('.addQuestionLink');
var addSectionLinks = document.querySelectorAll('.addSection');
var sectionBodies = document.querySelectorAll('.sectionBody');
var dragHandles = document.querySelectorAll('.dragHandle');

formEditor.ondragover = dragOver;

for (var handle of dragHandles) {
    handle.addEventListener('mousedown', function (e) {makeParentDraggable(e, '.draggable')});
    handle.addEventListener('mouseup', function (e) {makeParentNotDraggable(e, '.draggable')});
}

for (var section of sections) {
    section.ondragstart = dragStart;
    section.ondragend = dragEnd;
    section.ondrop = dragDrop;
}

for (var question of questions) {
    question.ondragstart = dragStart;
    question.ondragend = dragEnd;
}

for (var sectionBody of sectionBodies) {
    sectionBody.ondragover = dragOver;
}

function makeParentDraggable(e, selector) {
    e.target.closest(selector).setAttribute('draggable', 'true');
    e.target.closest(selector).querySelector('.collapse').classList.remove('show');
}

function makeParentNotDraggable(e, selector) {
    e.target.closest(selector).setAttribute('draggable', 'false');
    e.target.closest(selector).querySelector('.collapse').classList.add('show');
}

function dragStart() {
    this.classList.add('dragging');
};
function dragEnd(e) {
    e.preventDefault();
    this.classList.remove('dragging');
};

function dragOver(e) {
    e.preventDefault();
    const draggable = e.currentTarget.querySelector('.dragging');
    const afterElement = getDragAfterElement(this, e.clientY);
    if (afterElement === null) {
        this.appendChild(draggable);
    } else {
        this.insertBefore(draggable, afterElement);
    }
}

function dragDrop (e) {
    console.log(e.target);
    e.preventDefault();
    this.classList.remove('dragging');
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