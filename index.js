const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function crawlPages(sitemap_urls){
    let movie_list = [];

    for(i in sitemap_urls){ // Loop through each movie list, making an axios request to it and retrieving data.
        const res = await axios.get(sitemap_urls[i]);

        let $ = cheerio.load(res.data, {xmlMode: true});

        $("url").get().map(event => {
            var movieUrl = $(event).find('loc').text();
            const movieName = movieUrl.split("watch-")[1].split("-free")[0].replaceAll("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            movieUrl = movieUrl.replace("/tv/", "/watch-tv/").replace("/movie/", "/watch-movie/");

            movie_list.push({
                movieName: movieName,
                movieUrl: movieUrl
            })
        })
    }

    return movie_list;
}

async function crawlMainPage(sitemap_url){
    const res = await axios.get(sitemap_url);

    var $ = cheerio.load(res.data, {xmlMode: true});

    const sitemap_pages = $("sitemap").get().filter(function(event){
        if(!$(event).find("loc").text().includes("list")) // Exclude everything that isn't a "movie list"
            return false;

        return true;
    }).map(function(event){
        return $(event).find("loc").text(); // Return an array of "movie list" sitemap URLs
    })

    return await crawlPages(sitemap_pages)
}

async function main(){
    const movies = await crawlMainPage('https://arc018.com/sitemap.xml');

    fs.writeFile('./movie_list.json', JSON.stringify(movies, null, 4), err => {
        if (err) {
          console.error(err);
        }

        console.log("Finished!");
    });
}
main();