$(document).ready(function() {

    /*****************************************
    BEGIN Juke.JS 
    ******************************************/

    var api_key = "690e1ed3bc00bc91804cd8f7fe5ed6d4"; // Last.fm API key
    var header = 0; // Need to sort the header out first and clean up all SASS
    var animate; // So it's in scope for on click function
    $jukes = $('.juke');
    if ($jukes.length == 1) {
        renderJuke(0);
    } else {
        for (var i = 0; i < $jukes.length; i++) {
            setTimeout(renderJuke(i), 1000);
        }
    }

    function renderJuke(id) {
        $jukebox = $jukes.eq(id);

        var user = $jukebox.attr("juke-user").replace(/[\., '-\/#!$%\^&\*;:{}=\-_`~()]/g, "") || "AGoodge"; // User to search by (if necessary)
        console.log(user);
        var method = $jukebox.attr("juke-method") || "user.getrecenttracks"; // Method, list of methods available here: http://www.last.fm/api
        var limit = $jukebox.attr("juke-limit") || 18; // The number of results to return (by default, the height of the player is restricted to a multiple of the height of one track)
        animate = 1; // Bool, set to 0 to disable the animation of the disks
        var tracksInView = $jukebox.attr("juke-rows") || 6;
        var img_size = 2; /* Small (34x34) = 0, Medium (64x64) = 1, Large (126x126) = 2, Extra large (300x300) = 3. I'm using 126x126 by default, because the disks are 64px (roughly retina) */
        var player;
        var params = "",
            nodeSet = 1;
        var tree;
        var artist = $jukebox.attr("juke-artist") || "Britney Spears";
        params = "&user=" + user;
        var lfmQuery = "http://ws.audioscrobbler.com/2.0/?method=" + method + params + "&api_key=" + api_key + "&limit=" + limit + "&format=json";
        $jukebox.height(tracksInView * 80);
        try {
            $.getJSON(lfmQuery, function(lfm_result) {

                if (method.indexOf('getrecenttracks') != -1) {
                    tree = lfm_result.recenttracks.track;
                    nodeSet = 1;
                }

                if (method.indexOf('gettoptracks') != -1) {
                    tree = lfm_result.toptracks.track;
                    nodeSet = 2;
                }

                $.each(tree, function(i, item) {
                    var spotifyQuery = "http://ws.spotify.com/search/1/track.json?q=";
                    var track_name = item.name.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ""),
                        artist_name,
                        album_name;
                    spotifyQuery += track_name;
                    if (nodeSet == 1) {
                        artist_name = item.artist["#text"];
                        album_name = item.album["#text"];
                        spotifyQuery += " " + artist_name + " " + album_name;
                    }
                    if (nodeSet == 2) {
                        artist_name = item.artist.name;
                        spotifyQuery += " " + artist_name;
                        album_name = "N/A"
                    }
                    $.getJSON(spotifyQuery, function(spotify_result) {
                        if (typeof spotify_result.tracks[0] === "undefined") {
                            // For some reason the track wasn't found, output nothing and move to next
                        } else {
                            var img = item.image[img_size]['#text'] || 'http://atomlab.co.uk/images/uploads/develop.png'; // If there's no correct-sized image from Last.fm use the default (feel free to change it)
                            player = '<iframe class="music_player span_18" src="https://embed.spotify.com/?uri=' + spotify_result.tracks[0]['href'] +
                                '" height="100px" frameborder="0" allowtransparency="true"></iframe></div>';
                            $jukes.eq(id).append('<div class="track spotipause span_24"><div class="art track_info" title="Album artwork"><img class="album_art" src="' + img + '" /></div><div class="track_info" title="' + track_name +
                                '"><p class="track_name">' + track_name +
                                '</p></div><div class="track_info" title="' + artist_name +
                                '"><p class="artist_name">' + artist_name +
                                '</p></div><div class="track_info" title="' + album_name +
                                '"><p class="album_name">' + album_name +
                                '</p></div>' + player);
                            console.log(track_name + ' loaded.');
                        }

                    });
                });

            });
        } catch (err) {}

    };
    $(document).on("click", ".track", function() {

        var multiple = 1000;
        $track = $(this);
        $track.toggleClass('spotiplay spotipause');
        if ($track.hasClass('spotiplay')) {
            // Animate 'disc'
            if (animate === 1) {
                $track.find('img').velocity({
                  translateZ:0,
                    rotateZ: [360 * multiple, 0]
                }, {
                    easing: "linear",
                    duration: 1500 * multiple,
                  mobileHA: true
                });
            }

            // Show player
            $track.find('.music_player').velocity({
                translateY: ["-80px", 0]
            }, {
                duration: 250,
                easing: "cubic-bezier(.04,.8,.23,.69)"
            });
        } else {
            $track.find('img').velocity("stop");
            $track.find('.music_player').velocity("reverse");
            $track.find('img').velocity({
                rotateZ: 0
            }, {
                easing: "spring",
                duration: 500
            });
        }

    });

    if (header === 1) {
        $('.juke-header').show();
    }

    /*****************************************
    END Juke.JS 
    ******************************************/

});