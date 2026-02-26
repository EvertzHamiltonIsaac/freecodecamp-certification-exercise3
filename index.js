require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns').promises;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const DB = [{ original_url: 'https://www.youtube.com/', short_url: '45577' }];

const shorturlExist = async (shorturl) => {
  const result = DB.find((element) => element.short_url === shorturl);
  return result;
};

const shorturlGenerator = async (min = 10000, max = 99999) => {
  const shorturl = Math.round(Math.random() * (max - min) + min);
  if (await shorturlExist(shorturl)) return shorturlGenerator();
  return shorturl;
};

const original_url_exist = (original_url) => {
  const result = DB.find((element) => element.original_url === original_url);
  return result;
};

const isValidUrl = async (url) => {
  // 1. Validar formato
  try {
    new URL(url);
  } catch {
    return false;
  }
};

const ipfinder = async (HOST) => {
  try {
    const adresses = await dns.resolve4(HOST);
    return adresses[0];
  } catch (error) {
    throw error;
  }
};

// Your first API endpoint
app.post('/api/shorturl', async function (req, res) {
  const { url } = req.body;
  try {
    if (!url) throw 'URL DONT EXIST';
    console.log();
    console.log(await ipfinder(url.split('/')[2]));
    if (original_url_exist(url)) {
      console.log(original_url_exist(url));
      res.json(original_url_exist(url));
    } else {
      const code = await shorturlGenerator();
      DB.push({ original_url: url, short_url: `${code}` });
      console.log('Mostrando registros de DB: ', DB);
      res.json({ original_url: url, short_url: `${code}` });
    }
  } catch (error) {
    res.status(400).send({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', async function (req, res) {
  console.log(await shorturlExist(req.params.short_url));
  const resURL = await shorturlExist(req.params.short_url);
  res.redirect(resURL.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
