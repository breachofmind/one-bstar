# 1Brightstar

Website for Brightstar's 2016 vision and values roll-out. 

## Authors

- Mike Adamczyk <mike.adamczyk@brightstar.com> 
- Kendal Kirby <kendal.kirby@brightstar.com>
- Franco Segura <franco.segura@brightstar.com>

## Structure

This site has 3 directories:

- `js` : The source javascript files.
- `public` : Static files that contain the views. images and compiled source code.
- `scss` : The source stylesheets.

Dependencies are managed with Node Package Manager, or `npm`. See __Installation__ for details.

## Installation

There are a few things you will need to install first before the making changes to the source files inside `js` and `scss`.

1. Install Node.js (https://nodejs.org).
2. Install Ruby (https://ruby-lang.org).
3. Install the Sass gem using the command: `gem install sass`.
4. Install the Compass gem using the command: `gem install compass`.
5. Install the Gulp CLI using the command: `npm install -g gulp-cli`.

When all this is complete, you can install the packages required for this project by typing this command while in the project directory (where package.json is located):

`
npm install
`

This will install the project dependencies and development tools.

## Development

This project uses `gulp` as its front-end task runner. To compile the project, run this command:

`
gulp
`

When developing locally, you may also run the `watch` task. This will watch your files for changes and run compilation steps accordingly.

`
gulp watch
`

You may also start a local server which will automatically live-reload your browser after changes are made to your files.
This functionality is provided by `lite-server` and browsersync. See `bs-config.json` for configuration settings.

`
npm run dev
`

## Adding a Slide

This project uses angular directives to load slide .html files from the `/public/slides` directory. To add a slide:

- Create a new slide .html file inside `/public/slides`.
- Find the `#Content` div in `index.html`.
- Create a new `section`:

`
<section id="MySlideName" class="slide" use-slide="slide-newslide.html" data-bg="/images/my-background.jpg (optional)"></section>
`

- Inside the `#MainNav .link-list`, create another link to your slide:

`
<a href="javascript:;" scroll-to="MySlideName">My Label</a>
`

The application should be able to take care of the rest. However, you may want to add an image to the preloader if it is large. To do this, edit the `preloadImages` variable in `/js/controllers/app.c.js`.