const client_id = localStorage.getItem('twitch-client_id');
const client_secret = localStorage.getItem('twitch-client_secret');
// const redirect_uri = "https://" + window.location.hostname + window.location.pathname;
const redirect_uri = "https://codencoding.github.io/web-startpage-v2/";
const user_id = localStorage.getItem('twitch-my_user_id');
var access_token = localStorage.getItem('twitch-access_token');
var twitchTabBtn = document.getElementById('tab-twitch-control');
var twitchStreamerLst = document.getElementById('twitch-streamer-lst');

twitchTabBtn.addEventListener("click", () => {
    let twitch_streamer_data = get_twitch_streamer_statuses(access_token, client_id, user_id)["data"];
    // Sorting by viewer count
    twitch_streamer_data.sort((a, b) => {
        return a.viewer_count < b.viewer_count;
    })

    fetch_streamer_avatars(twitch_streamer_data);

    populate_twitch_streamers(twitch_streamer_data);
})

var authTwitchBtn;
authTwitchBtn = document.getElementById('authTwitchBtn');
authTwitchBtn.addEventListener("click", () => {  
    twitch_auth();
})

// If there's a "code=" parameter in the URL, assume that the code parameter
// is from after the twitch authentication redirect
const auth_code = fetch_param('code');
if(auth_code) {    
    fetch_twitch_access_token(auth_code);
}

/***
 * Send out an empty HTTP POST request
 * @param {String} theUrl   The URL to send the POST request to
 * @return {String}         The response text received from the POST request
 */
function httpPost(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("POST", theUrl, false); 
  
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

/***
 * Send out an HTTP GET request, potentially with header arguments
 * @param {String} theUrl       The URL to send the GET request to
 * @param {Object} headerArgs   An object containing HTTP request header key-value pairs
 * @return {String}             The response text received from the POST request
 */
function httpGet(theUrl, headerArgs=null) {
    let xmlHttpReq = new XMLHttpRequest();
      xmlHttpReq.open("GET", theUrl, false); 
  
      if(headerArgs != null) {
          for (const key in headerArgs) {
              if (Object.hasOwnProperty.call(headerArgs, key)) {
                  const value = headerArgs[key];
                  xmlHttpReq.setRequestHeader(key, value);
              }
          }
      }
    
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

/***
 * Check the window URL and retrieve a parameter value if it's present
 * @param {String} param_name   The name of the parameter to be retrieved
 * @return {String}             The value of the param_name parameter from the URL
 */
function fetch_param(param_name) {
    const params = new URLSearchParams(window.location.search);

    if(params.has(param_name)) {
        return params.get(param_name);
    }
}

/***
 * Redirect the user to a twitch authentication page for streamer follower read permissions
 */
function twitch_auth() {
    // Step 1: First use this link to get client authorization to access their account
    const auth_link = `https://id.twitch.tv/oauth2/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=user:read:follows`;
    window.location.assign(auth_link);
}

/***
 * Check the window URL and retrieve a parameter value if it's present
 * @param {String} auth_code   The authorization code required to get an access token
 */
function fetch_twitch_access_token(auth_code) {
    // Step 2: Then fill in the authorization code returned from the previous redirect page to the below url
    // This will give us the link we can submit a POST request to to get an access token
    const token_link = `https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&code=${auth_code}&grant_type=authorization_code&redirect_uri=${redirect_uri}`;

    // Step 3: Use the httpPost method with the token_link to get a JSON-encoded access token
    // This POST request returns {"access_token":"f1yzu6dvanxtrhxvy8t4fs00onc3gl","expires_in":14886,"refresh_token":"u5vjt5fo8nis59z2bija1jptex1yszdtex9lbq2fso2azvon4t","scope":["user:read:follows"],"token_type":"bearer"}
    const access_token_JSON = JSON.parse(httpPost(token_link));
    access_token = access_token_JSON['access_token'];

    // Store the token into localStorage
    localStorage.setItem('twitch-access_token', access_token);
}

/***
 * For a twitch user, retrieve the streamers they follow that are currently live
 * @param {String} access_token     Client-specific access token that gives permission to get their followed streamers
 * @param {String} client_id        The id of the twitch application
 * @param {String} user_id          The id of the twitch user
 * @return {Object}                 An object containing data on live streamers that the client follows
 */
function get_twitch_streamer_statuses(access_token, client_id, user_id) {
    // Step 4: Plug in the access token to the below GET request to access the final endpoint
    // This should return a JSON data structure containing currently live streamers for the
    // given user
    var headerArgs = {
        'Authorization':`Bearer ${access_token}`,
        'Client-Id':`${client_id}`
    }
    var live_streamer_lst = JSON.parse(httpGet(`https://api.twitch.tv/helix/streams/followed?user_id=${user_id}`, headerArgs));

    return live_streamer_lst;
}

/***
 * Populate the streamer data with an additional profile image url field
 * @param {Object} data     An object containing twitch streamer data
 */
function fetch_streamer_avatars(data) {
    // Instantiate string of streamer usernames for query purposes
    let streamer_names_query = "";
    
    // Create query string from all live twitch streamers
    data.forEach(streamer_obj => {
        streamer_names_query += "login=" + streamer_obj["user_login"] + '&';
    });
    streamer_names_query = streamer_names_query.slice(0, streamer_names_query.length-1);

    var headerArgs = {
        'Authorization':`Bearer ${access_token}`,
        'Client-Id':`${client_id}`
    }
    var streamer_data_lst = JSON.parse(httpGet(`https://api.twitch.tv/helix/users?${streamer_names_query}`, headerArgs))["data"];
    
    streamer_join_obj = {};
    streamer_data_lst.forEach(avatar_obj => {
        streamer_join_obj[avatar_obj["id"]] = avatar_obj;
    });

    data.forEach(streamer_obj => {
        streamer_obj["profile_picture"] = streamer_join_obj[streamer_obj["user_id"]]["profile_image_url"];
    });
}

// function get_game_data(access_token, client_id, game_id_lst) {
//     var headerArgs = {
//         'Authorization':`Bearer ${access_token}`,
//         'Client-Id':`${client_id}`
//     }

//     var game_lst_str = 'id=';
//     game_id_lst.forEach(game_id => {
//         game_lst_str += game_id + ',';
//     });
//     game_lst_str = game_lst_str.slice(0, game_lst_str.length-1);

//     var game_data_lst = JSON.parse(httpGet(`https://api.twitch.tv/helix/games?${game_lst_str}`, headerArgs));

//     return game_data_lst;
// }

/***
 * Populate the streamer list in the Twitch tab
 * @param {Object} data     An object containing twitch streamer data
 */
function populate_twitch_streamers(data) {
    twitchStreamerLst.innerHTML = "";
    data.forEach(streamer_obj => {
        let streamer_card_elem = create_twitch_elem(streamer_obj);

        twitchStreamerLst.appendChild(streamer_card_elem);
    });
}

/***
 * Create a list element with a streamer's data
 * @param {Object} access_token     An object containing data on a live streamer
 * @return {Object}                 An HTML element populated with a twitch streamer's data
 */
function create_twitch_elem(streamer_data) {
    let card_elem = document.createElement('a');
    card_elem.href = "https://www.twitch.tv/" + streamer_data["user_name"];;
    card_elem.classList = "list-group-item text-light ps-2 streamer-card"

    let container_div = document.createElement('div');
    container_div.classList = "d-flex w-100 justify-content-start";
    card_elem.appendChild(container_div);

    let streamer_profile_pic = document.createElement('img');
    streamer_profile_pic.src = streamer_data["profile_picture"];
    streamer_profile_pic.classList = "rounded-circle m-0 p-0"
    streamer_profile_pic.alt = "No Profile Pic :(";
    streamer_profile_pic.width = 60;
    streamer_profile_pic.height = 60;
    container_div.appendChild(streamer_profile_pic);

    let data_div = document.createElement('div');
    data_div.classList = "ms-2 w-100 my-auto";
    container_div.appendChild(data_div);

    let streamer_info_div = document.createElement('div');
    streamer_info_div.classList = "d-flex w-100 justify-content-between py-auto";
    data_div.appendChild(streamer_info_div);

    let streamer_name_header = document.createElement('h5');
    streamer_name_header.classList = "mb-1";
    streamer_name_header.innerText = streamer_data["user_name"];
    streamer_info_div.appendChild(streamer_name_header);
    
    let stream_duration_metric = document.createElement('small');
    stream_duration_metric.innerText = "Viewers: " + streamer_data.viewer_count;
    streamer_info_div.appendChild(stream_duration_metric);

    let game_str_info = document.createElement('p');
    game_str_info.classList = "mb-0";
    game_str_info.innerText = "Streaming: " + streamer_data["game_name"];
    data_div.appendChild(game_str_info);

    return card_elem;
}
