/**
 * Copyright (c) 2009 Dave Ross <dave@csixty4.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **/
 
///////////////////////
// LiveSearch
///////////////////////

var LiveSearch = {
	resultsElement : '',
	searchBoxes : '',
	activeRequests : [],
	callbacks : [],

	addCallback : function(eventName, callback) {
		if(this.callbacks[eventName] === undefined) {
			this.callbacks[eventName] = [];
		}

		return this.callbacks[eventName].push(callback);
	},

	invokeCallbacks : function(eventName, params) {
		if(this.callbacks[eventName] !== undefined) {
			for(callbackIndex in this.callbacks[eventName]) {
				params = this.callbacks[eventName][callbackIndex](params);
			}
		}
	}
};

/**
 * Initialization for the live search plugin.
 * Sets up the key handler and creates the search results list.
 */
LiveSearch.init = function() {
	
	jQuery("body").append('<ul class="search_results"></ul>');
	this.resultsElement = jQuery('ul').filter('.search_results');
	this.resultsElement.hide();
	
	// Add the keypress handler
	// Using keyup because keypress doesn't recognize the backspace key
	// and that's kind of important.
	LiveSearch.searchBoxes = jQuery("input").filter("[name='s']");
	LiveSearch.searchBoxes.keyup(LiveSearch.handleKeypress);
	LiveSearch.searchBoxes.focus(LiveSearch.hideResults);

	if(!LiveSearch.searchBoxes.outerHeight) {
		alert(DavesWordPressLiveSearchConfig.outdatedJQuery);
	}
	
	// Prevent browsers from doing autocomplete on the search field
	LiveSearch.searchBoxes.parents('form').attr('autocomplete', 'off');
	
	// Hide the search results when the search box loses focus
	jQuery("html").click(LiveSearch.hideResults);
	LiveSearch.searchBoxes.add(this.resultsElement).click(function(e) { e.stopPropagation(); });

	jQuery(window).resize(function() {
		var wasVisible = LiveSearch.resultsElement.is(':visible');
		LiveSearch.positionResults(this); 
		// Resizing the window was making the results visible again
		if(!wasVisible) {
			LiveSearch.resultsElement.hide(); 
		}
	});	
}

LiveSearch.positionResults = function() {
	
	var searchBox = jQuery('input:focus');

	// Position the ul right under the search box	
	var searchBoxPosition = searchBox.offset();
	searchBoxPosition.left += parseInt(DavesWordPressLiveSearchConfig.xOffset, 10);
	searchBoxPosition.top  += parseInt(DavesWordPressLiveSearchConfig.yOffset, 10);
	this.resultsElement.css('left', searchBoxPosition.left);
	this.resultsElement.css('top', searchBoxPosition.top);
	this.resultsElement.css('display', 'block');
	
    switch(DavesWordPressLiveSearchConfig.resultsDirection)
    {
    	case 'up':
    		var topOffset = searchBoxPosition.top - this.resultsElement.height();
    		break;
    	case 'down':
    	default:
    		var topOffset = searchBoxPosition.top + LiveSearch.searchBoxes.outerHeight();
    }
	
	this.resultsElement.css('top', topOffset + 'px');
};

/**
 * Process the search results that came back from the AJAX call
 */
LiveSearch.handleAJAXResults = function(e) {

    LiveSearch.activeRequests.pop();

    if(e) {
        resultsSearchTerm = e.searchTerms;
        if(resultsSearchTerm != LiveSearch.searchBoxes.val()) {

                if(LiveSearch.activeRequests.length == 0) {
                        LiveSearch.removeIndicator();
                }

                return;
        }

        var resultsShownFor = jQuery("ul").filter(".search_results").children("input[name=query]").val();
        if(resultsShownFor != "" && resultsSearchTerm == resultsShownFor)
        {
                if(LiveSearch.activeRequests.length == 0) {
                        LiveSearch.removeIndicator();
                }

                return;
        }

        var searchResultsList = jQuery("ul").filter(".search_results");
        searchResultsList.empty();
        searchResultsList.append('<input type="hidden" name="query" value="' + resultsSearchTerm + '" />');

        if(e.results.length == 0) {
                // Hide the search results, no results to show
                LiveSearch.hideResults();
        }
        else {
                for(var postIndex = 0; postIndex < e.results.length; postIndex++) {
                        var searchResult = e.results[postIndex];
                        if(searchResult.post_title !== undefined) {



                                var renderedResult = '';

                                // Thumbnails
                                if(DavesWordPressLiveSearchConfig.showThumbs == "true" && searchResult.attachment_thumbnail) {
                                        var liClass = "post_with_thumb";
                                }
                                else {
                                        var liClass = "";
                                }

                                renderedResult += '<li class="' + liClass + '">';

                                // Render thumbnail
                                if(DavesWordPressLiveSearchConfig.showThumbs == "true" && searchResult.attachment_thumbnail) {
                                        renderedResult += '<img src="' + searchResult.attachment_thumbnail + '" class="post_thumb" />';
                                }

                                renderedResult += '<a href="' + searchResult.permalink + '">' + searchResult.post_title + '</a>';

                                if(searchResult.post_price != undefined) { renderedResult += '<p class="price">' + searchResult.post_price + '</p>'; }
                                
                                if(DavesWordPressLiveSearchConfig.showExcerpt == "true" && searchResult.post_excerpt) {
                                        renderedResult += '<p class="excerpt clearfix">' + searchResult.post_excerpt + '</p>';
                                }

                                if(e.displayPostMeta) {
                                        renderedResult += '<p class="meta clearfix" id="daves-wordpress-live-search_author">Posted by ' + searchResult.post_author_nicename + '</p><p id="daves-wordpress-live-search_date" class="meta clearfix">' + searchResult.post_date + '</p>';
                                }
                                renderedResult += '<div class="clearfix"></div></li>';
                                searchResultsList.append(renderedResult);
                        }
                }

				if(searchResult.show_more != undefined && searchResult.show_more && DavesWordPressLiveSearchConfig.showMoreResultsLink == "true") {
	                // "more" link
	                searchResultsList.append('<div class="clearfix search_footer"><a href="' + DavesWordPressLiveSearchConfig.blogURL + '/?s=' + resultsSearchTerm + '">' + DavesWordPressLiveSearchConfig.viewMoreText + '</a></div>');
				}

                // Show the search results
                LiveSearch.showResults();

        }

        if(LiveSearch.activeRequests.length == 0) {
                LiveSearch.removeIndicator();
        }
    }
};

/**
 * Keypress handler. Sets up a 0 sec. timeout which then
 * kicks off the actual query.s
 */
LiveSearch.handleKeypress = function(e) {
	var delayTime = 0;
	var term = LiveSearch.searchBoxes.val();
	setTimeout( function() { LiveSearch.runQuery(term); }, delayTime);
};

/**
 * Do the AJAX request for search results, or hide the search results
 * if the search box is empty.
 */
LiveSearch.runQuery = function(terms) {
	var searchBox = jQuery('input:focus');
	var srch=searchBox.val();
	if(srch === "" || srch.length < DavesWordPressLiveSearchConfig.minCharsToSearch) {
		// Nothing entered. Hide the autocomplete.
		LiveSearch.hideResults();
		LiveSearch.removeIndicator();
	}
	else {
		// Do an autocomplete lookup
		LiveSearch.displayIndicator();
		
		// Clear out the old requests in the queue
		while(LiveSearch.activeRequests.length > 0)
		{
			var req = LiveSearch.activeRequests.pop();
			req.abort();
		}
		// do AJAX query
		var parameters = {s: terms};
		var searchSource = jQuery("input").filter("[name='search_source']").val();
		if(searchSource != undefined) {
		  parameters.search_source = searchSource;
		}
		var lang = jQuery("input").filter("[name='lang']").val();
		if(lang != undefined) {
		  parameters.lang = lang;
		}
        
		// For wp_ajax
		parameters.action = "dwls_search";
		
		var req = jQuery.get( DavesWordPressLiveSearchConfig.ajaxURL, parameters, LiveSearch.handleAJAXResults, "json");
		
		// Add this request to the queue
		LiveSearch.activeRequests.push(req);
	}
};

LiveSearch.hideResults = function() {
	var visibleResults = jQuery("ul").filter(".search_results:visible");
	if(visibleResults.size() > 0) {
		LiveSearch.invokeCallbacks('BeforeHideResults');
		switch(DavesWordPressLiveSearchConfig.resultsDirection)
		{
			case 'up':
				visibleResults.fadeOut();
				break;
			case 'down':
			default:
				visibleResults.slideUp();
				break;
		}
		LiveSearch.invokeCallbacks('AfterHideResults');
	}
};

LiveSearch.showResults = function() {
	var hiddenResults = jQuery("ul").filter(".search_results:hidden");
	if(hiddenResults.size() > 0) {
		LiveSearch.invokeCallbacks('BeforeShowResults');
		this.positionResults();
		switch(DavesWordPressLiveSearchConfig.resultsDirection)
		{
			case 'up':
				jQuery("ul").filter(".search_results:hidden").fadeIn();
				break;
			case 'down':
			default:
				jQuery("ul").filter(".search_results:hidden").slideDown();	
				break;
		}
		LiveSearch.invokeCallbacks('AfterShowResults');
	}
};

/**
 * Display the "spinning wheel" AJAX activity indicator
 */
LiveSearch.displayIndicator = function() {

	if(jQuery("#search_results_activity_indicator").size() === 0) {

		var searchBox = jQuery('input:focus');
		var searchBoxPosition = searchBox.offset();

		jQuery("body").append('<span id="search_results_activity_indicator"  />');

		var spinnerRadius = {outer: Math.ceil((searchBox.height() * 0.9) / 2)};
		spinnerRadius.inner = Math.floor(spinnerRadius.outer * 0.29);  // 2:7 (0.29) ratio seems ideal

		jQuery("#search_results_activity_indicator").css('position', 'absolute');
		
		var indicatorY = (searchBoxPosition.top + ((searchBox.outerHeight() - searchBox.innerHeight()) / 2) + 'px');
		
		jQuery("#search_results_activity_indicator").css('top', indicatorY);

		var indicatorX = (searchBoxPosition.left + searchBox.outerWidth() - ((spinnerRadius.outer + spinnerRadius.inner) * 2) - 2)  + 'px';
						
		jQuery("#search_results_activity_indicator").css('left', indicatorX);
		
		Spinners.create('#search_results_activity_indicator', {
			radii:     [spinnerRadius.inner, spinnerRadius.outer],
			color:     '#888888',
			dashWidth: 4,
			dashes:    8,
			opacity:   .8,
			speed:     .7
		}).play();
	}

};

/**
 * Hide the "spinning wheel" AJAX activity indicator
 */
LiveSearch.removeIndicator = function() {
	jQuery("#search_results_activity_indicator").remove();
};

///////////////////
// Initialization
///////////////////

jQuery(function() {
	LiveSearch.init();
});

