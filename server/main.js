import { Meteor } from 'meteor/meteor';
import { HTTP } from "meteor/http";
import { SERVER_CONFIG } from "./server-config";
import {WebApp} from "meteor/webapp";

const base_url = SERVER_CONFIG.themoviedb_api_config.base_url
const api_key = SERVER_CONFIG.themoviedb_api_config.api_key
const language = SERVER_CONFIG.themoviedb_api_config.language

const LikesCollection = new Mongo.Collection("Likes");

Meteor.startup(() => {
  // code to run on server at startup
});

WebApp.connectHandlers.use('/api/discover/movie', (req, res, next) => {
    HTTP.call('GET', base_url + 'discover/movie?api_key='+ api_key +'&language=' + language, {},
        function(error, response) {

            let newResponse = JSON.parse(response.content)

            newResponse.results.forEach(film => {
                film['like'] = getLikeMovie(film.id)
            })

            res.writeHead(200);
            res.end(JSON.stringify(newResponse));
    });
});

WebApp.connectHandlers.use('/api/like/', (req, res, next) => {
    let toReturn;
    switch (req.method) {
        case 'GET':
            break;
        case 'PUT':
            const idMovie = _getIdMovieFromPathParams(req.url);
            toReturn = updateLikeMovie(parseInt(idMovie));
            res.writeHead(200);
            res.write(JSON.stringify(toReturn));
            break;
        default:
            break;
    }
    res.end();
});

WebApp.connectHandlers.use('/api/search/', (req, res, next) => {
    let keyword = req.url.split('/')[1]
    HTTP.call('GET', base_url + 'search/movie?api_key='+ api_key +'&language=' + language + '&query=' + keyword, {},
        function(error, response) {
            let newResponse = JSON.parse(response.content)

            newResponse.results.forEach(film => {
                film['like'] = getLikeMovie(film.id)
            })

            res.writeHead(200);
            res.end(JSON.stringify(newResponse));
        });
});

WebApp.connectHandlers.use('/api/movie/', (req, res, next) => {
    let movie_id = req.url.split('/')[1]
    HTTP.call('GET', base_url + 'movie/' + movie_id + '?api_key='+ api_key +'&language=' + language, {},
        function(error, response) {
            let newResponse = JSON.parse(response.content)
            newResponse['like'] = getLikeMovie(newResponse.id)

            res.writeHead(200);
            res.end(JSON.stringify(newResponse));
        });
});

WebApp.connectHandlers.use('/api/video',(req,res,next) => {
    let movie_id = req.url.split('/')[1]
    HTTP.call('GET', base_url + 'movie/' + movie_id + '/videos?api_key=' + api_key + '&language=fr-FR', {},
        function(error, response){
            res.writeHead(200);
            res.end(JSON.stringify(response.data));
        });
});

function _getIdMovieFromPathParams(path) {
    return path.split("/")[1];
}

function updateLikeMovie(idMovie){
    let dbRessource = LikesCollection.findOne({ id: idMovie });

    if(dbRessource) {
        LikesCollection.update(
            { _id: dbRessource._id },
            { $inc: {like: 1} }
        );
    } else {
        LikesCollection.insert({id: idMovie, like: 1});
    }

    return LikesCollection.findOne({ id: idMovie });
}

function getLikeMovie(idMovie) {
    let dbRessource = LikesCollection.findOne({ id: idMovie });
    if(dbRessource) {
        return dbRessource.like
    } else{
        return 0
    }
}
