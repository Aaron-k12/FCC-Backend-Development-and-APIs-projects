require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb')
const dns = require('dns')
const urlParser = require('url');


const client = new MongoClient(process.env.MONGO_URI)
const db = client.db('url-shortener')
const urls = db.collection('urls')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const { url } = req.body
  
  const dnsLookup = dns.lookup(new URL(url).hostname, async(err, address) => {
    if (!address) {
      res.json({error: "Invalid URL"})
    } else {
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url,
        short_url: urlCount
      }
      const result = await urls.insertOne(urlDoc)
      console.log(result)
      res.json({
        original_url: url,
        short_url: urlCount
      })
    }
  })
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shortUrl = req.params.short_url
  const urlDoc = await urls.findOne({ short_url: Number(shortUrl)})
  res.redirect(urlDoc.url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
