<?php 
# @*************************************************************************@
# @ Software author: JOOJ Team (JOOJ.us)                           @
# @ Author_url 1: https://jooj.us                       @
# @ Author_url 2: http://jooj.us/twitter-clone                      @
# @ Author E-mail: sales@jooj.us                                    @
# @*************************************************************************@
# @ JOOJ Talk - The Ultimate Modern Social Media Sharing Platform           @
# @ Copyright (c) 2020 - 2023 JOOJ Talk. All rights reserved.               @
# @*************************************************************************@

require_once(cl_full_path("core/apps/explore/app_ctrl.php"));

$cl["page_title"]   = cl_translate("Explore");
$cl["page_desc"]    = $cl["config"]["description"];
$cl["page_kw"]      = $cl["config"]["keywords"];
$cl["pn"]           = "explore";
$cl["sbr"]          = true;
$cl["sbl"]          = true;
$cl["search_query"] = fetch_or_get($_GET['q'], "");
$cl["page_tab"]     = fetch_or_get($_GET['tab'], "posts");
$cl["query_result"] = array();

if (not_empty($cl["search_query"])) {
	$cl["search_query"] = cl_text_secure($cl["search_query"]);
	$cl["page_title"]   = $cl["search_query"];
	$cl["search_query"] = cl_croptxt($cl["search_query"], 32);
}

if ($cl["page_tab"] == 'htags') {
	$cl["query_result"] = cl_search_hashtags($cl["search_query"], false, 30);
	if(not_empty($cl["search_query"])) {
		$cl["page_title"]   = cl_strf('Explore %s-related hashtags - Cointweets', $cl["search_query"]);
		$cl["page_desc"]    = cl_strf('Find out recent hashtags on %s and more', $cl["search_query"]);
		$cl["page_kw"]      = $cl["search_query"].", hashtags, ".$cl["config"]["keywords"];
	}
}
else if ($cl["page_tab"] == 'symbols') {
	// $cl["query_result"] = cl_search_symbols($cl["search_query"], false, 30);		/* edited by kevin. New Update. to show coins */
	$cl["query_result"] = cl_search_page($cl["search_query"], false, 30);
	if(not_empty($cl["search_query"])) {
		$cl["page_title"]   = cl_strf('Explore %s-related crypto coins - Cointweets', $cl["search_query"]);
		$cl["page_desc"]    = cl_strf('Find out recent crypto coins on %s and more', $cl["search_query"]);
		$cl["page_kw"]      = $cl["search_query"].", ".$cl["config"]["keywords"];
	}
}
else if($cl["page_tab"] == 'people') {
	$cl["query_result"] = cl_search_people($cl["search_query"], false, 30);
	// $cl["query_result"] = cl_search_page($cl["search_query"], false, 30);	/* edited by Kevin removed because it doesn't get people */
	if(not_empty($cl["search_query"])) {
		$cl["page_title"]   = cl_strf('Discover enthusiasts interested in %s on Cointweets', $cl["search_query"]);
		$cl["page_desc"]    = cl_strf('Find out recent people on %s and more', $cl["search_query"]);
		$cl["page_kw"]      = $cl["search_query"].", enthusiasts, people, ".$cl["config"]["keywords"];
	}
}

else {
	$cl["query_result"] = cl_search_posts($cl["search_query"], false, 30);
	if(not_empty($cl["search_query"])) {
		$cl["page_title"]   = cl_strf('Explore %s-related posts - Cointweets', $cl["search_query"]);
		$cl["page_desc"]    = cl_strf('Find out recent posts on %s and more', $cl["search_query"]);
		$cl["page_kw"]      = $cl["search_query"].", posts, ".$cl["config"]["keywords"];
	}
}

$cl["http_res"] = cl_template("explore/content");