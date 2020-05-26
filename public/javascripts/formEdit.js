// const Sortable = require("sortablejs");

var fullForm = document.querySelector('#fullForm');
var sections = document.querySelectorAll('.formSection');
var questions = document.querySelectorAll('.formQuestion');
var addQuestionLinks = document.querySelectorAll('.addQuestionLink');
var addOptionLinks = document.querySelectorAll('.addOptionLink');
var addSectionLink = document.querySelector('.addSectionLink');
var questionDeleteButtons = document.querySelectorAll('.questionDeleteButton');

function addOptionDragListeners() {
    var questionOptions = document.querySelectorAll('.questionOption');
    for(var option of questionOptions) {
        option.ondragstart = function(e) {
            this.classList.add('dragging');
            // e.stopPropagation();
        }
        option.ondragend = function(e) {
            this.classList.remove('dragging');
        }
    }
}


var sortableFormOptions = {
    group: {name: 'fullForm', pull: false, put: false},
    handle:'.sectionDragHandle',
    animation:150,
    draggable: 'section'
};

var formEditor = new Sortable(fullForm, sortableFormOptions);

function addSectionDragListeners(item) {
    item.ondragstart = function(e) {
    	fullForm.style.height = (fullForm.offsetHeight) + 'px';
        collapseAllSections(e);
    };

    item.ondragend = function (e) {
        this.querySelector('.collapse').classList.add('show');
        fullForm.style.height='';
    }

    item.ondragenter = function(e) {
        for (var section of sections) {
            section.querySelector('.collapse').classList.remove('show');
        }
        if(document.querySelector('.dragging').classList.contains('preventCollapse')) {
            this.querySelector('.collapse').classList.add('show');
        }
    }
    item.ondrop = function(e) {
        this.querySelector('.collapse').classList.add('show');
    }
}

var sectionsIndex = 0;
for (var section of sections) {

    var sortableSection = new Sortable(section.querySelector('.questionList'), {
        group: {
            name: `sections`,
            pull: 'sections',
            put: 'sections',
        },
        draggable: '.formQuestion',
        handle: '.questionDragHandle',
        animation: 150
    })

    addSectionDragListeners(section);
    sectionsIndex ++;
}

function addQuestionEventListeners(item) {
    /* Checking to see if the item being dragged is an option for a question so that
    the question won't collapse if it is */
    item.ondragstart = function(e) {
        if (!e.target.classList.contains('questionOption')) {
            fullForm.style.height = (fullForm.offsetHeight) + 'px';
            this.classList.add('dragging');
            this.querySelector('.collapse').classList.remove('show');
        };
    }
    item.ondragend = function(e) {
        this.classList.remove('dragging');
        this.querySelector('.collapse').classList.add('show');
        fullForm.style.height='';
    }
    item.ondragenter = function(e) {
        if(document.querySelector('.dragging').classList.contains('preventCollapse')) {
            this.querySelector('.collapse').classList.add('show');
        }
    }
}

for (var question of questions) {

    addQuestionEventListeners(question);

    var sortableOptions = new Sortable(question.querySelector('.typeOptions'), {
        group: {
            name: `questions`,
            pull: 'questions',
            put: 'questions'
        },
        draggable: '.questionOption',
        handle: '.optionDragHandle',
        animation: 150,
        swapThreshold: .6
    });
}

function collapseAllSections(e) {
    if(!e.target.classList.contains('preventCollapse')){
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
            <div class="input-group mb-2 questionOption draggable preventCollapse">
                <div class="input-group-prepend">
                    <label for="question${item.closest('.formQuestion').id}Value0" class="input-group-text optionDragHandle"><i class="fas fa-arrows-alt"></i></label>
                </div>
                <input type="text" name="form[sections][questions][values]" id="question${item.closest('.formQuestion').id}Value0" class="form-control valueOption" placeholder="New Option">
            </div>
            <div class="row">
                <div class="col card-text"><a href="" class="addOptionLink"><i class="fas fa-plus"></i> Add Option</a></div>
            </div>
        `;
        addOptionLinks = document.querySelectorAll('.addOptionLink');
        for (var link of addOptionLinks) {
            addOptionLinkListener(link);
        }

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

function addOptionLinkListener(item) {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        var parentQuestion = this.closest('.formQuestion');
        var existingOptions = parentQuestion.querySelectorAll('.questionOption');
        var optionId = `question${this.closest('.formQuestion').id}Value${existingOptions.length}`;
        var newOption = document.querySelector('#blankOption').content.cloneNode(true);
        newOption.querySelector('.input-group-text').for = optionId;
        newOption.querySelector('.questionOption').id = optionId;
        
        this.closest('.typeOptions').insertBefore(newOption, this.closest('.row'));
        addOptionDragListeners();
    })
}

/* Add new option to question types that allow it (checkbox, radio, select) */
for (var link of addOptionLinks) {
    addOptionLinkListener(link);
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
    addSectionDragListeners(sections[sections.length - 1])
    var newSectionSortable = new Sortable(sections[sections.length - 1].querySelector('.questionList'), {
        group: {
            name: `section${sectionsIndex}`,
            pull: true,
            put: true,
        },
        draggable: '.formQuestion',
        handle: '.questionDragHandle',
        animation: 150
    })
    sectionsIndex++;
    addQuestionEventListeners(sections[sections.length - 1].querySelector('.formQuestion'));
    window.scrollBy(0,-100)
}


/* TODO: Rewrite the 'edit' page to use client side JS 
to use templates to write questions to page instead of ejs, 
to enable reusability of code 
(or else see if you can reuse functions in ejs?) */