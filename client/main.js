import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import '../lib/routes'

import '/node_modules/materialize-css/dist/css/materialize.min.css';
import '/node_modules/materialize-css/dist/js/materialize.min.js';

// imports to load layouts
import './HomeLayout.html';
import './MainLayout.html';
import {FlowRouter} from "meteor/ostrio:flow-router-extra";

let queryFilm = '';

// On created methods
Template.HomeLayout.onCreated(function homeOnCreated() {
  let ctrl = this;
  this.movies = new ReactiveVar();
  this.historic = new ReactiveVar();
  HTTP.call('GET', '/api/discover/movie', {},
      function(error, response) {
        ctrl.movies.set(JSON.parse(response.content).results)
      });
    HTTP.call('GET', '/api/search/historic', {},
        function(error, response) {
            console.log(response)
        });
});

Template.Results.onCreated(function MainLayoutOnCreated() {
    let ctrl = this;
    this.queryMovies = new ReactiveVar();
    let keyword = FlowRouter.getParam('_query');

    HTTP.call('GET', '/api/search/' + keyword, {},
        function(error, response) {
            ctrl.queryMovies.set(JSON.parse(response.content).results)
        });
})

Template.MoviePage.onCreated(function MainLayoutOnCreated() {
    let ctrl = this;
    this.movie = new ReactiveVar();
    let movie_id = FlowRouter.getParam('_id');

    HTTP.call('GET', '/api/movie/' + movie_id, {},
        function(error, response) {
            console.log(response.content)
            console.log(movie_id)
            ctrl.movie.set(JSON.parse(response.content))
        });
})


// Helpers
Template.HomeLayout.helpers({
  movies() {
    return Template.instance().movies.get();
  }
});

Template.Results.helpers({
    queryMovies() {
        return Template.instance().queryMovies.get();
    }
})

Template.MoviePage.helpers({
    movie() {
        return Template.instance().movie.get();
    }
})


// Events binding
Template.HomeLayout.events({
    "click button"(event, instance){
        console.log('clicked')
        const idMovie = event.currentTarget.dataset.id;
        updateLikeMovie(idMovie, Template.instance().movies);
    },
    "keyup #search-movie"(event, instance){
        let keyword = event.currentTarget.value
        queryFilm = keyword
    },
    "click #submit-search"(event, instance){
        FlowRouter.go('Results', { _query: queryFilm });
    }
});

Template.Results.events({
    "click button"(event, instance){
        const idMovie = event.currentTarget.dataset.id;
        updateLikeMovie(idMovie, Template.instance().queryMovies);
    }
})

Template.MoviePage.events({
    "click button"(event, instance){
        const idMovie = event.currentTarget.dataset.id;
        updateLikeMovie(idMovie, Template.instance().movie);
    },
    "click .show-preview"(event, instance) {
        const idMovie = event.currentTarget.dataset.id;
        displayTrailer(idMovie);
    }
})


// Functions
function updateLikeMovie(idMovie, movies) {
    HTTP.call('PUT', '/api/like/' + idMovie, {},
        function (error, response) {
            console.log(JSON.parse(response.content).id);
            const index = movies.get().findIndex(function (item) {
                return item.id === JSON.parse(response.content).id;
            });

            if (index > -1) {
                let newMoviesList = movies.get();
                newMoviesList[index].like = JSON.parse(response.content).like;
                movies.set(newMoviesList);
            }
        });
}

function displayTrailer(idMovie) {
    HTTP.call('GET', '/api/video/' + idMovie,{},
        function(error, response){
            const data = JSON.parse(response.content);
            const idFrame = data.results[0].key
            const Iframe = document.getElementById("Iframe");
            Iframe.setAttribute('src', "https://www.youtube.com/embed/" + idFrame);
        });
}
