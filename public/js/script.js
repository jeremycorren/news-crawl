const topics = new Bloodhound({
	datumTokenizer: Bloodhound.tokenizers.whitespace,
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	local: ['Arts', 'Business', 'Science', 'Technology', 
		'U.S.', 'Washington', 'World', 'Your Money']
});

function topicsWithDefaults(q, sync) {
	if (q == '') {
		sync(topics.get( // don't HARD CODE this
			'Arts', 'Business', 'Science', 'Technology', 
			'U.S.', 'Washington', 'World', 'Your Money'
		));
	} else {
		topics.search(q, sync);
	}
}

$('#topic-div .typeahead').typeahead({
  highlight: true,
	minLength: 0
}, {
  name: 'topics',
  limit: 10,
  source: topicsWithDefaults
});

const form = document.getElementById('form-container');
const input = document.getElementById('topic-input');
const section = document.getElementById('section');
const panelContainer = document.getElementById('panel-container');

const submitBtn = document.getElementById('submit-btn');
submitBtn.addEventListener('click', () => {
	const errors = document.getElementById('errors');

	const selectedTopic = input.value;
	if (!topics.local.includes(selectedTopic)) {
		errors.setAttribute('style', 'display: block;');
		errors.textContent = 'Invalid topic';
	} else {
		errors.setAttribute('style', 'display: none;');

		fetch('/site', {
			method: 'POST',
			body: JSON.stringify({ topic: selectedTopic }),
			headers: new Headers({ 'Content-Type': 'application/json' })
		}).then(res => {
			return res.json();
		}).catch(err => {
			console.error('Error: ', err);
		}).then(data => {
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

function createArticle(article) {
	const outerPanel = document.createElement('div');
	outerPanel.classList.add('panel', 'panel-default', 'panel-view');

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