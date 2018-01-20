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

	if (topic in CACHE) { console.log('HIT CACHE');
		const docs = CACHE[topic];
		res.json({ docs: docs });
	} else { console.log('HIT API');
		const params = {
	  	url: 'https://api.nytimes.com/svc/search/v2/articlesearch.json',
		  qs: {
		    'api-key': 'aa89b8ea35e64154b30410e4978e2d13',
		    'fq': `source:(\"The New York Times\") AND section_name:(\"${topic}\")`,
		    'sort': 'newest',
		    'fl': 'web_url,snippet,headline,pub_date,byline',
		    'page': 0
		  }
		};

		request.get(params, (err, resp, body) => {
			const docs = (JSON.parse(body)).response.docs;
			CACHE[topic] = docs;

			res.json({ docs: docs });
		});
	}
});

module.exports = router;