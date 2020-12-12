$(document).ready(function() {


    //Global Vars
    var redirection_counter = -1;
    var i = -1;
    var debug = false;
    var page = 0;
    var pos_focus = 0
    var article_array;
    var tabindex_i = -0;
    var window_status = "article-list";
    var redirections_arr = [];

    check_iconnection();


    /////////////////////////
    function finder() {

        var finder = new Applait.Finder({ type: "sdcard", debugMode: false });


        finder.on("empty", function(needle) {
            toaster("no sdcard found");
            return;
        });

        finder.search("rss-reader.json");



        finder.on("fileFound", function(file, fileinfo, storageName) {

            var reader = new FileReader()


            reader.onerror = function(event) {
                toaster('shit happens')
                reader.abort();
            };

            reader.onloadend = function(event) {

                search_result = event.target.result

                //check if json valid
                var printError = function(error, explicit) {
                    toaster("[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}");
                }

                try {

                } catch (e) {
                    if (e instanceof SyntaxError) {
                        toaster("Json file is not valid");
                        return;
                    } else {

                    }

                }
                var app_list_filter = JSON.parse(search_result);
                $.each(app_list_filter, function(i, item) {
                    rss_fetcher(item.url, item.limit, item.channel, false)



                });



            };
            reader.readAsText(file)
        });


    }


    finder()

    //////////////////////////////
    //rss-fetch////
    //////////////////////////////

    function rss_fetcher(param_url, param_limit, param_channel, param_redirect) {


        var xhttp = new XMLHttpRequest({ mozSystem: true });

        xhttp.open('GET', param_url, true)
        xhttp.withCredentials = true;
        xhttp.responseType = 'document';
        xhttp.overrideMimeType('text/xml');



        $("div#message-box").css('display', 'block')


        xhttp.onload = function() {

            if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {

                var data = xhttp.response;

                //rss atom items
                $(data).find('entry').each(function() {
                    i++
                    if (i < param_limit) {

                        var item_title = $(this).find('title').text();
                        var item_summary = $(this).find('summary').text();
                        var item_link = $(this).find('link').attr("href");
                        var item_date_unix = Date.parse($(this).find('updated').text());
                        item_date = new Date(item_date_unix)
                        item_date = item_date.toGMTString()

                        var article = $('<article data-order = "' + item_date_unix + '" data-link = "' + item_link + '"><div class="channel">' + param_channel + '</div><time>' + item_date + '</time><h1>' + item_title + '</h1><div class="summary">' + item_summary + '</div></article>')
                        $('div#news-feed-list').append(article);

                        article_array = $('div#news-feed-list article')
                    }

                })

                i = 0


                //rss 2.0 items
                $(data).find('item').each(function() {
                    i++
                    if (i < param_limit) {
                        var item_title = $(this).find('title').text();
                        var item_summary = $(this).find('description').text();
                        var item_link = $(this).find('link').text();
                        var item_date_unix = Date.parse($(this).find('pubDate').text());
                        item_date = new Date(item_date_unix)
                        item_date = item_date.toGMTString()


                        var article = $('<article data-order = "' + item_date_unix + '" data-link = "' + item_link + '"><div class="channel">' + param_channel + '</div><time>' + item_date + '</time><h1>' + item_title + '</h1><div class="summary">' + item_summary + '</div></article>')
                        $('div#news-feed-list').append(article);
                        $("div#news-feed-list article:first").focus()

                        article_array = $('div#news-feed-list article')
                    }

                });

                i = 0



            }

            if (xhttp.status === 404) {
                toaster(param_channel + "url not found");
            }

            ////Redirection
            if (xhttp.status === 301) {
                if (param_redirect != true) {
                    redirection_counter++;
                    redirections_arr[redirection_counter] = [xhttp.getResponseHeader('Location'), param_limit, param_channel];
                }

                if (param_redirect == true) {
                    getAllResponseHeaders()
                    $("div#message-box div.text-center").text("");
                    $("div#message-box").css("display", "block");
                    $("div#message-box div#redirections").css("display", "block");
                    $("div#message-box div#redirections").append("<div>" + param_channel + "</div>")

                }
            }

            if (xhttp.status === 0) {
                toaster(param_channel + " status: " + xhttp.status + xhttp.getAllResponseHeaders());
            }





        };



        xhttp.onerror = function() {
            toaster(param_channel + " status: " + xhttp.status + xhttp.getAllResponseHeaders());

        };

        xhttp.send(null)
    }




    function set_tabindex() {

        $('div#news-feed-list article').each(function(index) {

            $(this).prop("tabindex", index);
            $('div#news-feed-list article:first').focus()


        })
    }


    function sort_data() {

        var $wrapper = $('div#news-feed-list');

        $wrapper.find('article').sort(function(a, b) {
                return +b.dataset.order - +a.dataset.order;
            })
            .appendTo($wrapper);

        article_array = $('div#news-feed-list article')
        set_tabindex()
    }


    //wait till downloads are done than try redirection
    setTimeout(function() {

        if (redirections_arr.length > 0) {

            //try redirections
            for (var i = 0; i < redirections_arr.length; i++) {
                //alert(redirections_arr.length+" / "+i)
                rss_fetcher(redirections_arr[i][0], redirections_arr[i][1], redirections_arr[i][2], true);
            }

        }


        //sort content by date
        sort_data();

    }, 5000);



    //wait till downloads are done than try redirection
    setTimeout(function() {


        //sort content by date
        sort_data();
        $("div#message-box").css('display', 'none');

    }, 10000);






    var running_autoscroll = false;
    var interval = "";

    function auto_scroll(param1, param2) {

        if (window_status === "source-page" && running_autoscroll == false && param2 === "on")

        {
            running_autoscroll = true;
            lock_screen("lock");
            interval = setInterval(function() {
                window.scrollBy(0, 1);
            }, param1);
            toaster("autoscroll on");
            return;

        }

        if (running_autoscroll == true || param2 === "off") {
            clearInterval(interval);
            running_autoscroll = false;
            lock_screen("unlock");
        }



    }


    ////////////////////////
    //NAVIGATION
    /////////////////////////



    function nav(move) {

        if (window_status == "article-list") {
            var $focused = $(':focus')[0];



            if (move == "+1" && pos_focus < article_array.length - 1) {
                pos_focus++

                if (pos_focus <= article_array.length) {

                    var focusedElement = $(':focus')[0].offsetTop + 20;


                    window.scrollTo({
                        top: focusedElement,
                        left: 100,
                        behavior: 'smooth'
                    });


                    var targetElement = article_array[pos_focus];
                    targetElement.focus();


                }
            }

            if (move == "-1" && pos_focus > 0) {
                pos_focus--
                if (pos_focus >= 0) {
                    var targetElement = article_array[pos_focus];
                    targetElement.focus();
                    var focusedElement = $(':focus')[0].offsetTop;
                    window.scrollTo({ top: focusedElement + 20, behavior: 'smooth' });

                }
            }
        }

    }




    function show_article() {
        var $focused = $(':focus');
        $('article').css('display', 'none')
        $focused.css('display', 'block')
        $('div.summary').css('display', 'block')
        $('div#button-bar').css('display', 'block')
        window_status = "single-article";

    }


    function show_article_list() {
        var $focused = $(':focus');
        $('article').css('display', 'block')
        $('div.summary').css('display', 'none')
        $('div#button-bar').css('display', 'none')

        var targetElement = article_array[pos_focus];
        targetElement.focus();

        window.scrollTo(0, $(targetElement).offset().top);

        $("div#source-page").css("display", "none")
        $("div#source-page iframe").attr("src", "")
        $('div#button-bar div#button-right').css('display', 'block');
        window_status = "article-list";
        auto_scroll(30, "off");




    }




    function open_url() {
        var targetElement = article_array[pos_focus];
        var link_target = $(targetElement).data('link');

        $("div#source-page").css("display", "block")
        $("div#source-page iframe").attr("src", link_target)
        $('div#button-bar div#button-right').css('display', 'none');
        window_status = "source-page";


    }





    //////////////////////////
    ////KEYPAD TRIGGER////////////
    /////////////////////////



    function handleKeyDown(evt) {

        switch (evt.key) {


            case 'Enter':
                show_article();
                break;


            case 'ArrowDown':
                nav("+1");
                auto_scroll(30, "off");
                break;


            case 'ArrowUp':
                nav("-1");
                auto_scroll(30, "off");
                break;


            case 'SoftLeft':
                show_article_list();
                auto_scroll(30, "off");
                break;

            case 'SoftRight':
                open_url();
                break;


            case 'Backspace':
                evt.preventDefault();
                if (window_status == "article-list") { window.close() }
                show_article_list();
                break;

            case '2':
                auto_scroll(30, "on");
                break;


        }

    };



    document.addEventListener('keydown', handleKeyDown);


    //////////////////////////
    ////BUG OUTPUT////////////
    /////////////////////////

    if (debug == true) {
        $(window).on("error", function(evt) {

            console.log("jQuery error event:", evt);
            var e = evt.originalEvent; // get the javascript event
            console.log("original event:", e);
            if (e.message) {
                alert("Error:\n\t" + e.message + "\nLine:\n\t" + e.lineno + "\nFile:\n\t" + e.filename);
            } else {
                alert("Error:\n\t" + e.type + "\nElement:\n\t" + (e.srcElement || e.target));
            }
        });

    }




});