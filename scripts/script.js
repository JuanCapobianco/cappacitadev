const API_KEY = 'api_key=0e4d8e2b67444028bf6adc2ac2418125&language=pt-BR';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&'+API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?'+API_KEY;


// pegando elementos do HTML
const main = document.getElementById('main');
const form =  document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');

const prev = document.getElementById('prev');
const proxima = document.getElementById('proxima');
const atual = document.getElementById('atual');

var currentPage = 1;
var nextPage = 2;
var prevPage = 3;
var lastUrl = '';
var totalPages = 100;

var selectedGenre = []
setGenre();
function setGenre() {
    tagsEl.innerHTML= '';
    generos.forEach(genre => {
        const t = document.createElement('div');
        t.classList.add('tag');
        t.id=genre.id;
        t.innerText = genre.name;
        t.addEventListener('click', () => {
            if(selectedGenre.length == 0){
                selectedGenre.push(genre.id);
            }else{
                if(selectedGenre.includes(genre.id)){
                    selectedGenre.forEach((id, idx) => {
                        if(id == genre.id){
                            selectedGenre.splice(idx, 1);
                        }
                    })
                }else{
                    selectedGenre.push(genre.id);
                }
            }
            console.log(selectedGenre)
            getMovies(API_URL + '&with_genres='+encodeURI(selectedGenre.join(',')))
            highlightSelection()
        })
        tagsEl.append(t);
    })
}

function highlightSelection() {
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.classList.remove('highlight')
    })
    clearBtn()
    if(selectedGenre.length !=0){   
        selectedGenre.forEach(id => {
            const hightlightedTag = document.getElementById(id);
            hightlightedTag.classList.add('highlight');
        })
    }

}

function clearBtn(){
    let clearBtn = document.getElementById('clear');
    if(clearBtn){
        clearBtn.classList.add('highlight')
    }else{
            
        let clear = document.createElement('div');
        clear.classList.add('tag','highlight');
        clear.id = 'clear';
        clear.innerText = 'Limpar filtros X';
        clear.addEventListener('click', () => {
            selectedGenre = [];
            setGenre();            
            getMovies(API_URL);
        })
        tagsEl.append(clear);
    }
    
}

getMovies(API_URL);

function getMovies(url) {
  lastUrl = url;
    fetch(url).then(res => res.json()).then(data => {
        console.log(data.results)
        if(data.results.length !== 0){
            showMovies(data.results);
            currentPage = data.page;
            nextPage = currentPage + 1;
            prevPage = currentPage - 1;
            totalPages = data.total_pages;

            atual.innerText = currentPage;

            if(currentPage <= 1){
              prev.classList.add('disabled');
              proxima.classList.remove('disabled')
            }else if(currentPage>= totalPages){
              prev.classList.remove('disabled');
              proxima.classList.add('disabled')
            }else{
              prev.classList.remove('disabled');
              proxima.classList.remove('disabled')
            }

            tagsEl.scrollIntoView({behavior : 'smooth'})

        }else{
            main.innerHTML= `<h1 class="no-results">Nenhum Resultado encontrado</h1>`
        }
       
    })

}


function showMovies(data) {
    main.innerHTML = '';

    data.forEach(movie => {
        const {title, poster_path, vote_average, overview, id} = movie;
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
             <img src="${poster_path? IMG_URL+poster_path: "./images/poster.png" }" alt="${title}">

            <div class="movie-info">
                <h3>${title}</h3>
				<span class="${getColor(vote_average)}">${vote_average}</span>
            </div>
			
            <div class="sinopse" id="${id}">
                <b>Título original</b>: ${movie.original_title}
                <h3>Sinopse</h3>
                ${overview}            
            </div>
        `

        main.appendChild(movieEl);

        document.getElementById(id).addEventListener('click', () => {
          console.log(id)
          openNav(movie)
        })
    })
}



function getColor(vote) {
    if(vote>= 7.5){
        return 'green'
    }else if(vote >= 5.0){
        return "orange"
    }else{
        return 'red'
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value;
    selectedGenre=[];
    setGenre();
    if(searchTerm) {
        getMovies(searchURL+'&language=pt-BR&query='+searchTerm)
    }else{
        getMovies(API_URL);
    }

})

prev.addEventListener('click', () => {
  if(prevPage > 0){
    pageCall(prevPage);
  }
})

proxima.addEventListener('click', () => {
  if(nextPage <= totalPages){
    pageCall(nextPage);
  }
})

function pageCall(page){
  let urlSplit = lastUrl.split('?');
  let queryParams = urlSplit[1].split('&');
  let key = queryParams[queryParams.length -1].split('=');
  if(key[0] != 'page'){
    let url = lastUrl + '&page='+page
    getMovies(url);
  }else{
    key[1] = page.toString();
    let a = key.join('=');
    queryParams[queryParams.length -1] = a;
    let b = queryParams.join('&');
    let url = urlSplit[0] +'?'+ b
    getMovies(url);
  }
}