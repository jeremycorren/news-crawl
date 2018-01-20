const path = require('path');
const express = require('express');
const PORT = 8080;

const app = express();
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, './public')));

app.use('/site', require('./routes/routes'));

app.get('/', (req, res) => {
	res.redirect('/site');
});

app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});