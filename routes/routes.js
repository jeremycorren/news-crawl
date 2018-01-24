const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const CACHE = {};

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', (req, res) => {
	res.render('base.pug');
});

router.post('/', (req, res) => {
	const topic = req.body.topic;
	const keyword = req.body.keyword;

	let key;
	if (topic && !keyword) {
		key = topic;
	} else if (topic && keyword) {
		key = topic + '-' + keyword;
	}

	if (key in CACHE) {
		const docs = CACHE[key];
		res.json({ docs: docs });
	} else {
		let newKey;
		let params = { url: 'https://api.nytimes.com/svc/search/v2/articlesearch.json' };

		if (topic && !keyword) {
			newKey = topic;
			params.qs = buildQs(topic, null);
		} else if (topic && keyword) {
			newKey = topic + '-' + keyword;
			params.qs = buildQs(topic, keyword);
		}

		request.get(params, (err, resp, body) => {
			const docs = (JSON.parse(body)).response.docs;
			CACHE[key] = docs;
			res.json({ docs: docs });
		});
	}
});

function buildQs(topic, keyword) {
	let qs = {
    'api-key': 'aa89b8ea35e64154b30410e4978e2d13',
    'fq': `section_name:(\"${topic}\")`,
    'sort': 'newest',
    'fl': 'web_url,snippet,headline,pub_date,byline',
    'page': 0
	};

	if (keyword) {
		qs.q = `${keyword}`;
	}
	return qs;
}

module.exports = router;