import axios from "axios";
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


const refs = {
    searchForm: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMore: document.querySelector('.load-more'),

}

refs.loadMore.style.display = 'none';

const BASE_URL = 'https://pixabay.com/api/';
let totalShown = 0;
let myPage = 1;

refs.searchForm.addEventListener('submit', onInputSearch);
refs.searchForm.addEventListener('input', onInputEnter);
refs.loadMore.addEventListener('click', onLoadMore);



function onInputSearch(event) {
    event.preventDefault();
    refs.gallery.innerHTML = '';

    const query = refs.searchForm.querySelector('input').value;
   
   
    if (!query) {
        refs.gallery.innerHTML = '';
        return Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    } else {
        downloadFromPixabay(query);
       
    }

}



async function downloadFromPixabay(query, myPage) {
    const options = {
        params: {
            key: '31598884-ea00c386bb36a2be5ba3c24a4',
            q: query,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: 'true',
            page: myPage,
            per_page: 40,
            
        },
    };

    try {
        const findArray = await axios.get(BASE_URL, options);
        totalShown += findArray.data.hits.length;
        console.log(totalShown);

        messageAboutResult(
            findArray.data.hits.length,
            totalShown,
            findArray.data.total
        );
        
        if (findArray.data.hits.length < 1) {
            return Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        };

        createGallery(findArray.data);

    } catch (error) {
        console.log('Ничего не получается', error);
    };

}

function createGallery(pictures) {
    const markup = pictures.hits
        .map(({webformatURL, tags, largeImageURL, likes, views, comments, downloads }) => {
           
            return `
                <a class="gallery__item" href="${largeImageURL}">
                    <div class="photo-card">
                        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                        <div class="info">
                            <p class="info-item">
                                <b>Likes: </b>${likes}
                            </p>
                            <p class="info-item">
                                <b>Views: </b>${views}
                            </p>
                            <p class="info-item">
                                <b>Comments: </b>${comments}
                            </p>
                            <p class="info-item">
                                <b>Downloads: </b>${downloads}
                            </p>
                        </div>
                    </div>
                </a>
            `;
        })
        .join('');
   
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    gallerySimpleLightBox.refresh();


}


let gallerySimpleLightBox = new SimpleLightbox('.gallery a', {
   
    captionsData: 'alt',
    captionDelay: 250,
    animationSpeed: 200,
    scaleImageToRatio: true,

});

function messageAboutResult(length, shown, total) {
    console.log('total', total);
    console.log('shown', shown);
    if (length < 1) {
        Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        console.log("Sorry, there are no images matching your search query. Please try again.")
    }
    if(shown >= 1) {
        Notiflix.Notify.info(`"Hooray! We found ${total} images."`);
        console.log(`"Hooray! We found ${total} images."`)
    }
    if (total > shown) {
        refs.loadMore.style.display = 'flex';

    }
    if (totalShown === total) {
        refs.loadMore.style.display = 'none';
        Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
        console.log("We're sorry, but you've reached the end of search results.")
    }
}


function onLoadMore() {
    myPage += 1;
    const query = refs.searchForm.querySelector('input').value;
    downloadFromPixabay(query, myPage);
   
    const { height: cardHeight } = document
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}


window.addEventListener('scroll', () => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement
    if(scrollHeight - clientHeight === scrollTop) {
        onLoadMore()
    }
})

   
function onInputEnter(evt) {
    const q = refs.searchForm.querySelector('input').value;
    if (q.length <= 1) {
        refs.gallery.innerHTML = '';
        refs.loadMore.style.display = 'none';
    }
}