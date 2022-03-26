var time_elem;
var curr_date;
var weather_temp;
var weather_desc;
var search_bar;
var dt = new Date();
var active_search_eng = {"name":"duckduckgo","fnc":duckduckgoSearch, "elem":null};
var search_engines = []
var search_eng_btns;
var military_toggle = false;
var disc_server_id;
var discord_elem;
var discord_sid_input;
var spotify_elem;
var spot_server_id;
var spotify_pid_input;
var spotify_pl_id;
var weather_interval = setInterval(update_weather, 1000*30);
var search_icos = document.getElementsByClassName("search_ico");
var dev_console_elem;
var dev_div_elem;
var openDevConsoleBtn;


function init_page() {
    init_elem_refs();
    run_clock();
    update_weather();
    loadLaunchLinkData();
    // load_theme_values();
    // add_discord();
    // add_spotify();
}

function init_elem_refs() {
    time_elem = document.getElementById("time");
    date_elem = document.getElementById("date");
    
    weather_desc = document.getElementById("weather-desc");
    weather_temp = document.getElementById("temperature");
    
    search_bar = document.getElementById("search-bar");
    active_search_eng["elem"] = document.getElementById("default_search");
    search_eng_btns = document.getElementById('search-bar-container').getElementsByClassName('btn-check');
    search_engines = [
        {'name':'duckduckgo','fnc':duckduckgoSearch, 'elem':search_eng_btns[0]},
        {'name':'youtube','fnc':youtubeSearch, 'elem':search_eng_btns[1]},
        {'name':'netflix','fnc':netflixSearch, 'elem':search_eng_btns[2]}
    ];
    
    launchLinksContainer = document.getElementById("launchLinksContainer");
    
    dev_console_elem = document.getElementById("dev-console");
    dev_div_elem = document.getElementById("dev-div");
    openDevConsoleBtn = document.getElementById("openDevConsoleBtn")
    openDevConsoleBtn.addEventListener("click", () => {
        populate_dev_console();
        dev_div_elem.classList.toggle("visually-hidden");
    })
    
    // discord_sid_input = document.getElementsByClassName("discord settings_text_input")[0];
    // if ("disc_server_id" in cookie) {
    //     discord_sid_input.placeholder = cookie["disc_server_id"];
    // }
    // spotify_pid_input = document.getElementsByClassName("spotify settings_text_input")[0];
    // if ("spotify_pl_id" in cookie) {
    //     spotify_pid_input.placeholder = cookie["spotify_pl_id"];
    // }

    add_search_listeners();
}

var cookie_raw = document.cookie.split(';');
var cookie = {};
for (var i in cookie_raw) {
  let var_pair = cookie_raw[i].trim().split("=");
  cookie[var_pair[0]] = var_pair[1]
}

// if ("theme" in cookie) {
//     if (cookie["custom_theme"] == "true") {
//         init_theme();
//     }
// }

if ("military_toggle" in cookie) {
    military_toggle = cookie["military_toggle"];
}

// if ("disc_server_id" in cookie) {
//     disc_server_id = cookie["disc_server_id"];
// }

// if ("spotify_pl_id" in cookie) {
//     spotify_pl_id = cookie["spotify_pl_id"];
// }

function toggle_military_time() {
    if ("military_toggle" in cookie) {
        delete_cookie("military_toggle");
    } else {
        document.cookie = "military_toggle=true; SameSite=Strict; Secure";
    }

    military_toggle = !military_toggle;
    run_clock();
    // settings_changed_popup();
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
    settings_changed_popup();

}

function change_spotify_playlist() {
    if (spotify_elem == null) {
        console.error("Spotify element not yet loaded. Adding new element.");
    } else {
        spotify_elem.parentElement.removeChild(spotify_elem);
    }

    document.cookie = "spotify_pl_id=" + spotify_pid_input.value + "; SameSite=Strict;";
    spotify_pl_id = spotify_pid_input.value;
    cookie["spotify_pl_id"] = spotify_pl_id;

    add_spotify();
    settings_changed_popup();

}

function run_clock() {
    let curr_date = dt.toDateString();
    let curr_time = dt.toLocaleTimeString('en-US', { hour12: military_toggle });

    if (curr_date != date_elem.innerHTML) {
        date_elem.innerHTML = curr_date;
    }
    let meridianStr = curr_time.slice(curr_time.length - 3, curr_time.length)
    time_elem.innerHTML = curr_time.slice(0, curr_time.length - 3) + `<span class="meridianStr">${meridianStr}</span>`;

    dt = new Date();
}
setInterval(run_clock, 1000);

function _capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function set_city_id(strCityId) {
    localStorage.setItem('city_id', strCityId);
}

function set_weather_key(strValue) {
    localStorage.setItem("weather_key", strValue);
    update_weather(force=true);
    weather_interval = setInterval(update_weather, 1000*30);

    settings_changed_popup();
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
            
            cookie["last_weather_temp"] = temp.toString();
            cookie["last_weather_text"] = weather_text;
            document.cookie = "last_weather_temp=" + temp.toString() + '; SameSite=Strict;';
            document.cookie = "last_weather_text=" + weather_text + '; SameSite=Strict;';
        })
        .catch((err) => {
            // Do something for an error here
            console.error("Unable to fetch weather; city_id or weather_key is invalid.");
            clearInterval(weather_interval);
            cookie["last_weather_temp"] = "Temp";
            cookie["last_weather_text"] = "Weather description";
            document.cookie = "last_weather_temp=Temp" + '; SameSite=Strict;';
            document.cookie = "last_weather_text=Weather description" + '; SameSite=Strict;';
        })
}

function update_weather(force=false) {
    if (!("city_id" in localStorage) && ("weather_key" in localStorage)) {
        console.log("city_id and weather_key not found in localStorage, unable to update weather.");
        return
    }

    if ((dt.getTime() - Number(cookie["last_weather_update"]) < (30*1000)) && !force) {
        console.info("Weather has been updated within the last 30 seconds, no need to re-update");
    } else {
        fetch_weather();
    }
    document.cookie = "last_weather_update=" + dt.getTime() + '; SameSite=Strict;'

    weather_temp.innerHTML = cookie["last_weather_temp"];
    weather_desc.innerHTML = cookie["last_weather_text"];
}

function change_search_engine(sengine) {
    active_search_eng = sengine;
    search_bar.placeholder = "Search " + sengine["name"] + " or paste a link";
    sengine["elem"].click();
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

function add_search_listeners() {
    search_bar.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            check_search(search_bar.value);
        }
        let input_val = event.originalTarget.value;
        if (input_val.length == 4 && input_val.slice(0, 1) == '.') {
            search_engine_shortcut(input_val.slice(1, 4));
        }
    });
}

function search_engine_shortcut(shortcut_key) {
    switch (shortcut_key) {
        case 'dd ':
            // Switch active search engine to duckduckgo
            change_search_engine(search_engines[0]);
            break;
        case 'yt ':
            // Switch active search engine to youtube
            change_search_engine(search_engines[1]);
            break;
        case 'nf ':
            // Switch active search engine to netflix
            change_search_engine(search_engines[2]);
            break;

        default:
            return
    }
    search_bar.value = '';
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

    // settings_changed_popup();
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

    settings_changed_popup();
}

function settings_changed_popup() {
  let popup = document.getElementById("settings_changed");

  // run the animation only if it is not already running
  if (!popup.classList.contains("popup_animation")) {
    popup.classList.add("popup_animation");
    setTimeout(function () {
      popup.classList.remove("popup_animation");
    }, 2000);
  }
}

// function add_discord() {
//     let disc_elem = document.createElement("iframe");
//     disc_elem.src="https://discord.com/widget?id=" + disc_server_id + "&theme=dark";
//     disc_elem.width="350";
//     disc_elem.height="500";
//     disc_elem.allowtransparency="true";
//     disc_elem.frameborder="0";
//     disc_elem.sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts";

//     discord_sid_input.placeholder = disc_server_id;

//     let page_2 = document.getElementsByClassName("page_2")[0];

//     page_2.appendChild(disc_elem);
//     discord_elem = disc_elem;
// }

// function add_spotify() {
//     let spot_elem = document.createElement("iframe");
//     spot_elem.src="https://open.spotify.com/embed/playlist/" + spotify_pl_id;
//     spot_elem.allowtransparency="true";
//     spot_elem.frameborder="0";
//     spot_elem.allow="encrypted-media";

//     spotify_pid_input.placeholder = spotify_pl_id;

//     let page_4 = document.getElementsByClassName("page_4")[0];

//     page_4.appendChild(spot_elem);
//     spotify_elem = spot_elem;
// }

// Doesn't work to my knowledge
// function add_calendar() {
//     let cal_elem = document.createElement("iframe");
//     cal_elem.src="https://calendar.google.com/calendar/embed?height=500&amp;wkst=1&amp;bgcolor=%23202225&amp;ctz=America%2FLos_Angeles&amp;src=Y29kZW5AdWNzZC5lZHU&amp;src=dWNzZC5lZHVfc2E0MWNlNXU3ZGFiamp2aGg3azlmdXBwN3NAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;src=dWNzZC5lZHVfY2g4bG9yaW80bjBubXQ1YTZ0OXBnbDBqazBAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;src=YWRkcmVzc2Jvb2sjY29udGFjdHNAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&amp;src=dWNzZC5lZHVfcDJyMHFwdjRhcXFyc2Q3aXR2OGFzaW1hbnNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;src=dWNzZC5lZHVfMWo3dmx1cnQwbmMwZDhsZGVsdmQxZ2NqbjhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;src=dWNzZC5lZHVfZ2FrMHJuMG84czFwdG1pZXV0ZHQzajR2cmdAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;src=dWNzZC5lZHVfZnVwZnZodDRrY2NkbGY1cGVrMWRwMzdxNm9AZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;src=dWNzZC5lZHVfZ2RwZjBmcTdoNzZnYTM3OGdkYmVxdjk2YXNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;src=dWNzZC5lZHVfdGJ0dHRoOG5hMDg1cG5ybHF2M3J2YXVnODRAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;src=ZW5nLnVjc2QuZWR1XzlzYThzMHZvY2duMGptZG50amk2aGlpN2VnQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&amp;color=%23039BE5&amp;color=%239E69AF&amp;color=%23616161&amp;color=%2333B679&amp;color=%23cc00c9&amp;color=%23F09300&amp;color=%230B8043&amp;color=%237CB342&amp;color=%23D50000&amp;color=%2300ccc6&amp;color=%23E4C441&amp;showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;mode=AGENDA&amp;showTz=0&amp;showCalendars=1&amp;showTabs=0";
//     cal_elem.width="320";
//     cal_elem.height="500";
//     cal_elem.frameborder="0";
//     cal_elem.scrolling="no";
//     document.body.appendChild(cal_elem);
// }

function populate_dev_console() {
    dev_console_elem.innerHTML = "";

    var header_elem = document.createElement('h5');
    header_elem.innerHTML = "localStorage";
    dev_console_elem.appendChild(document.createElement('hr'));
    dev_console_elem.appendChild(header_elem);
    dev_console_elem.appendChild(document.createElement('hr'));
    
    for (const key in localStorage) {
        if (Object.hasOwnProperty.call(localStorage, key)) {
            const value = localStorage[key];
            
            var elem = document.createElement('p');
            elem.className = "p-0 m-0";
            elem.innerHTML = "<b>" + key + "</b>" + ": " + value;
            
            dev_console_elem.appendChild(elem)
        }
    }

    header_elem = document.createElement('h5');
    header_elem.innerHTML = "cookie";
    dev_console_elem.appendChild(document.createElement('hr'));
    dev_console_elem.appendChild(header_elem);
    dev_console_elem.appendChild(document.createElement('hr'));
    for (const key in cookie) {
        if (Object.hasOwnProperty.call(cookie, key)) {
            const value = cookie[key];
            
            var elem = document.createElement('p');
            elem.className = "p-0 m-0";
            elem.innerHTML = "<b>" + key + "</b>" + ": " + value;
            
            dev_console_elem.appendChild(elem)
        }
    }
}

console.log("Config loaded");
