
// // min
// SC.initialize({
//   client_id: '59ec82f45150ce7a5fd788d65d5a3f6a'
// });

// $('.js-search-song').on('submit', function (e) {
//   console.log('js-search-song', e, $(this.searchPattern).val());
//   SC.get('/tracks', {
//     q: $(this.searchPattern).val(),
//     limit: 7
//   }). // license: 'cc-by-sa'
//   then(function (tracks) {
//     console.log(tracks);
//     for (var i = 0; i < tracks.length; i++) {if (window.CP.shouldStopExecution(1)){break;}
//       $('.js-songlist-holder').append('<li>' + tracks[i].title + '</li>');
//     }
// window.CP.exitedLoop(1);

//   });
// });







var config = {
  'sc' : {
    'clientID' : 'b07647ddc8d151245fe17e491af8299d'
  }
}

function initPlayer(volume) {
  var volumeHTML = '<div class="volume"><span class="volume-icon glyphicon glyphicon-volume-up"></span><div class="volume-slider-container"><input class="volume-slider" min="0" max="100" value="50" type="range"></div></div>';
  volumeElement = document.createElement("div");
  volumeElement.innerHTML = volumeHTML;
  volumeElement = volumeElement.firstChild;
  
  var volumeContainer = volumeElement.getElementsByClassName("volume-slider-container")[0];
  var volumeSlider = volumeElement.getElementsByClassName("volume-slider")[0];
  
  volumeSlider.value = volume;
  
  volumeElement.addEventListener("mouseover", function() {
    volumeContainer.style.display = "block";
  });
  volumeElement.addEventListener("mouseout", function () {
    volumeContainer.style.display = "none";
  });
  
  volumeSlider.addEventListener("input", function () {
    if (globalPlayer) {
      globalPlayer.volume = volumeSlider.value / 100;
    }
  });
  
  document.body.appendChild(volumeElement);
}

var globalPlayer;

function createPlayer(json) {

  function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    
    var interval = Math.floor(seconds / 31536000);
    
    var plural = function(amount, interval) {
      var timeString = amount + " " + interval;
      timeString += amount > 1 ? "s" : "";
      return timeString + " ago";
    }
    
    if (interval >= 1) {
      return plural(interval, "year");
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return plural(interval, "month");
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return plural(interval, "day");
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return plural(interval, "hour");
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return plural(interval, "minute");
    }
    return plural(Math.floor(seconds), "second");
  }

  var playerTemplate = '<div class="row customplayer"><div class="uploadtime">{{UPLOADTIME}}</div><div class="albumart" style="background-image:url(\'{{ALBUMART}}\');"></div><div class="player"><button type="button" class="play-button btn btn-default btn-lg"><span class="play glyphicon glyphicon-play"></span><span class="pause glyphicon glyphicon-pause" style="display: none;"></span></button><div class="metadata"><div class="artist"><a target="_blank" href="{{ARTIST_URL}}">{{ARTIST}}</a></div><div class="title"><a target="_blank" href="{{TITLE_URL}}">{{TITLE}}</a></div></div><div class="waveform" style="background-image: url(\'{{WAVEFORM}}\');"><div class="played"></div></div></div><audio class="audioplayer" src=\'{{STREAM}}\' preload="none"></audio></div>';
  
  var formatters = {UPLOADTIME : timeSince(new Date(json.created_at)),
                      ALBUMART : json.artwork_url ? json.artwork_url.replace('-large', '-t200x200')
                               : json.user.avatar_url.replace('-large', '-t200x200'),
                    ARTIST_URL : json.user.permalink_url,
                        ARTIST : json.user.username,
                     TITLE_URL : json.permalink_url,
                         TITLE : json.title,
                      WAVEFORM : json.waveform_url,
                        STREAM : json.stream_url + '?client_id=' + config.sc.clientID};
  
  Object.keys(formatters).map(function(key) {
    playerTemplate = playerTemplate.replace('{{' + key + '}}', formatters[key]);
  });
  
  var playerElement = document.createElement('div');
  playerElement.innerHTML = playerTemplate;
  playerElement = playerElement.firstChild;
  
  registerPlayer(playerElement);
  return playerElement;
  
  function registerPlayer(player) {
    var playButton = player.getElementsByClassName("play-button")[0];
    var playIcon = playButton.getElementsByClassName("play")[0];
    var pauseIcon = playButton.getElementsByClassName("pause")[0];
    var audioPlayer = player.getElementsByClassName("audioplayer")[0];
    var waveform = player.getElementsByClassName("waveform")[0];
    var progressBar = player.getElementsByClassName("played")[0];
    
    audioPlayer.addEventListener("play", function() {
      globalPlayer = audioPlayer;
      audioPlayer.volume = document.getElementsByClassName("volume-slider")[0].value / 100;
      var audioPlayers = document.getElementsByTagName("audio");
      for (var i = 0; i < audioPlayers.length; i++) {
        if (audioPlayers[i] != audioPlayer) {
          audioPlayers[i].pause();
        }
      }
      playIcon.style.display = "none";
      pauseIcon.style.display = "";
    });
    
    audioPlayer.addEventListener("pause", function() {
      pauseIcon.style.display = "none";
      playIcon.style.display = "";
    });
    
    audioPlayer.addEventListener("timeupdate", function() {
      var currentTime = audioPlayer.currentTime;
      var totalTime = audioPlayer.duration;
      progressBar.style.width = (currentTime/totalTime) * 100 + "%";
    })
    
    waveform.addEventListener("click", function(event) {
      var seekPercentage = (event.clientX-this.offsetLeft) / this.offsetWidth;
      var seekAudio = function() {
        var totalTime = audioPlayer.duration;
        progressBar.style.width = seekPercentage * 100 + "%";
        audioPlayer.currentTime = totalTime * seekPercentage;
      }
      if (audioPlayer.readyState == 0) {
        audioPlayer.addEventListener("loadedmetadata", seekAudio);
        audioPlayer.preload = "auto";
      } else {
        seekAudio();
      }
    })
    
    playButton.addEventListener("click", function() {
      var playing = !audioPlayer.paused;
      if (!playing) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function() {
  initPlayer(50);
  searchDisplay();
  
  function searchDisplay() {
    var searchDate = document.getElementById("search-date");
    var advancedSearch = document.getElementById("advanced-search");
    var advancedSearchDate = document.getElementById("advanced-search-date");
    var betweenLabel = document.getElementById("between-label");
    var endDateElement = document.getElementById("date2");
    
    if (searchDate.value == "custom")
    {
      advancedSearch.style.display = "";
      if (advancedSearchDate.value == "between") {
        betweenLabel.style.display = "";
        endDateElement.style.display = "";
      } else {
        betweenLabel.style.display = "none";
        endDateElement.style.display = "none";
      }
    } else {
      advancedSearch.style.display = "none";
    }
  };
  
  document.getElementById("search-date").addEventListener("change",function() {
    searchDisplay();
  });
  document.getElementById("advanced-search-date").addEventListener("change",function() {
    searchDisplay();
  });
  
  var next_href;
  
  var loadMore = document.getElementsByClassName("load-more")[0];
  var loadMoreBtn = document.getElementById("load-more-btn");
  
  loadMoreBtn.addEventListener("click", function() {
    loadMore.style.display = "none";
    loadResults(next_href);
  });
  
  var adding;
  
  function loadResults(href) {
    var resultElement = document.getElementById("results");
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.addEventListener("load", function() {
      var parsedJSON = JSON.parse(xmlhttp.responseText);
      
      var addPlayer = function(i) {
        if (i < parsedJSON.collection.length) {
          var playerElement = createPlayer(parsedJSON.collection[i]);
          
          resultElement.appendChild(playerElement);
          adding = window.setTimeout(function() {
            playerElement.className += " fadein";
            addPlayer(++i);
          }, 0);
        } else if (next_href) {
          loadMore.style.display = "";
        }
      }
      
      next_href = parsedJSON.next_href;
      
      addPlayer(0);
    });
    
    xmlhttp.open("GET", href, true);
    xmlhttp.send();
  }
  
  document.getElementById("searchform").addEventListener("submit", function(evt) {
    evt.preventDefault();
    
    if (adding) {
      clearTimeout(adding);
    }
    
    var resultElement = document.getElementById("results");
    while(resultElement.firstChild) {
      resultElement.removeChild(resultElement.firstChild);
    }
    
    loadMore.style.display = "none";
    
    searchValue = document.getElementById("searchbox").value;
    
    var apiURL = "https://api.soundcloud.com/tracks/";
    var parameters = {
      q: encodeURIComponent(searchValue),
      limit: 200,
      order: "created_at",
      linked_partitioning: 1,
      client_id: config.sc.clientID
    }
    
    var searchDate = document.getElementById("search-date");
    var advancedSearchDate = document.getElementById("advanced-search-date");
    var startDateElement = document.getElementById("date1");
    var endDateElement = document.getElementById("date2");
    
    var pad = function(n) {
      return n < 10 ? '0' + n : n;
    }
    
    switch (searchDate.value) {
      case 'all_time':
        parameters["created_at[from]"] = "1970-01-01 00:00:00";
        break;
      case 'custom':
        var startDate = new Date(startDateElement.getElementsByClassName('date-input-year')[0].value,
                                 startDateElement.getElementsByClassName('date-input-month')[0].value - 1,
                                 startDateElement.getElementsByClassName('date-input-day')[0].value,
                                 0, 0, 0);
        var endDate = new Date(endDateElement.getElementsByClassName('date-input-year')[0].value,
                               endDateElement.getElementsByClassName('date-input-month')[0].value - 1,
                               endDateElement.getElementsByClassName('date-input-day')[0].value,
                               0, 0, 0);
        switch(advancedSearchDate.value) {
          case 'after':
            parameters["created_at[from]"] = startDate.getFullYear() + "-" +
                                             pad(startDate.getMonth() + 1) + "-" +
                                             pad(startDate.getDate()) + " 00:00:00";
            break;
          case 'before':
            parameters["created_at[to]"] = startDate.getFullYear() + "-" +
                                           pad(startDate.getMonth() + 1) + "-" +
                                           pad(startDate.getDate()) + " 00:00:00";
            break;
          case 'between':
            parameters["created_at[from]"] = startDate.getFullYear() + "-" +
                                             pad(startDate.getMonth() + 1) + "-" +
                                             pad(startDate.getDate()) + " 00:00:00";
            parameters["created_at[to]"] = endDate.getFullYear() + "-" +
                                           pad(endDate.getMonth() + 1) + "-" +
                                           pad(endDate.getDate()) + " 00:00:00";
            break;
        }
        break;
      default:
        parameters["created_at"] = searchDate.value;
        break;
    }
    
    var URL = (function(URL, parameters){
      return URL + "?" + Object.keys(parameters).map(function(key) {
        return key+ "=" + parameters[key];
      }).join("&");
    })(apiURL, parameters);
    
    loadResults(URL);
  });
});