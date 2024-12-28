<?php 
# @*************************************************************************@
# @ Software author: JOOJ Team (JOOJ.us)							@
# @ Author_url 1: https://jooj.us                       @
# @ Author_url 2: http://jooj.us/twitter-clone                      @
# @ Author E-mail: sales@jooj.us                                    @
# @*************************************************************************@
# @ JOOJ Talk - The Ultimate Modern Social Media Sharing Platform           @
# @ Copyright (c) 2020 - 2023 JOOJ Talk. All rights reserved.               @
# @*************************************************************************@
function cl_get_guest_feed($offset = false, $limit = 30) {
	global $db, $cl, $me;

	$data        = array();
	$sql         = cl_sqltepmlate("apps/feed/sql/fetch_feed", array(
		"t_pubs" => T_PUBS,
        "t_posts" => T_POSTS,
		"offset" => $offset,
		"limit"  => $limit,
 	));

	$query_res = $db->rawQuery($sql);
    $counter   = 0;

	if (cl_queryset($query_res)) {
		foreach ($query_res as $row) {
			$post_data = cl_raw_post_data($row['publication_id']);

			if (not_empty($post_data) && in_array($post_data['status'], array('active'))) {
				$post_data['is_repost']   = (($row['type'] == 'repost') ? true : false);
				$post_data['is_quote']   = (($row['type'] == 'quote') ? true : false);		/* edited by kevin to quote comment */
				$post_data['is_reposter'] = false;
				$post_data['attrs']       = array();
				$post_data['comment_on']  = null;						/* edited by kevin to fetch comment on (added) */

				if ($post_data['is_repost']) {
					$reposter_data         = cl_user_data($row['user_id']);
					$post_data['reposter'] = array(
						'name' => $reposter_data['name'],
						'username' => $reposter_data['username'],
						'url' => $reposter_data['url'],
					);
				}

				if($post_data['is_quote']){
					$post_data['comment_on']  = cl_get_guest_feed_one($row['comment_on']);
					if($post_data['comment_on']) $post_data['comment_on'] = $post_data['comment_on'][0];		/* edited by kevin to fetch comment on (added) */
				}

				if (isset($me['id']) && $row['user_id'] == $me['id']) {
					$post_data['is_reposter'] = true;
				}

				$post_data['attrs'] = ((not_empty($post_data['attrs'])) ? implode(' ', $post_data['attrs']) : '');
				$data[]             = cl_post_data($post_data);
			}

            if ($cl['config']['advertising_system'] == 'on') {
                if (cl_is_feed_nad_allowed()) {
                    if (not_empty($offset)) {
                        if ($counter == 5) {
                            $counter = 0;
                            $ad      = cl_get_timeline_ads();

                            if (not_empty($ad)) {
                                $data[] = $ad;
                            }
                        }
                        else {
                            $counter += 1;
                        }
                    }
                }
            }
		}
       
        if ($cl['config']['advertising_system'] == 'on') {
            if (cl_is_feed_nad_allowed()) {
                if (empty($offset)) {
                    $ad = cl_get_timeline_ads();

                    if (not_empty($ad)) {
                        $data[] = $ad;
                    }
                }
            }
        }
	}

	return $data;
}

function cl_get_guest_trending($offset = false, $limit = 10) {
	global $db, $cl, $me;

	$data        = array();
	$sql         = cl_sqltepmlate("apps/feed/sql/fetch_trending", array(
		"t_pubs" => T_PUBS,
        "t_posts" => T_POSTS,
		"offset" => $offset,
		"limit"  => $limit,
 	));

	$query_res = $db->rawQuery($sql);
    $counter   = 0;

	if (cl_queryset($query_res)) {
		foreach ($query_res as $row) {
			$post_data = cl_raw_post_data($row['publication_id']);

			if (not_empty($post_data) && in_array($post_data['status'], array('active'))) {
				$post_data['is_repost']   = (($row['type'] == 'repost') ? true : false);
				$post_data['is_quote']   = (($row['type'] == 'quote') ? true : false);		/* edited by kevin to quote comment */
				$post_data['is_reposter'] = false;
				$post_data['attrs']       = array();
				$post_data['comment_on']  = null;						/* edited by kevin to fetch comment on (added) */

				if ($post_data['is_repost']) {
					$reposter_data         = cl_user_data($row['user_id']);
					$post_data['reposter'] = array(
						'name' => $reposter_data['name'],
						'username' => $reposter_data['username'],
						'url' => $reposter_data['url'],
					);
				}

				if($post_data['is_quote']){
					$post_data['comment_on']  = cl_get_guest_feed_one($row['comment_on']);
					if($post_data['comment_on']) $post_data['comment_on'] = $post_data['comment_on'][0];		/* edited by kevin to fetch comment on (added) */
				}

				if (isset($me['id']) && $row['user_id'] == $me['id']) {
					$post_data['is_reposter'] = true;
				}

				$post_data['attrs'] = ((not_empty($post_data['attrs'])) ? implode(' ', $post_data['attrs']) : '');
				$data[]             = cl_post_data($post_data);
			}

            if ($cl['config']['advertising_system'] == 'on') {
                if (cl_is_feed_nad_allowed()) {
                    if (not_empty($offset)) {
                        if ($counter == 5) {
                            $counter = 0;
                            $ad      = cl_get_timeline_ads();

                            if (not_empty($ad)) {
                                $data[] = $ad;
                            }
                        }
                        else {
                            $counter += 1;
                        }
                    }
                }
            }
		}
       
        if ($cl['config']['advertising_system'] == 'on') {
            if (cl_is_feed_nad_allowed()) {
                if (empty($offset)) {
                    $ad = cl_get_timeline_ads();

                    if (not_empty($ad)) {
                        $data[] = $ad;
                    }
                }
            }
        }
	}

	return $data;
}

function cl_get_guest_latest($offset = false, $limit = 10) {
	global $db, $cl, $me;

	$data        = array();
	$sql         = cl_sqltepmlate("apps/feed/sql/fetch_latest", array(
		"t_pubs" => T_PUBS,
        "t_posts" => T_POSTS,
		"offset" => $offset,
		"limit"  => $limit,
 	));

	$query_res = $db->rawQuery($sql);
    $counter   = 0;

	if (cl_queryset($query_res)) {
		foreach ($query_res as $row) {
			$post_data = cl_raw_post_data($row['publication_id']);

			if (not_empty($post_data) && in_array($post_data['status'], array('active'))) {
				$post_data['is_repost']   = (($row['type'] == 'repost') ? true : false);
				$post_data['is_quote']   = (($row['type'] == 'quote') ? true : false);		/* edited by kevin to quote comment */
				$post_data['is_reposter'] = false;
				$post_data['attrs']       = array();
				$post_data['comment_on']  = null;						/* edited by kevin to fetch comment on (added) */

				if ($post_data['is_repost']) {
					$reposter_data         = cl_user_data($row['user_id']);
					$post_data['reposter'] = array(
						'name' => $reposter_data['name'],
						'username' => $reposter_data['username'],
						'url' => $reposter_data['url'],
					);
				}

				if($post_data['is_quote']){
					$post_data['comment_on']  = cl_get_guest_feed_one($row['comment_on']);
					if($post_data['comment_on']) $post_data['comment_on'] = $post_data['comment_on'][0];		/* edited by kevin to fetch comment on (added) */
				}

				if (isset($me['id']) && $row['user_id'] == $me['id']) {
					$post_data['is_reposter'] = true;
				}

				$post_data['attrs'] = ((not_empty($post_data['attrs'])) ? implode(' ', $post_data['attrs']) : '');
				$data[]             = cl_post_data($post_data);
			}

            if ($cl['config']['advertising_system'] == 'on') {
                if (cl_is_feed_nad_allowed()) {
                    if (not_empty($offset)) {
                        if ($counter == 5) {
                            $counter = 0;
                            $ad      = cl_get_timeline_ads();

                            if (not_empty($ad)) {
                                $data[] = $ad;
                            }
                        }
                        else {
                            $counter += 1;
                        }
                    }
                }
            }
		}
       
        if ($cl['config']['advertising_system'] == 'on') {
            if (cl_is_feed_nad_allowed()) {
                if (empty($offset)) {
                    $ad = cl_get_timeline_ads();

                    if (not_empty($ad)) {
                        $data[] = $ad;
                    }
                }
            }
        }
	}

	return $data;
}