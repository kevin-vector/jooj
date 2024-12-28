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

if (empty($_GET["sname"])) {
	cl_redirect("404");
}

$sname           = fetch_or_get($_GET["sname"], false);
$sname           = cl_text_secure($sname);
$cl['prof_user'] = cl_get_symbol_by_name($sname);
$cl['page_tab']  = fetch_or_get($_GET["tab"], 'posts');

if (empty($cl['prof_user'])) {
	cl_redirect("404");
}

require_once(cl_full_path("core/apps/symbol/app_ctrl.php"));

$cl["page_title"]  = cl_strf('%s %s%s%s', $cl['prof_user']['name'], '($', $cl['prof_user']['username'], ')');
$cl["page_desc"]   = $cl['prof_user']['about'];
$cl["page_img"]    = $cl['prof_user']['avatar'];
$cl["page_kw"]     = $cl["config"]["keywords"];
$cl["pn"]          = "symbol";
$cl["page_xdata"]  = array();
$cl["sbr"]         = true;
$cl["sbl"]         = true;
$cl["user_posts"]  = array();
$cl["user_likes"]  = array();

$cl["can_view"]    = cl_can_view_profile($cl['prof_user']['id']);
$cl["app_statics"] = array(
	"scripts" => array()
);

if (not_empty($cl["is_logged"])) {
	$cl['prof_user']['is_blocked'] = false;
	$cl['prof_user']['me_blocked'] = false;

	if (($cl['prof_user']['id'] != $se['id'])) {
		$cl['prof_user']['is_blocked'] = cl_is_blocked($se['id'], $cl['prof_user']['id']);
		$cl['prof_user']['me_blocked'] = cl_is_blocked($cl['prof_user']['id'], $se['id']);
	}

	$cl['prof_user']['owner']            = ($cl['prof_user']['id'] == $se['id']);
	$cl['prof_user']['is_following']     = cl_is_watching($me['id'], $cl['prof_user']['id']);
	$cl['prof_user']['follow_requested'] = false;
	$cl['prof_user']['common_follows']   = cl_get_common_follows($cl['prof_user']['id']);
	$cl['prof_user']['is_myfollower']    = cl_is_watching($cl['prof_user']['id'], $se["id"]);

	if (empty($cl['prof_user']['is_following'])) {
		$cl['prof_user']['follow_requested'] = cl_watch_requested($me['id'], $cl['prof_user']['id']);
	}
	 
	if (not_empty($cl['prof_user']['owner'])) {
		$cl["page_xdata"]["is_me"] = true;
		$cl["app_statics"]["scripts"] = array(
			cl_js_template("statics/js/libs/jquery-ui")
		);
	}

	if ($se["id"] != $cl['prof_user']['id']) {
		cl_notify_user(array(
            'subject'  => 'visit',
            'user_id'  => $cl['prof_user']['id'],
            'entry_id' => $se["id"]
        ));
	}
	// add post
	// require_once(cl_full_path("core/apps/home/app_ctrl.php"));
	// require_once(cl_full_path("core/apps/feed/app_ctrl.php"));
	$cl["app_statics"] = array(
		"scripts" => array(
			cl_js_template("statics/js/libs/SwiperJS/swiper-bundle.min")
		)
	);
	
    // Убедитесь, что symbol_id передается в шаблон
    $symbol_id = $cl['prof_user']['id'];
    $cl['symbol_id'] = $symbol_id;

}

if (empty($cl['prof_user']['is_blocked']) && empty($cl['prof_user']['me_blocked']) && $cl['prof_user']['active'] == "1") {
    if (in_array($cl['page_tab'], array('posts', 'trending'))) {
        if (not_empty($cl["can_view"])) {
            $cl["user_posts"] = cl_get_profile_posts($cl['prof_user']['id'], 30);
            $cl["user_posts_trending"] = cl_get_profile_posts_trending($cl['prof_user']['id'], 30);
        }
    } else {
        if (not_empty($cl["can_view"])) {
            $cl["user_likes"] = cl_get_profile_likes($cl['prof_user']['id'], 30);
        }
    }
    // Fetch and display posts mentioning the symbol
    $cl["user_mentions"] = cl_get_profile_posts($cl['prof_user']['id'], 30, false, false);

    // Ensure user_mentions is an array
    if (!is_array($cl["user_mentions"])) {
        $cl["user_mentions"] = array();
    }

    // Combine posts from author and mentions
    $merged_posts = array_merge((array)$cl["user_posts"], (array)$cl["user_mentions"]);

    // Remove duplicate posts
    $unique_posts = [];
    $post_ids = [];

    foreach ($merged_posts as $post) {
        if (!in_array($post['id'], $post_ids)) {
            $post_ids[] = $post['id'];
            $unique_posts[] = $post;
        }
    }

    $cl["user_posts"] = $unique_posts;
}







	// require_once(cl_full_path("core/apps/home/app_ctrl.php"));
	// require_once(cl_full_path("core/apps/feed/app_ctrl.php"));
	// $cl["app_statics"] = array(
	// 	"scripts" => array(
	// 		cl_js_template("statics/js/libs/SwiperJS/swiper-bundle.min")
	// 	)
	// );

$cl["settings_link"] = cl_link('page_settings?symbol_id=' . $cl['prof_user']['id']);
$cl["http_res"] = cl_template("symbol/content");
?>
