<?php 
# @*************************************************************************@
# @ Software author: JOOJ Team (JOOJ.us)                           @
# @ Author_url 1: https://jooj.us                       @
# @ Author_url 2: http://jooj.us/twitter-clone                      @
# @ Author E-mail: sales@jooj.us                                   @
# @*************************************************************************@
# @ JOOJ Talk - The Ultimate Modern Social Media Sharing Platform           @
# @ Copyright (c) 2020 - 2021 JOOJ Talk. All rights reserved.               @
# @*************************************************************************@


require_once(cl_full_path("core/apps/symbol/app_ctrl.php"));
if (empty($_GET["sname"])) {
	cl_redirect("404");
}

$sname           = fetch_or_get($_GET["sname"], false);
$sname           = cl_text_secure($sname);
$cl['prof_user'] = cl_get_symbol_by_name($sname);
$cl['page_tab']  = fetch_or_get($_GET["tab"], "followers");

if (empty($cl['prof_user'])) {
	cl_redirect("404");
}

else {

	$cl['can_view']   = cl_can_view_symbol($cl['prof_user']['id']);
	$cl["page_title"] = $cl['prof_user']['name'];
	$cl["page_desc"]  = $cl['prof_user']['about'];
	$cl["page_kw"]    = $cl["config"]["keywords"];
	$cl["pn"]         = "watchings";
	$cl["sbr"]        = true;
	$cl["sbl"]        = true;
	$cl["users_list"] = array();

	if (not_empty($cl["is_logged"])) {
		$cl['prof_user']['owner']           = ($cl['prof_user']['id'] == $me['id']);
		$cl['prof_user']['follow_requests'] = cl_get_follow_requests_total();
	}

	if (not_empty($cl['can_view'])) {
		if ($cl['page_tab'] == 'watchers') {
			$cl["users_list"] = cl_get_watchers($cl['prof_user']['id'], 30, false);
		}

		else if ($cl['page_tab'] == 'follow_requests') {
			if (not_empty($cl['prof_user']['owner'])) {
				$cl["users_list"] = cl_get_follow_requests(30, false);
			}

			else{
				cl_redirect("404");
			}
		}

		else {
			$cl["users_list"] = cl_get_followings($cl['prof_user']['id'], 30, false);
		}
	}
	else {
		$cl['prof_user']['followers'] = 0;
		$cl['prof_user']['following'] = 0;
	}

	$cl["http_res"] = cl_template("watchings/content");
}
