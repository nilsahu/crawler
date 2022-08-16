const Crawler = require('crawler');

const requestUrl = process.argv[2];
const requestDepth = process.argv[3];
let i = 1;
let obselete = []; // Array of what was crawled already
var results = [];

const crawlerInstance = new Crawler({
    rateLimit: 1000,
    callback: (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
            
            const $ = res.$;
            const siteUrl = res.request.href;
            const statsTable = $('img');
            statsTable.each(function() {
                var result = {};
                let imageUrl = $(this).attr('src');
                result.imageUrl = imageUrl;
                result.sourceUrl = siteUrl;
                result.depth = requestDepth;
                //console.log($(this));

                results.push(result);
                //return true; // breaks
            });
        }
        console.log(results);
        done();
    }
});



function crawlAllUrls(url) {
    console.log(`Crawling ${url} `);
    crawlerInstance.queue([{
        uri: url,
        callback: function (err, res, done) {
            if (err) throw err;
            let $ = res.$;
            try {
                let urls = $("a");

                for(var item=0; item<requestDepth; item++) {
                //Object.keys(urls).forEach((item) => {
                    if(i === requestDepth) {
                        done();
                        return false;
                    }
                    if (urls[item].type === 'tag') {
                        let href = urls[item].attribs.href;
                        if (href && !obselete.includes(href)) {
                            href = href.trim();
                            obselete.push(href);

                            // Slow down the
                            setTimeout(function() {
                                    href.startsWith(url) ? crawlAllUrls(href) : crawlAllUrls(`${url}${href}`)
                            //      // The latter might need extra code to test if its the same site and it is a full domain with no URI
                            }, 5000)
                            i++;
                        }
                    }
                }
                done();
                //console.log(obselete);
            } catch (e) {
                console.error('Encountered an error crawling ${url}. Aborting crawl. '+e);
                done();
            }   
        }
    }])
}

//crawlAllUrls(requestUrl);

crawlerInstance.queue(requestUrl);
