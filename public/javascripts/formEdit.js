// const Sortable = require("sortablejs");

var fullForm = document.querySelector('#fullForm');
var sections = document.querySelectorAll('.formSection');
var questions = document.querySelectorAll('.formQuestion');
var addQuestionLinks = document.querySelectorAll('.addQuestionLink');
var addOptionLinks = document.querySelectorAll('.addOptionLink');
var addSectionLink = document.querySelector('.addSectionLink');
var questionDragHandles = document.querySelectorAll('.questionDragHandle');
var questionDeleteButtons = document.querySelectorAll('.questionDeleteButton');

for (var handle of questionDragHandles) {
    handle.onmousedown = function(e) {
        e.stopPropagation();
    }
}

var sortableFormOptions = {
    group: {name: 'sections', pull: false, put: false},
    handle:'.sectionDragHandle',
    animation:150,
    draggable: 'section'
};

var formEditor = new Sortable(fullForm, sortableFormOptions);

function addSectionDragListeners(item) {
    item.ondragstart = function(e) {
        collapseAllSections(e);
        this.classList.add('dragging');
    };

    item.ondragend = function (e) {
        this.querySelector('.collapse').classList.add('show');
    }

    item.ondragenter = function(e) {
        for (var section of sections) {
            section.querySelector('.collapse').classList.remove('show');
        }
        if(document.querySelector('.dragging').classList.contains('formQuestion')) {
            this.querySelector('.collapse').classList.add('show');
        }
    }
    item.ondrop = function(e) {
        this.querySelector('.collapse').classList.add('show');
    }
}

for (var section of sections) {

    var sortableSection = new Sortable(section.querySelector('.questionList'), {
        group: {
            name: `section${sections.indexOf(section)}`,
            pull: true,
            put: true,
        },
        draggable: '.draggable',
        handle: '.questionDragHandle',
        animation: 150
    })

    section.ondragstart = function(e) {
        collapseAllSections(e);
        this.classList.add('dragging');
    };

    section.ondragend = function (e) {
        this.querySelector('.collapse').classList.add('show');
    }

    section.ondragenter = function(e) {
        for (var section of sections) {
            section.querySelector('.collapse').classList.remove('show');
        }
        if(document.querySelector('.dragging').classList.contains('formQuestion')) {
            this.querySelector('.collapse').classList.add('show');
        }
    }
    section.ondrop = function(e) {
        this.querySelector('.collapse').classList.add('show');
    }
}

for (var question of questions) {
    question.ondragstart = function(e) {
        this.classList.add('dragging');
        this.querySelector('.collapse').classList.remove('show');
    }
    question.ondragend = function(e) {
        this.classList.remove('dragging');
        this.querySelector('.collapse').classList.add('show');
    }

    var typeSelector = question.querySelector('.typeSelector')
    if (typeSelector.value == 'File') {
        if (typeSelector[typeSelector.selectedIndex].text == 'File Upload') {
            question.querySelector('.typeOptions').innerHTML = `
                <p>Accepted Filetypes: .PDF, .DOC, .DOCX, .PPT, .PPTX, .XLS, .XLSX, .CSV </p>
            `
        } else if (typeSelector[typeSelector.selectedIndex].text == 'Image Upload') {
            question.querySelector('.typeOptions').innerHTML = `
                <p>Accepted Filetypes: .JPG, .JPEG, .PNG </p>
            `
        }
    }

}

function collapseAllSections(e) {
    if(!e.target.classList.contains('formQuestion')){
        for (var section of sections) {
            section.querySelector('.collapse').classList.remove('show');
        }
    }
}
function toggleCollapse(element) {
    if (element.classList.contains('show')) {
        element.classList.remove('show');
    } else {
        element.classList.add('show');
    }
}


// function dragOver(e) {
//     e.preventDefault();
//     const draggable = document.querySelector('.dragging');
//     const afterElement = getDragAfterElement(this, e.clientY);
//     if (afterElement === null) {
//         this.appendChild(draggable);
//     } else {
//         this.insertBefore(draggable, afterElement);
//     }
// }

// function getDragAfterElement(container, y) {
//     const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
//     return draggableElements.reduce((closest, child) => {
//         const box = child.getBoundingClientRect();
//         const offset = y - box.top - box.height / 2;
//         if (offset < 0 && offset > closest.offset) {
//             return {offset: offset, element: child};
//         } else {
//             return closest;
//         };
//     }, { offset: Number.NEGATIVE_INFINITY }).element;
// }




// changing inputs for form options based on input type selected
var inputTypeSelectors = document.querySelectorAll('.typeSelector');


function addInputTypeChangeListener(list) {
    for (var item of list) {
        item.addEventListener('change', function (e) {
            setAppropriateOptions(e, e.target);
        })
    }
}

addInputTypeChangeListener(inputTypeSelectors);

function setAppropriateOptions(e, item) {
    var optionsSection = item.closest('.questionBody').querySelector('.typeOptions');
    if (item.value === 'Checkbox' || item.value === 'Radio' || item.value === 'Select') {
        optionsSection.innerHTML = `
            <div class="input-group mb-2">
                <div class="input-group-prepend">
                    <label for="question${item.closest('.formQuestion').id}Value0" class="input-group-text">Option 1</label>
                </div>
                <input type="text" name="form[sections][questions][values]" id="question${item.closest('.formQuestion').id}Value0" class="form-control valueOption" >
            </div>
            <div class="row">
                <div class="col card-text"><a href="" class="addOptionLink"><i class="fas fa-plus"></i> Add Option</a></div>
            </div>
        `;
    } else if (item.value !== 'File') {
        optionsSection.innerHTML = `
            <div class="input-group mb-2">
                <div class="input-group-prepend">
                    <label for="question${item.closest('.formQuestion').id}Value0" class="input-group-text">Placeholder</label>
                </div>
                <input type="text" name="form[sections][questions][values]" id="question${item.closest('.formQuestion').id}Value0" class="form-control valueOption" >
            </div>
        `;
    } else {
        if (item.options[item.selectedIndex].text == 'Image Upload') {
            optionsSection.innerHTML = `
                <p>Accepted Filetypes: .JPG, .JPEG, .PNG </p>
            `;
        } else if (item.options[item.selectedIndex].text == 'File Upload') {
            optionsSection.innerHTML = `
                <p>Accepted Filetypes: .PDF, .DOC, .DOCX, .PPT, .PPTX, .XLS, .XLSX, .CSV </p>
            `;
        }
    }
}

var typeSelectorOptions = inputTypes.map(function(type) {
    return `
        <option value="${type.htmlInputType}">${type.displayName}</option>
    `
})

var newQuestions = [];
function addQuestionLinkListener(e, link) {
    e.preventDefault();
        var newQuestion = 
        {
            id: `newQuestion${newQuestions.length}`,
            options: typeSelectorOptions.join()
        }
        
        newQuestions.push(newQuestion);
        var blankQuestion = document.querySelector('#blankQuestion').content.cloneNode(true);

        blankQuestion.querySelector('.formQuestion').id = newQuestion.id;
        blankQuestion.querySelector('.newQuestionTitleLabel').for = `${newQuestion.id}Title`;
        blankQuestion.querySelector('.newQuestionTitleField').id = `${newQuestion.id}Title`;
        blankQuestion.querySelector('.newQuestionTypeLabel').for = `${newQuestion.id}Type`;
        blankQuestion.querySelector('.typeSelector').id = `${newQuestion.id}Type`;
        blankQuestion.querySelector('.typeSelector').innerHTML = typeSelectorOptions;
        blankQuestion.querySelector('.typeSelector').selectedIndex = - 1
        addInputTypeChangeListener([blankQuestion.querySelector('.typeSelector')]);
        addDeleteButtonListener([blankQuestion.querySelector('.questionDeleteButton')]);

        link.closest('.sectionBody')
        .querySelector('.questionList')
        .append(blankQuestion);
}

for (var link of addQuestionLinks) {
    link.addEventListener('click', function(e) {
        addQuestionLinkListener(e, this);
    })
}

/* Add new option to question types that allow it (checkbox, radio, select) */
for (var link of addOptionLinks) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        var parentQuestion = this.closest('.formQuestion');
        var existingOptions = parentQuestion.querySelectorAll('.valueOption');
        var optionId = `question${this.closest('.formQuestion').id}Value${existingOptions.length}`;
        var optionLabel = document.createTextNode(`Option ${existingOptions.length + 1}`)
        var newOption = document.querySelector('#blankOption').content.cloneNode(true);
        newOption.querySelector('.input-group-text').for = optionId;
        // newOption.querySelector('.input-group-text').appendChild(optionLabel);
        newOption.querySelector('.input-group-text').textContent = optionLabel;
        newOption.querySelector('.valueOption').id = optionId;
        
        this.closest('.typeOptions').insertBefore(newOption, this.closest('.row'));
    })
}

//Delete Question
function addDeleteButtonListener (list = []) {
    for (var item of list) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            this.closest('.formQuestion').remove(0);
        })
    }
}

addDeleteButtonListener(questionDeleteButtons);

//TODO: Change event listener for for section title to update title

var newSections = []
//Add New section
addSectionLink.onclick = function(e) {
    e.preventDefault();
    collapseAllSections(e);
    var newSection = {
        sectionNumber: `section${sections.length + 1}`
    }
    newSections.push(newSection);
    var blankSection = document.querySelector('#blankSection').content.cloneNode(true);
    blankSection.querySelector('section').id = newSection.sectionNumber;
    blankSection.querySelector('.row').id = `newSection${newSections.length}Title`;
    blankSection.querySelector('.sectionTitle').setAttribute('data-target', `#newSection${newSections.length}`);
    blankSection.querySelector('.sectionTitle').setAttribute('aria-controls', `newSection${newSections.length}`);
    blankSection.querySelector('.sectionBody').id = `newSection${newSections.length}`;
    blankSection.querySelector('.sectionBody').setAttribute('aria-labelledby', `newSection${newSections.length}Title`);
    blankSection.querySelector('label').for = `${newSection.sectionNumber}TitleField`;
    blankSection.querySelector('input').id = `${newSection.sectionNumber}Title`;
    blankSection.querySelector('.addQuestionLink').onclick = function(e) {
        addQuestionLinkListener(e, this);
    };
    blankSection.querySelector('.addQuestionLink').dispatchEvent(new Event('click'));

    fullForm.append(blankSection);
    sections = document.querySelectorAll('section');
    // sections[sections.length - 1].ondragstart = collapseAllSections;
    // sections[sections.length - 1].ondragend = function (e) {
    //     toggleCollapse(this.querySelector('.collapse'));
    // }
    addSectionDragListeners(sections[sections.length - 1])
    new Sortable(sections[sections.length - 1].querySelector('.questionList'), {
        group: {
            name: `section${sections.indexOf(section)}`,
            pull: true,
            put: true,
        },
        draggable: '.draggable',
        handle: '.questionDragHandle',
        animation: 150
    })
}