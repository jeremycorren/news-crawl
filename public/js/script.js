const form = document.getElementById('form-container');
const select = document.getElementById('topic-select');
const filterCheck = document.getElementById('filter-check');
const submitBtn = document.getElementById('submit-btn');
const section = document.getElementById('section');
const panelContainer = document.getElementById('panel-container');

/**
 * Dropdown configuration
 */
$('#topic-select').select2({
	theme: 'bootstrap',
	placeholder: 'Select a topic',
	allowClear: true
});

/**
 * Keyword input configuration
 */
filterCheck.addEventListener('change', () => {
	const keywordInput = document.getElementById('keyword');
	if (filterCheck.checked) {
		keywordInput.setAttribute('style', 'display: block;');
	} else {
		keywordInput.value = '';
		keywordInput.setAttribute('style', 'display: none;');
	}
});

/**
 * Check whether to enable form submission
 */
setInterval(() => {
	const keywordInput = document.getElementById('keyword');
	if (select.value) {
		if (filterCheck.checked && keywordInput.value === '') {
			submitBtn.setAttribute('disabled', 'true');
		} else {
			submitBtn.removeAttribute('disabled');
		}
	} else {
		submitBtn.setAttribute('disabled', 'true');
	}
}, 100);

/**
 * On form submit, request API from backend and display query result
 */
submitBtn.addEventListener('click', () => {
	const selectedTopic = select.value;
	const keywordInput = document.getElementById('keyword');

	let keyword;
	if (keywordInput !== '') {
		keyword = keywordInput.value;
	}

	let jsonData;
	if (selectedTopic && !keyword) {
		jsonData = { topic: selectedTopic };
	}

	if (selectedTopic && keyword) {
		jsonData = {
			topic: selectedTopic,
			keyword: keyword
		}
	}

	if (jsonData) {
		fetch('/site', {
			method: 'POST',
			body: JSON.stringify(jsonData),
			headers: new Headers({ 'Content-Type': 'application/json' })
		}).then(res => {
			return res.json();
		}).catch(err => {
			console.error('Error: ', err);
		}).then(data => {
			const ajaxCol = document.getElementById('ajax-col');
			ajaxCol.setAttribute('style', 'display: block;');

			const instructions = document.getElementsByClassName('instruction');
			Array.prototype.forEach.call(instructions, (instruction, idx) => {
				instruction.setAttribute('style', 'display: block;');
			});

			const sectionLabels = document.getElementsByClassName('section-label');
			Array.prototype.forEach.call(sectionLabels, (sectionLabel, idx) => {
				sectionLabel.setAttribute('style', 'display: inline-block;');
			});

			section.textContent = `${selectedTopic}`;
			section.setAttribute('style', 'display: inline-block;');

			panelContainer.setAttribute('style', 'display: block;');
			while (panelContainer.firstChild) {
	  		panelContainer.removeChild(panelContainer.firstChild);
			}

			const docs = data.docs;
			docs.forEach(article => {
				const outerPanel = createArticle(article);
				panelContainer.appendChild(outerPanel);
				
			});
		});
	}
});

/**
 * Create UI component from JSON article data
 */
function createArticle(article) {
	const outerPanel = document.createElement('div');
	outerPanel.classList.add('panel', 'panel-info', 'panel-view');

	const panelHeading = document.createElement('div');
	panelHeading.className = 'panel-heading';

	const paragraph = document.createElement('p');

	const headlineLink = document.createElement('a');
	headlineLink.id = 'headline';
	headlineLink.textContent = article.headline.main;
	headlineLink.href = article.web_url;

	paragraph.appendChild(headlineLink);
	panelHeading.appendChild(paragraph);

	const byline = document.createElement('span');
	byline.id = 'byline';
	byline.textContent = article.byline.original;

	const pubDate = document.createElement('span');
	pubDate.id = 'pub-date';
	pubDate.textContent = article.pub_date.slice(0, 10);
	
	panelHeading.appendChild(byline);
	panelHeading.appendChild(pubDate);			

	outerPanel.appendChild(panelHeading);

	const panelBody = document.createElement('div');
	panelBody.className = 'panel-body';

	const snippet = document.createElement('div');
	snippet.id = 'snippet';
	snippet.textContent = article.snippet;
	panelBody.appendChild(snippet);

	outerPanel.appendChild(panelBody);
	return outerPanel;
}