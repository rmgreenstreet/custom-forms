// const Sortable = require("sortablejs");

var sections = document.querySelectorAll('.formSection');
var questions = document.querySelectorAll('.formQuestion');
var addQuestionLinks = document.querySelectorAll('.addQuestionLink');
var addSectionLinks = document.querySelectorAll('.addSection');


var formEditor = new Sortable(document.querySelector('#fullForm'), {
    group: {name: 'sections', pull: false, put: false},
    handle:'.sectionDragHandle',
    animation:150,
    draggable: 'section'
});

var sortableSections = [];
for (var section of sections) {
    // var currentSection = new Sortable(section.querySelector('.card-text'), {
    //     group: {name: `section${sections.indexOf(section)}`, put:true},
    //     handle: '.questionDragHandle',
    //     draggable: '.formQuestion',
    //     swapThreshold: 0.65
    // });
    // sortableSections.push(currentSection);
    section.ondragstart = dragStart;
    section.ondragend = dragEnd;
    section.ondragover = dragEnd;
    section.querySelector('.card-text').ondragover = dragOver;
}

for (var question of questions) {
    question.ondragstart = function(e) {
        e.stopPropagation();
        e.currentTarget.querySelector('.collapse').classList.remove('show');
        this.classList.add('dragging');
    };
    question.ondragend = function(e) {
        e.currentTarget.querySelector('.collapse').classList.add('show');
        this.classList.remove('dragging');
    };
}

function dragStart(e) {
    e.currentTarget.querySelector('.collapse').classList.remove('show');
}
function dragEnd(e) {
    for (var section of sections) {
        section.querySelector('.collapse').classList.remove('show');
    }
    e.currentTarget.querySelector('.collapse').classList.add('show');
}

function dragOver(e) {
    e.preventDefault();
    const draggable = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(this, e.clientY);
    if (afterElement === null) {
        this.appendChild(draggable);
    } else {
        this.insertBefore(draggable, afterElement);
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
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

function dragEnter(e) {
    e.stopPropagation();
}


// changing inputs for form options based on input type selected
var inputTypeSelectors = document.querySelectorAll('.typeSelector');


function getInputTypeSelectors() {
    inputTypeSelectors = document.querySelectorAll('.typeSelector');
}

function addInputTypeSelector(newElement) {
    inputTypeSelectors.push(newElement);
}

function addInputTypeChangeListener(list) {
    for (var item of list) {
        item.addEventListener('change', function (e) {
            setAppropriateOptions(e.target);
        })
    }
}

function setAppropriateOptions(item) {
    var optionsSection = item.closest('.questionBody').querySelector('.typeOptions');
    if (e.target.value === 'Checkbox' || e.target.value === 'Radio' || e.target.value === 'Select') {
        optionsSection.innerHTML = `
            <div class="input-group mb-1 typeOptions">
                <div class="input-group-prepend">
                    <label for=""
                </div>
            </div>
        `;
    }
}