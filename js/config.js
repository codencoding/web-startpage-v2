var time_elem;
var curr_date;
var weather_temp;
var weather_desc;
var search_bar;
var dt = new Date();
var active_search_eng = {"name":"duckduckgo","fnc":duckduckgoSearch, "elem":null};
var active_tab = {"num":1, "elem":null};
var military_toggle = false;
var disc_server_id;
var discord_elem;
var discord_sid_input;
var spot_server_id;
var spotify_pid_input;
var spotify_pl_id;


function init_page() {
    init_elem_refs();
    run_clock();
    update_weather();
    load_theme_values();
    add_discord();
    add_spotify();
}

function init_elem_refs() {
    time_elem = document.getElementById("time");
    date_elem = document.getElementById("date");
    weather_desc = document.getElementById("weather_desc");
    weather_temp = document.getElementById("temperature");
    search_bar = document.getElementById("search_bar");
    active_search_eng["elem"] = document.getElementById("default_search");
    active_tab["elem"] = document.getElementById("default_tab");
    discord_sid_input = document.getElementsByClassName("discord settings_text_input")[0];
    if ("disc_server_id" in cookie) {
        discord_sid_input.placeholder = cookie["disc_server_id"];
    }
    spotify_pid_input = document.getElementsByClassName("spotify settings_text_input")[0];
    if ("sptfy_pl_id" in cookie) {
        spotify_pid_input.placeholder = cookie["sptfy_pl_id"];
    }

    listen_for_search();
}

var cookie_raw = document.cookie.split(';');
var cookie = {};
for (var i in cookie_raw) {
  let var_pair = cookie_raw[i].trim().split("=");
  cookie[var_pair[0]] = var_pair[1]
}

function init_theme() {
    let var_tup;

    for (elem of cookie["theme"].split(',')) {
        var_tup = elem.split(':');
        set_variable(var_tup[0], var_tup[1]);
    }
}

if ("theme" in cookie) {
    if (cookie["custom_theme"] == "true") {
        init_theme();
    }
}


if ("military_toggle" in cookie) {
    military_toggle = cookie["military_toggle"];
}

if ("disc_server_id" in cookie) {
    disc_server_id = cookie["disc_server_id"];
}

if ("sptfy_pl_id" in cookie) {
    sptfy_pl_id = cookie["sptfy_pl_id"];
}

function toggle_military_time() {
    if ("military_toggle" in cookie) {
        delete_cookie("military_toggle");
    } else {
        document.cookie = "military_toggle=true; SameSite=Strict;";
    }

    military_toggle = !military_toggle;
    run_clock();
}

function change_discord_src() {
    if (discord_elem == null) {
        console.error("Discord element not yet loaded. Adding new element.");
    } else {
        discord_elem.parentElement.removeChild(discord_elem);
    }

    document.cookie = "disc_server_id=" + discord_sid_input.value + "; SameSite=Strict;";
    disc_server_id = discord_sid_input.value;
    cookie["disc_server_id"] = disc_server_id;

    add_discord();
}

function change_spotify_playlist() {
    if (spotify_elem == null) {
        console.error("Spotify element not yet loaded. Adding new element.");
    } else {
        spotify_elem.parentElement.removeChild(spotify_elem);
    }

    document.cookie = "sptfy_pl_id=" + spotify_pid_input.value + "; SameSite=Strict;";
    spotify_pl_id = spotify_pid_input.value;
    cookie["sptfy_pl_id"] = spotify_pl_id;

    add_spotify();
}

function run_clock() {
    let curr_date = dt.toDateString();
    let curr_time = dt.toLocaleTimeString('en-US', { hour12: military_toggle });

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

function fetch_weather() {
    let key = localStorage.getItem("weather_key");
    let city_id = localStorage.getItem("city_id");
    let temp;
    let weather_text;
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?id=${city_id}&appid=${key}`)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            // Find a way to have option for either Celcius or Fahrenheit conversion
            temp = Math.round(((data["main"]["temp"]-273.15)*1.8)+32) + "°F";
            weather_text = _capitalizeFirstLetter(data["weather"]["0"]["description"]);
            
            document.cookie = "last_weather_temp=" + temp.toString() + '; SameSite=Strict;';
            document.cookie = "last_weather_text=" + weather_text + '; SameSite=Strict;';
        })
        .catch((err) => {
            // Do something for an error here
        })
}

function update_weather() {
    if (dt.getTime() - Number(cookie["last_weather_update"]) < (30*1000)) {
        console.info("Weather has been updated within the last 30 seconds, no need to re-update");
    } else {
        fetch_weather();
        document.cookie = "last_weather_update=" + dt.getTime() + '; SameSite=Strict;'
    }
    
    if (!("city_id" in localStorage) && ("weather_key" in localStorage)) {
        console.log("city_id and weather_key not found in localStorage, unable to update weather.");
        return
    }

    weather_temp.innerHTML = cookie["last_weather_temp"];
    weather_desc.innerHTML = cookie["last_weather_text"];
}

setInterval(update_weather, 1000*30);

function change_search_engine(sengine) {
    active_search_eng["elem"].classList.toggle("ico_active");
    
    active_search_eng = sengine;
    search_bar.placeholder = "Search " + sengine["name"] + " or paste a link";
    sengine["elem"].classList.toggle("ico_active");
}

function change_active_tab(tab) {
    if (active_tab["elem"] != null) {
        // Toggle last active tab
        active_tab["elem"].classList.toggle("circle_active");
        toggle_tab(active_tab["num"]);
    }
    
    if (tab["num"] == active_tab["num"]) {
        // If toggling the same tab, keep it turned off and mark that no tab is active
        active_tab = {"num":-1, "elem":null};
    } else {
        // Set new active tab and toggle everything for it
        active_tab = tab;
        tab["elem"].classList.toggle("circle_active");
        toggle_tab(tab["num"]);
    }
}

function toggle_tab(num) {
    let page;
    if (num == 999) {
        page = "settings_page";
    } else {
        page = "page_" + num.toString();
    }

    for (elem of document.getElementsByClassName(page)) {
        elem.hidden = !elem.hidden;
    }
}

function duckduckgoSearch(search_input) {
    window.location.href = "https://duckduckgo.com/?q=" + search_input + "&ia=web";
}

function youtubeSearch(search_input) {
    window.location.href = "https://www.youtube.com/results?search_query=" + search_input;
}

function netflixSearch(search_input) {
    window.location.href = "https://www.netflix.com/search?q=" + search_input;
}


function check_search(search_input) {
    if (search_input.includes('.') && !search_input.includes(' ')) {
        if (search_input.includes('http')) {
            window.location.href = search_input;
        } else {
            window.location.href = "https://" + search_input;
        }
    } else {
        active_search_eng["fnc"](search_input);
    }
}

function listen_for_search() {
    search_bar.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            check_search(search_bar.value);
        }
    }); 
}

function hyperlink(link) {
    window.location.href = link;
}

function load_theme_values() {
    let var_name;
    let var_val;
    let doc_style = getComputedStyle(document.documentElement);

    let input_elems = document.getElementsByClassName("color_input");
    for (elem of input_elems) {
        var_name = "--" + elem.parentElement.innerHTML.split(':')[0];
        var_val = doc_style.getPropertyValue(var_name);
        elem.value = var_val;
    }
}

function set_theme_color(input_elem) {
    let var_name = "--" + input_elem.parentElement.innerHTML.split(":")[0];
    let color = input_elem.value;

    set_variable(var_name, color);
}

function save_theme_colors(custom_theme) {
    let color_inputs = document.getElementsByClassName("color_input");
    let var_name;
    let color_val;
    let themes = "";

    for (elem of color_inputs) {
        var_name = "--" + elem.parentElement.innerHTML.split(':')[0];
        color_val = elem.value;
        if (elem == color_inputs[color_inputs.length - 1]) {
            themes += var_name + ':' + color_val;
        } else {
            themes += var_name + ':' + color_val + ',';
        }
    }

    document.cookie = "theme=" + themes + '; SameSite=Strict;';
    if (custom_theme) {
        document.cookie = "custom_theme=true" + '; SameSite=Strict;';
    } else {
        document.cookie = "custom_theme=false" + '; SameSite=Strict;';        
    }
}

function set_default_theme() {
    let default_colors = {
        "--bg_color":"#23313a",
        "--primary_color":"#23313a",
        "--secondary_color":"#212325",
        "--tertiary_color":"#da4242",
        "--text_color":"#ffffff"
    }

    for (var_name in default_colors) {
        set_variable(var_name, default_colors[var_name]);
    }

    load_theme_values();

    save_theme_colors(false);
}

function set_variable(var_name, value) {
    let root = document.documentElement;
    
    root.style.setProperty(var_name, value);
  }

function add_discord() {
    let disc_elem = document.createElement("iframe");
    disc_elem.src="https://discord.com/widget?id=" + disc_server_id + "&theme=dark";
    disc_elem.width="350";
    disc_elem.height="500";
    disc_elem.allowtransparency="true";
    disc_elem.frameborder="0";
    disc_elem.sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts";

    discord_sid_input.placeholder = disc_server_id;

    let page_2 = document.getElementsByClassName("page_2")[0];

    page_2.appendChild(disc_elem);
    discord_elem = disc_elem;
}

function add_spotify() {
    let spot_elem = document.createElement("iframe");
    spot_elem.src="https://open.spotify.com/embed/playlist/" + sptfy_pl_id;
    spot_elem.allowtransparency="true";
    spot_elem.frameborder="0";
    spot_elem.allow="encrypted-media";

    spotify_pid_input.placeholder = sptfy_pl_id;

    let page_4 = document.getElementsByClassName("page_4")[0];

    page_4.appendChild(spot_elem);
    spotify_elem = spot_elem;
}

console.log("Config loaded");
