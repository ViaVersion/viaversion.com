let questions = {};

async function fetchJson(name) {
    try {
        const response = await fetch(`data/${name}.json`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${name}.json:`, error);
        return [];
    }
}

async function fetchContributors() {
    try {
        const response = await fetch('https://api.github.com/repos/ViaVersion/ViaVersion/contributors');
        return await response.json();
    } catch (error) {
        console.error('Error fetching contributors:', error);
        return [];
    }
}

function openSetupGuide() {
    document.getElementById("formContent").innerHTML = '';
    addQuestion(questions, 1);
    document.getElementById("setupModal").style.display = "block";
}

window.onclick = function (event) {
    if (event.target === document.getElementById("setupModal")) {
        document.getElementById("setupModal").style.display = "none";
    }
};

function addQuestion(step, stepNumber) {
    const formContent = document.getElementById("formContent");
    const questionGroup = document.createElement("div");
    questionGroup.className = "mb-3";
    questionGroup.id = `step-${stepNumber}`;
    const questionText = document.createElement("h5");
    questionText.innerText = `${stepNumber}. ${step.question}`;
    questionGroup.appendChild(questionText);
    if (step['multi-answers']) {
        const checkboxGroup = document.createElement("div");
        checkboxGroup.className = "form-check";
        checkboxGroup.id = `checkbox-group-${stepNumber}`;
        for (const [key, value] of Object.entries(step['multi-answers'])) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = key;
            checkbox.className = "form-check-input";
            checkbox.dataset.recommendations = Array.isArray(value) ? value.join(",") : value;
            checkbox.id = `checkbox-${stepNumber}-${key}`;
            checkbox.name = `checkbox-${stepNumber}`;
            checkbox.onchange = function () {
                removeRecommendation();
                removeNextSteps(stepNumber);
                generateMultiAnswerRecommendation(stepNumber);
            };
            const label = document.createElement("label");
            label.htmlFor = `checkbox-${stepNumber}-${key}`;
            label.innerText = key;
            label.className = "form-check-label";
            const lineBreak = document.createElement("br");
            checkboxGroup.appendChild(checkbox);
            checkboxGroup.appendChild(label);
            checkboxGroup.appendChild(lineBreak);
        }
        questionGroup.appendChild(checkboxGroup);
    } else if (step['answers']) {
        const select = document.createElement("select");
        select.id = `select-step-${stepNumber}`;
        select.className = "form-select";
        select.onchange = function () {
            const selectedOption = this.value;
            removeRecommendation();
            removeNextSteps(stepNumber);
            const nextStep = step.answers[selectedOption];
            if (typeof nextStep === "string") {
                questionGroup.appendChild(createRecommendation(nextStep));
            } else {
                addQuestion(nextStep, stepNumber + 1);
            }
        };
        const defaultOption = document.createElement("option");
        defaultOption.text = "Select an option";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);
        for (const [key] of Object.entries(step.answers)) {
            const option = document.createElement("option");
            option.value = key;
            option.text = key;
            select.appendChild(option);
        }
        questionGroup.appendChild(select);
    }
    formContent.appendChild(questionGroup);
}

function generateMultiAnswerRecommendation(stepNumber) {
    const checkedBoxes = document.querySelectorAll(`#checkbox-group-${stepNumber} input[type="checkbox"]:checked`);
    let recommendations = [];
    checkedBoxes.forEach(cb => {
        const values = cb.dataset.recommendations.split(",");
        recommendations = recommendations.concat(values);
    });
    recommendations = [...new Set(recommendations)];
    if (recommendations.length > 0) {
        const recommendationText = recommendations.join(', ');
        document.getElementById(`step-${stepNumber}`).appendChild(createRecommendation(recommendationText));
    }
}

function createRecommendation(nextStep) {
    const recommendation = document.createElement("button");
    recommendation.className = "recommendation btn btn-outline-info mt-3";
    recommendation.style.width = "100%";
    if (nextStep.startsWith("https://")) {
        recommendation.innerHTML = `<a href="${nextStep}" target="_blank"><strong>${nextStep}</strong></a>`;
    } else {
        recommendation.disabled = true;
        recommendation.innerHTML = `<strong>${nextStep}</strong>`;
    }
    return recommendation;
}

function removeNextSteps(currentStep) {
    let nextStep = currentStep + 1;
    while (document.getElementById(`step-${nextStep}`)) {
        document.getElementById(`step-${nextStep}`).remove();
        nextStep++;
    }
}

function removeRecommendation() {
    const recommendations = document.getElementsByClassName("recommendation");
    while (recommendations.length > 0) {
        recommendations[0].remove();
    }
}

function createProjectCard(project) {
    return `
        <details class="my-3" open>
            <summary class="fs-3 text-center">${project.category}</summary>
            <div class="row cardcontainer rounded justify-content-center">           
                    ${project.items.map(item => `                     
                        <div class="card ms-3 mt-2 p-2 bg-content project" data-name="${item.name}" data-url="${item.url}" data-image="${item.image}" data-description="${item.description}" data-details='${JSON.stringify(item.details)}' data-links='${JSON.stringify(item.links)}'>
                <img src="${item.image}" class="card-img-top" alt="${item.name} Logo" loading="lazy">
                <div class="card-body">
                    <h5 class="card-title text-center">${item.name}</h5>
                </div>
            </div>
                    `).join('')}
                    </div>
                </details>            
    `;
}

function setupProjectCards(projects) {
    const overviewContainer = document.getElementById('projects-overview');
    overviewContainer.innerHTML = projects["projects"].map((project, index) => createProjectCard(project)).join('');

    document.querySelectorAll('.project').forEach(card => {
        card.addEventListener('click', () => {
            const name = card.getAttribute('data-name');
            const url = card.getAttribute('data-url');
            const image = card.getAttribute('data-image');
            const description = card.getAttribute('data-description');
            let details = card.getAttribute('data-details');
            let links = card.getAttribute('data-links');
            const popup = document.getElementById('popup');
            const popupBody = document.getElementById('popup-body');
            let additionalButtons = '';
            let requiresText = '';
            if (details !== "undefined") {
                details = JSON.parse(details);
            }
            if (links !== "undefined") {
                links = JSON.parse(links);
            }
            if (links.gettingStarted && links.gettingStarted.trim()) {
                additionalButtons += `<a href="${links.gettingStarted}" class="btn btn-primary m-1" target="_blank"><i class="bi-play-circle-fill"></i> Getting Started</a>`;
            }
            if (links.javadocs && links.javadocs.trim()) {
                additionalButtons += `<a href="${links.javadocs}" class="btn btn-warning m-1" target="_blank"><i class="bi bi-journal-code "></i> Javadocs</a>`;
            }
            if (links.apiDevelopers && links.apiDevelopers.trim()) {
                additionalButtons += `<a href="${links.apiDevelopers}" class="btn btn-secondary m-1" target="_blank"><i class="bi bi-code-slash"></i> API for Developers</a>`;
            }
            if (links.wiki && links.wiki.trim()) {
                additionalButtons += `<a href="${links.wiki}" class="btn btn-info m-1" target="_blank"><i class="bi bi-journal-text"></i> Wiki</a>`;
            }
            if (details.requires && details.requires.trim()) {
                requiresText = `Requires ${details.requires}`;
            }
            popupBody.innerHTML = `<button type="button" class="btn-close" onclick="hide()" style="float: right"></button>
                 <div class="modal-header">
    <img  src="${image}" alt="${name} Logo" class="me-3 rounded" style="max-width: 7em">
    <div>
        <h2 class="modal-title">${name}</h2>
        <p class="text-muted">${requiresText}</p>              
    </div>
</div>
<div>
    <p>${description}</p>
    <p><strong>Installed on:</strong> ${details.installedOn}</p>
    ${details.allows ? `<p><strong>Allows:</strong> ${details.allows}</p>` : ''}
    ${details.additionalBenefits ? `<p><strong>Additional benefits:</strong> ${details.additionalBenefits}</p>` : ''}
    <div class="buttons-row text-center">
        <a href="${url}" class="btn btn-success m-1" target="_blank"><i class="bi bi-download"></i> Download</a>
        ${additionalButtons}
    </div>
</div>
                `;
            popup.style.display = 'block';
        });
    });
}

function setupContributors(contributors) {
    const grid = document.getElementById('contributor-grid');
    grid.innerHTML = contributors.map(contributor => `           
             <div class="card ms-3 mt-2 p-2 bg-content" style="width: 6em; height: 6em">
              <a href="${contributor.html_url}" target="_blank">
                <img src="${contributor.avatar_url}&size=78" alt="${contributor.login}" loading="lazy" class="card-img-top rounded-circle">
            </a>                
            </div>
        `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    fetchJson("projects").then(data => {
        setupProjectCards(data);
    });
    fetchContributors().then(data => {
        setupContributors(data);
    });
    fetchJson("selections").then(data => {
        questions = data
    });
    window.addEventListener('click', (event) => {
        const popup = document.getElementById('popup');
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
});

function hide() {
    document.getElementById('popup').style.display = 'none';
}