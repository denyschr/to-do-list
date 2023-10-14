const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const fileinclude = require('gulp-file-include');
const cleanCss = require('gulp-clean-css');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const webpack = require('webpack-stream');

function html() {
	return src('src/pages/*.html')
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(dest('src/'))
		.pipe(browserSync.stream())
}

function fonts() {
	return src('src/fonts/src/*.*')
		.pipe(fonter({
			formats: ['woff', 'ttf']
		}))
		.pipe(ttf2woff2())
		.pipe(dest('src/fonts'))
}

function images() {
	return src(['src/images/src/**/*.*'])
		.pipe(src('src/images/src/**/*.*'))
		.pipe(newer('src/images'))
		.pipe(webp())

		.pipe(src('src/images/src/**/*.*'))
		.pipe(newer('src/images'))
		.pipe(imagemin())

		.pipe(dest('src/images'))
}

function sprite() {
	return src('src/images/svg/*.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../sprite.svg',
					example: true
				}
			}
		}))
		.pipe(dest('src/images'))
}

function scripts() {
	return src(
		'src/js/main.js'
	)
		.pipe(webpack({ mode: 'production' }))
		.pipe(rename({ extname: '.min.js', }))
		.pipe(dest('src/js'))
		.pipe(browserSync.stream())
}

function styles() {
	return src('src/scss/style.scss')
		.pipe(scss({ outputStyle: 'expanded' }))
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserlist: ['last 3 versions'],
			cascade: true
		}))
		.pipe(cleanCss())
		.pipe(rename({ extname: '.min.css' }))
		.pipe(dest('src/css'))
		.pipe(browserSync.stream())
}

function watching() {
	browserSync.init({
		server: {
			baseDir: "src/"
		}
	});
	watch(['src/scss/**/*.scss'], styles)
	watch(['src/js/*.js', '!src/js/main.min.js'], scripts)
	watch(['src/images/src'], images)
	watch(['src/components/*.html', 'src/pages/*.html'], html)
	watch(['src/*.html']).on('change', browserSync.reload)
}

function cleanDist() {
	return src('dist/')
		.pipe(clean())
}

function building() {
	return src([
		'src/css/style.min.css',
		'src/images/*.*',
		'src/images/svg/*.*',
		'src/fonts/*.*',
		'src/js/main.min.js',
		'src/sources/*.*',
		'src/*.html'
	], { base: 'src' })
		.pipe(dest('dist'))
}

exports.styles = styles;
exports.html = html;
exports.fonts = fonts;
exports.building = building;
exports.scripts = scripts;
exports.watching = watching;
exports.images = images;
exports.sprite = sprite;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, images, scripts, html, watching);