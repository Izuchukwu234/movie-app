const apiKey = `ba633748b8bfa50815708a8259a39f1d`
const imagePath = `https://image.tmdb.org/t/p/w1280`


const input = document.querySelector('.search input');
const button = document.querySelector('.search button');
const mainGridTitle = document.querySelector('.favorites h1');
const mainGrid = document.querySelector('.favorites .movies-grid');

const trendingElement = document.querySelector('.trending .movies-grid');

const popUpContainer = document.querySelector('.popup-container');

function addClickEffectToCard(cards){
    cards.forEach(card => {
        card.addEventListener('click', () => showPopup(card))
    })
}

// Search Movies
async function getMovieBySearch(search_phrase){
    const baseURL = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${search_phrase}`;
    const resp = await fetch(baseURL);
    const respData = await resp.json();
    return respData.results;
}

button.addEventListener('click', addSearchedMoviesToDom)
async function addSearchedMoviesToDom (){
    const data = await getMovieBySearch(input.value);

    mainGridTitle.innerText = `Search Results...`;
    mainGrid.innerHTML = data.map(function(e){
        return `
        <div class="card" data-id="${e.id}">
            <div class="img">
                <img src="${imagePath + e.poster_path}">
            </div>
            <div class="info">
                <h2>${e.title}</h2>
                <div class="single-info">
                    <span>Rating: </span>
                    <span>${e.vote_average} / 10</span>
                </div>

                <div class="single-info">
                    <span>Release Date: </span>
                    <span>${e.release_date}</span>
                </div>
            </div>
        </div>
        `
    }).join('');

    // click on the card to show the movie info
    const cards = document.querySelectorAll('.card');
    addClickEffectToCard(cards);

}

// Popup
async function getMovieById(id){
    const baseURL = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
    const resp = await fetch(baseURL);
    const respData = await resp.json();
    return respData
}

async function getMovieTrailer(id){
    const baseURL = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`;
    const resp = await fetch(baseURL);
    const respData = await resp.json();
    return respData.results[0].key;
}

async function showPopup(card){
    popUpContainer.classList.add('show-popup');

    const movieId = card.getAttribute('data-id');
    const movie = await getMovieById(movieId);
    const movieTrailer = await getMovieTrailer(movieId);
    popUpContainer.style.background = `linear-gradient(rgba(0, 0, 0, .8), rgba(0, 0, 0, 1)), url(${imagePath + movie.poster_path})`;

    console.log(movieTrailer);

    popUpContainer.innerHTML = `
    <span class="x-icon">&#10006</span>
        <div class="content">
            <div class="left">
                <div class="poster-img">
                    <img src="${imagePath + movie.poster_path}" alt="">
                </div>
                <div class="single-info">
                    <span>Add to Favorites:</span>
                    <!--this is the unicode for the heart icon-->
                    <span class="heart-icon">&#9829;</span>
                </div>
            </div>
            <div class="right">
                <h1>${movie.title}</h1>
                <h3>${movie.tagline}</h3>
                <div class="single-info-container">
                    <div class="single-info">
                        <span>Language:</span>
                        <span>${movie.spoken_languages[0].name}</span>
                    </div>
                    <div class="single-info">
                        <span>Length:</span>
                        <span>${movie.runtime} minutes</span>
                    </div>
                    <div class="single-info">
                        <span>Rating:</span>
                        <span>${parseFloat(movie.vote_average).toFixed(1)}/10</span>
                    </div>
                    <div class="single-info">
                        <span>Budget:</span>
                        <span>$${movie.budget}</span>
                    </div>
                    <div class="single-info">
                        <span>Release Date:</span>
                        <span>${movie.release_date}</span>
                    </div>
                </div>
                <div class="genres">
                    <h2>Genres</h2>
                    <ul>
                        ${movie.genres.map(e => `<li>${e.name}</li>`).join('')}
                    </ul>
                </div>
                <div class="overview">
                    <h2>Overview</h2>
                    <p>${movie.overview}</p>
                </div>
                <div class="trailer">
                    <h2>Trailer</h2>
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/${movieTrailer}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    `

    // closing the popup by clicking the x-icon
    const xIcon = document.querySelector('.x-icon');
    xIcon.addEventListener('click', function(){
        popUpContainer.classList.remove('show-popup');
    })

    // adding functionality to the heart icon and color change when clicked
    const heartIcon = popUpContainer.querySelector('.heart-icon');
    heartIcon.addEventListener('click', function(){
        if(heartIcon.classList.contains('change-color')){
            removeLocalStorage(movieId);
            heartIcon.classList.remove('change-color')
        } else{
            addToLocalStorage(movieId);
            heartIcon.classList.add('change-color');
        }

        fetchFavoriteMovies()
    })
}

// local storage function
function getLocalStorage(){
    const movieIds = JSON.parse(localStorage.getItem('movie-id'));
    return movieIds === null ? [] : movieIds;
}

function addToLocalStorage(id){
    const movieIds = getLocalStorage();
    localStorage.setItem('movie-id', JSON.stringify([...movieIds, id]));
}

function removeLocalStorage(id){
    const movieIds = getLocalStorage();
    localStorage.setItem('movie-id', JSON.stringify(movieIds.filter(e => e !== id)));
}

// lets fetch favorite movies from Local Storage (that has already been added)
fetchFavoriteMovies()
async function fetchFavoriteMovies(){
    mainGrid.innerHTML = '';
    const moviesLocalStorage = await getLocalStorage();
    const movies = []
    for(let i = 0; i <= moviesLocalStorage.length - 1; i++){
        const movieId = moviesLocalStorage[i];
        let movie = await getMovieById(movieId);
        addFavoritesToDomFromLocalStorage(movie);
        movies.push(movie);
    }
}

function addFavoritesToDomFromLocalStorage(movieData){
    mainGrid.innerHTML += `
    <div class="card" data-id="${movieData.id}">
    <div class="img">
        <img src="${imagePath + movieData.poster_path}">
    </div>
    <div class="info">
        <h2>${movieData.title}</h2>
        <div class="single-info">
            <span>Rating: </span>
            <span>${movieData.vote_average} / 10</span>
        </div>

        <div class="single-info">
            <span>Release Date: </span>
            <span>${movieData.release_date}</span>
        </div>
    </div>
</div>
    `
const cards = document.querySelectorAll('.card');
addClickEffectToCard(cards);
}

// Fetch trending movies
getTrendingMovies()
async function getTrendingMovies(){
    const baseURL = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`;
    const resp = await fetch(baseURL);
    const respData = await resp.json();
    return respData.results;
}

addToDomTrending()
async function addToDomTrending(){
    const data = await getTrendingMovies()
    console.log(data);
    
    // This will give us only 10 results from the data
    trendingElement.innerHTML = data.slice(0, 10).map(e => {
        return `
        <div class="card" data-id="${e.id}">
    <div class="img">
        <img src="${imagePath + e.poster_path}">
    </div>
        <div class="info">
            <h2>${e.title}</h2>
            <div class="single-info">
                <span>Rating: </span>
                <span>${e.vote_average} / 10</span>
            </div>

            <div class="single-info">
                <span>Release Date: </span>
                <span>${e.release_date}</span>
            </div>
        </div>
    </div>
        `
    }).join('');

    const cards = document.querySelectorAll('.card');
    addClickEffectToCard(cards);
}