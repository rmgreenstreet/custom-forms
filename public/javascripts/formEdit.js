// const Sortable = require("sortablejs");

var fullForm = document.querySelector('#fullForm');
var addSectionLink = document.querySelector('.addSectionLink');
var typeSelectorOptions = inputTypes.map(function(type) {
    return `
        <option value="${type.htmlInputType}">${type.displayName}</option>
    `
});

async function drawForm(workingForm) {
    if (workingForm.sections.length > 0) {
        for (var section of workingForm.sections) {
            fullForm.insertBefore(await makeSection(section), fullForm.querySelector('#addSectionLinkRow'))
        }
    }
    sections = document.querySelectorAll('section');
    questions = document.querySelectorAll('formQuestion');
}

async function makeSection(workingSection = {}) {
    var newSection = document.querySelector('#blankSection').content.cloneNode(true);
    var sectionTitleDiv = newSection.querySelector('.sectionTitle');
    var sectionBody = newSection.querySelector('.sectionBody');
    var sectionTitleField = sectionBody.querySelector('.sectionTitleField');

    /* check whether this is a new section added with the link in the form or 
    part of the initial draw*/
    if (typeof sections !== 'undefined' && sections.length > 0) {
        var sectionId = `section${sections.length}`;
        sectionTitleDiv.querySelector('h3').textContent = 'New Section';
        sectionTitleField.setAttribute('placeholder', 'New Section Title');
        newSection.querySelector('.collapse').classList.add('show');
        newSection.querySelector('.questionList').appendChild(await makeQuestion());
    } else {
        var sectionId = `section${workingSection.order}`;
        sectionTitleDiv.querySelector('h3').textContent = `Section: ${workingSection.title}`;
        sectionTitleField.value = workingSection.title;
        if (workingSection.order === 0) {
            sectionTitleDiv.setAttribute('aria-expanded', 'true');
            newSection.querySelector('.collapse').classList.add('show');
        }
        if (workingSection.questions.length > 0) {
            for (var currentQuestion of workingSection.questions) {
                if (typeof currentQuestion.parentQuestionElementId !== 'undefined') {
                    continue;
                } else {
                    newSection.querySelector('.questionList').appendChild(await makeQuestion(currentQuestion));
                }
            }
        }
    }
    newSection.id = `${sectionId}`;
    sectionBody.setAttribute('id', `${sectionId}Body`);
    sectionBody.setAttribute('aria-labelledby', sectionTitleDiv.querySelector(`#${sectionId}Title`));
    
    sectionTitleDiv.dataset.target = `${sectionId}Body`;
    sectionTitleDiv.setAttribute('aria-controls', `${sectionId}Body`);
    sectionTitleDiv.querySelector('h3').setAttribute('id', `${sectionId}Title`);

    setElementTitleField(newSection, sectionId);
    
    return newSection;
}

async function makeQuestion(workingQuestion) {

    var newQuestion = document.querySelector('#blankQuestion').content.cloneNode(true);
    if (typeof workingQuestion.parentQuestionElementId !== 'undefined') {
        newQuestion.querySelector('.followUpCheckboxDiv').remove()
    }
    var newAddOptionLink = document.querySelector('#blankAddOptionLink').content.cloneNode(true);
    
    for (var inputType of inputTypes) {
        var newSelectOption = document.querySelector('#blankSelectOption').content.cloneNode(true);
        newSelectOption.querySelector('option').setAttribute('value', inputType.htmlInputType);
        newSelectOption.querySelector('option').textContent = inputType.displayName;
        if(typeof questions == 'undefined' && inputType.htmlInputType == workingQuestion.inputType) {
            newSelectOption.querySelector('option').setAttribute('selected','selected');
        }
        newQuestion.querySelector('.typeSelector').appendChild(newSelectOption);
    }

    if (typeof questions !== 'undefined' && questions.length > 0) { 
        var questionId = `newQuestion${questions.length}`;
        newQuestion.querySelector('.questionTypeLabel').setAttribute('for', `${questionId}Type`);
        newQuestion.querySelector('.typeSelector').setAttribute('id', `${questionId}Type`);
    } else {
        // var questionId = `question${workingQuestion._id}`;
        newQuestion.querySelector('.formQuestion').setAttribute('id', workingQuestion.elementId);
        newQuestion.querySelector('.questionTypeLabel').setAttribute('for', `${workingQuestion.elementId}Type`);
        newQuestion.querySelector('.typeSelector').setAttribute('id', `${workingQuestion.elementId}Type`);
        newQuestion.querySelector('.questionTitleField').value = workingQuestion.title;
        newQuestion.querySelector('.questionIdField').value = workingQuestion.elementId
        if (workingQuestion.values.length > 0) {
            var typeOptions = newQuestion.querySelector('.typeOptions');
            typeOptions.innerHTML = `<h4>Options</h4>`
            for (var value of workingQuestion.values) {
                typeOptions.appendChild(await makeOption(value, workingQuestion.values.indexOf(value), workingQuestion.elementId));
            }
            typeOptions.appendChild(newAddOptionLink);
        }
        if (workingQuestion.isRequired) {
            newQuestion.querySelector('.isRequiredCheckbox').checked = true;
        }
        if (workingQuestion.followUpQuestions.length > 0) {
            newQuestion.querySelector('.hasFollowUpCheckbox').checked = true;
            var questionCardBody = newQuestion.querySelector('.card-body');
            var questionDeleteButtonDiv = questionCardBody.querySelector('.questionDeleteButtonDiv');
            var blankFollowUpSection = document.querySelector('#blankFollowUpSection').content.cloneNode(true);
            for (var followUp of workingQuestion.followUpQuestions) {
                blankFollowUpSection.querySelector('.followUpSectionBody').appendChild(await makeQuestion(followUp))
            }
            questionCardBody.appendChild( blankFollowUpSection)
        }

    }
    
    newQuestion.id = questionId;

    setElementTitleField(newQuestion, questionId);


    return newQuestion;
}

async function makeOption(optionValue, optionIndex, parentId) {
    var newOption = document.querySelector('#blankQuestionOption').content.cloneNode(true);
    var optionId = `${parentId}Option${optionIndex}`;
    newOption.querySelector('label').setAttribute('for', optionId);
    newOption.querySelector('input').setAttribute('id', optionId);
    newOption.querySelector('input').value = optionValue;

    return newOption;
}

async function makeFollowUpSection() {
    var newFollowUpSection = document.querySelector('#blankFollowUpSection').content.cloneNode(true);
    return newFollowUpSection;
}

function setElementTitleField(element, id) {
    element.querySelector('label').setAttribute('for', `${id}TitleLabel`);
    element.querySelector('input').setAttribute('id', `${id}TitleField`);
}

function updateSectionTitle(e) {
    e.target.closest('.formSection').querySelector('h3').textContent = e.target.value;
}


async function pageInit() {
    await drawForm(currentForm);

    var sections = document.querySelectorAll('.formSection');
    var questions = document.querySelectorAll('.formQuestion');
    var followUpSections = document.querySelectorAll('.followUpSection');
    var addQuestionLinks = document.querySelectorAll('.addQuestionLink');
    var addOptionLinks = document.querySelectorAll('.addOptionLink');
    var questionDeleteButtons = document.querySelectorAll('.questionDeleteButton');

    addOptionDragListeners();
    
    var sortableFormOptions = {
        group: {name: 'fullForm', pull: false, put: false},
        handle:'.sectionDragHandle',
        animation:150,
        draggable: 'section'
    };

    var formEditor = new Sortable(fullForm, sortableFormOptions);

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

    /* tackle later 2020-06-16 */
    // for (var followUpSection of followUpSections) {
        
    //     Sortable.create(followUpSection, {
    //         group: {
    //             name: `followUpSections`,
    //             pull: 'sections',
    //             put: ['sections', 'followUpSections'],
    //         }
    //     });
    // }
    
    // changing inputs for form options based on input type selected
    var inputTypeSelectors = document.querySelectorAll('.typeSelector');

    addInputTypeChangeListener(inputTypeSelectors);

    for (var link of addQuestionLinks) {
        link.addEventListener('click', function(e) {
            addQuestionLinkListener(e, this);
        })
    }
    /* Add new option to question types that allow it (checkbox, radio, select) */
    for (var link of addOptionLinks) {
        addOptionLinkListener(link);
    }
    addDeleteButtonListener(questionDeleteButtons);
}

pageInit();


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
        var dragging = document.querySelector('.dragging')
        if(dragging.classList.contains('preventCollapse') && dragging !== this) {
            this.querySelector('.collapse').classList.add('show');
        }
    }
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



function addInputTypeChangeListener(list) {
    for (var item of list) {
        item.addEventListener('change', function (e) {
            setAppropriateOptions(e, e.target);
        })
    }
}

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

//Delete Question
function addDeleteButtonListener (list = []) {
    for (var item of list) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            this.closest('.formQuestion').remove(0);
        })
    }
}



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


/* 

TODO:
- Make sure templates have all necessary components 
- Remove EJS loops from edit File
- JSON.stringify currentForm variable so front-end has access to it
- Write function to loop through sections and draw onto page
- Write function to loop through questions 
and call it within section drawing function
- Write function to loop through options (based on question type)
and call it within question drawing function

*/