const { FlowRouter } = require("meteor/ostrio:flow-router-extra");

FlowRouter.route('/', {
    action() {
        BlazeLayout.render('HomeLayout')
    }
});

FlowRouter.route('/results/:_query', {
    name: "Results",
    action() {
        BlazeLayout.render('MainLayout', { main: 'Results' })
    }
});

FlowRouter.route('/movie/:_id', {
    name: "Movie",
    action() {
        BlazeLayout.render('MainLayout', { main: 'MoviePage' })
    }
});