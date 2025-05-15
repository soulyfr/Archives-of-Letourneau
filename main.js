//data
const currentPage = window.location.pathname;
const sidebarToggle = document.getElementById('menuButton');
const sidebar = document.getElementById('sidebar');
const searchBar = document.querySelector('.search-bar');
let videoGrid;
let videoPlayer;
let videoPlayerBox;
let channelData;
if( currentPage === '/youtube.html'){
    videoGrid = document.querySelector('.video-grid');
} else if (currentPage === '/videoplayer.html'){
    videoPlayer = document.querySelector('.video-player');
}

const numVids = 20;

const ytDataApiKey = 'KEY HERE';

const ytViewsApiLink = `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=ZBfzCKVOzVE&key=${ytDataApiKey}`;
const ytApiLink =`https://youtube.googleapis.com/youtube/v3/search?` + 
                 `key=${ytDataApiKey}&part=snippet&channelId=UC3tNpTOHsTnkmbwztCs30sA&maxResults=${numVids}&order=date&type=video&videoDuration=long`;
const channelApiLink= `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=UC3tNpTOHsTnkmbwztCs30sA&key=${ytDataApiKey}`
 

//base loadup stuff

let currentDay = new Date().toLocaleDateString();

if(currentPage === '/youtube.html'){
    displayVideos(ytApiLink, numVids, currentDay);

} else if (currentPage === '/videoplayer.html') {
  
    videoPlayerBox = document.querySelector('.player-and-data');
    videoPlayer = document.querySelector('.video-player');
    videoPlayer.setAttribute('src', `https://www.youtube.com/embed/${localStorage.getItem('videoId')}?autoplay=1&hd=1`);

    channelData = await fetchData(channelApiLink);
    const subCount = channelData.items[0].statistics.subscriberCount;
    const descriptionText = channelData.items[0].snippet.description;
    const subBox = document.querySelector('.subs');
    const descBox = document.querySelector('.description');

    subBox.textContent = `${subCount/1000000}M subscribers`;
    descBox.textContent = descriptionText;
    

} else { console.log('something is not right my friend');}


//light up name (only works on main page so far)
let lightUpText;
const acceptedNlFormats = ['northernlion','Northernlion','nl','NL','NORTHERNLION']


//buttons and other events

sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('active');
    if(videoGrid){videoGrid.classList.toggle('active');}
    if(videoPlayerBox){videoPlayerBox.classList.toggle('active');}
});

searchBar.addEventListener('input', function(){
    if (acceptedNlFormats.includes(searchBar.value)){
        for (let i = 0; i < lightUpText.length; i++) {
            lightUpText[i].classList.add('active');
        }
    } else {
        for (let i = 0; i < lightUpText.length; i++) {
            lightUpText[i].classList.remove('active');}
    }
})

//body height auto-resizing when using video grid on main - deprecated
// if(videoGrid){
//     const observer = new ResizeObserver(() => {
//         let gridHeight = videoGrid.offsetHeight;
//         let bodyAdjustedHeight = gridHeight + 1000;
//         //console.log(gridHeight);
//         document.body.style.height = `${bodyAdjustedHeight}px`;
//     });
//     observer.observe(videoGrid);
// }



// funcs

async function fetchData(link) {

    try{

         
        const response = await fetch(link);

        if(!response.ok){
            throw new Error("Could not fetch resource");
        }

        const data = await response.json();
        
        return data;
    }
    catch(error){
        console.error(error);
    }
}


function publishedAgo (date) {

    const currentDate = new Date();
    const publishedDate = new Date(date);

    let diffMinutes = (currentDate - publishedDate) / 60000;
    
    if (diffMinutes < 60) {
        return [Math.floor(diffMinutes), 'minute'];
    }
    else if (diffMinutes > 1440 && diffMinutes < 40320) {
        return [Math.floor(diffMinutes/1440), 'day'];
    }
    else if (diffMinutes > 40320 && diffMinutes < 525600) {
        return [Math.floor(diffMinutes/40320), 'month'];
    }
    else if (diffMinutes > 525600) {
        return [Math.floor(diffMinutes/525600), 'year'];
    }
    else { return [Math.floor(diffMinutes/60), 'hour'];}

}

 
async function setVideos(videoData, videoCount) {
    const data = videoData;
    
    for (let i = 0; i < videoCount; i++) { 
        const video = data.items[i].snippet;
     
        const id = data.items[i].id.videoId;
        const link = `https://www.youtube.com/watch?v=${id}`;
        const viewsLink = `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${id}&key=${ytDataApiKey}`;
     
        const viewsData = await fetchData(viewsLink);


        const title = video.title;
        const thumbnail = video.thumbnails.high.url;
        const channelName = video.channelTitle;
        const publishTime = video.publishTime;
        
        let viewCount = viewsData.items[0].statistics.viewCount;
        
        let viewString;
        if (viewCount >= 1000) {
            viewCount = Math.floor(viewCount/1000);
            viewString = `${viewCount}K views`;
        } else {viewString = `${viewCount} views`};

        let publishedTimeAgo = publishedAgo(publishTime)[0];

        let publishedTimeAgoMetric = publishedAgo(publishTime)[1];
        if (publishedTimeAgo > 1) {
            publishedTimeAgoMetric += 's';
        }

        const grid = document.querySelector('.video-grid');


        let vidElem = document.createElement('div');
        vidElem.classList.add('video');

        vidElem.innerHTML = `<a class="clickable-thumbnail" href="/videoplayer.html" video-id="${id}">
          <img class="thumbnail" src="${thumbnail}" video-id="${id}">
        </a>
        <div class="data-grid">
          <div class="profile">
            <img class="pfp" src="thumbnails/pfp.png">  
          </div>
          <div class="data">
            <a class="title" href="/videoplayer.html" video-id="${id}">${title}</a>
            <p class="channel">${channelName}</p>
            <p class="videodata">${viewString} &middot; ${publishedTimeAgo} ${publishedTimeAgoMetric} ago</p>
          </div>
        </div>`
        grid.appendChild(vidElem);
    }
    
    lightUpText = document.getElementsByClassName('channel');
}


async function displayVideos(source, videoCount, day) {
    
    let data;

    // TROUBLESHOOTING - use if page doesn't load correctly on first startup
    // data = await fetchData(source);
    // localStorage.setItem ("videoData", JSON.stringify(data));

    if (day !== localStorage.getItem('date-check')){
        data = await fetchData(source);
        data ? localStorage.setItem ("videoData", JSON.stringify(data)) : console.log('Error fetching videos!');
        localStorage["date-check"] = currentDay;
    } else { data = JSON.parse(localStorage.getItem('videoData'));
        }
    await setVideos(data, videoCount);

    const thumbnails = document.querySelectorAll('.clickable-thumbnail');
    const titles = document.querySelectorAll('.title');

    for(const thumbnail of thumbnails){
        thumbnail.addEventListener('mousedown', getEmbedData);
    }

    for(const title of titles){
        title.addEventListener('mousedown', getEmbedData);
        
    }

}

function getEmbedData (event) {
    const clickedItem = event.target.closest('[video-id]');
    if (clickedItem) {
        const videoId = clickedItem.getAttribute('video-id');
        if (videoId) {
            localStorage.setItem('videoId', videoId);
        }
    }
}
