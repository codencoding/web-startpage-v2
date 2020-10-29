var time_elem;
var curr_date;
var weather_temp;
var weather_desc;
var search_bar;
var dt = new Date();
var active_search_eng = {"name":"duckduckgo","fnc":duckduckgoSearch};

function init_elem_refs() {
    time_elem = document.getElementById("time");
    date_elem = document.getElementById("date");
    weather_desc = document.getElementById("weather_desc");
    weather_temp = document.getElementById("temperature");
    search_bar = document.getElementById("search_bar");
}

var cookie_raw = document.cookie.split(';');
var cookie = {};
for (var i in cookie_raw) {
  let var_pair = cookie_raw[i].trim().split("=");
  cookie[var_pair[0]] = var_pair[1]
}


function run_clock() {
    let curr_date = dt.toDateString();
    let curr_time = dt.toLocaleTimeString();

    if (curr_date != date_elem.innerHTML) {
        date_elem.innerHTML = curr_date;
    }
    time_elem.innerHTML = curr_time;

    dt = new Date();
}

function run_weather_desc() {
    weather_desc.classList.toggle("paused");
    weather_desc.classList.toggle("running");
}

setInterval(run_clock, 1000);

function _capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateWeather(update) {
    if (update) {
        document.cookie = "last_weather_update=" + dt.getTime() + ';'
    }

    let key = localStorage.getItem("weather_key");
    let city_id = localStorage.getItem("city_id");
    fetch(`https://api.openweathermap.org/data/2.5/weather?id=${city_id}&appid=${key}`)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            // Work with JSON data here
            let city_name = data["name"];
            // Find a way to have option for either Celcius or Fahrenheit conversion
            let temp = Math.round(((data["main"]["temp"]-273.15)*1.8)+32) + "°F";
            let weather_text = _capitalizeFirstLetter(data["weather"]["0"]["description"]);
            
            weather_temp.innerHTML = temp;
            weather_desc.innerHTML = weather_text;

            localStorage.setItem("city_name", city_name);
        })
        .catch((err) => {
            // Do something for an error here
        })
}

if (("city_id" in localStorage) && ("weather_key" in localStorage)) {
    // If time since last weather update > 30 seconds, update weather
    if (dt.getTime() - Number(cookie["last_weather_update"]) > (30*1000)) {
        updateWeather(true);
    } else {
        updateWeather(false);
        console.info("Weather has been updated within the last 30 seconds, no need to re-update");
    }
    // Auto-update weather every 10 minutes.
    setInterval(updateWeather, 600000);
}

function change_search_engine(sengine) {
    active_search_eng = sengine;
    search_bar.placeholder = "Search " + sengine["name"];
}

function duckduckgoSearch(search_input) {
    window.location.href = "https://duckduckgo.com/?q=" + search_input + "&ia=web";
}

function youtubeSearch(search_input) {
    window.location.href = "https://www.youtube.com/results?search_query=" + search_input;
}

function search(search_input) {
    active_search_eng["fnc"](search_input)
}

function listen_for_search() {
    search_bar.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            search(search_bar.value);
        }
    }); 
}

console.log("Config loaded");