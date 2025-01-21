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

function cl_get_symbol_posts($symbol_id = false, $limit = 30, $offset = false) {
    global $db, $cl, $me;

    if (not_num($symbol_id)) {
        return array();
    }

    $data = array();
    $symbol_data = cl_symbol_data($symbol_id);

    if (empty($symbol_data) || !isset($symbol_data['username'])) {
        return array();
    }

    $symbol_name = $symbol_data['username'];
    $sql = cl_sqltepmlate("apps/symbol/sql/fetch_symbol_posts", array(
        "t_pubs" => T_PUBS,
        "t_posts" => T_PSYMBOL,
        "limit" => $limit,
        "offset" => $offset,
        "symbol_id" => $symbol_id,
        "symbol_name" => $symbol_name
    ));

    $query_res = $db->rawQuery($sql);
    $counter = 0;

    if (cl_queryset($query_res)) {
        foreach ($query_res as $row) {
            $post_data = cl_raw_post_data($row['publication_id']);
            if (not_empty($post_data) && in_array($post_data['status'], array('active'))) {
                $post_data['offset_id'] = isset($row['offset_id']) ? $row['offset_id'] : null;
                $post_data['is_repost'] = (($row['type'] == 'repost') ? true : false);
                $post_data['is_quote'] = (($row['type'] == 'quote') ? true : false);
                $post_data['is_reposter'] = false;
                $post_data['attrs'] = array();
                $post_data['comment_on'] = null;

                if ($post_data['is_repost']) {
                    $post_data['attrs'][] = cl_html_attrs(array('data-repost' => $post_data['offset_id']));
                    $reposter_data = cl_symbol_data($row['symbol_id']);
                    $post_data['reposter'] = array(
                        'name' => $reposter_data['name'],
                        'username' => $reposter_data['username'],
                        'url' => $reposter_data['url'],
                    );
                }

                if($post_data['is_quote']){
					$post_data['comment_on'] = cl_get_guest_feed_one($row['comment_on']);		/* edited by kevin to fetch comment on (added) */	
                    if($post_data['comment_on']) $post_data['comment_on'] = $post_data['comment_on'][0];
				}
                
                if (not_empty($cl['is_logged'])) {
                    if ($row['symbol_id'] == $me['id']) {
                        $post_data['is_reposter'] = true;
                    }
                }

                $post_data['attrs'] = ((not_empty($post_data['attrs'])) ? implode(' ', $post_data['attrs']) : '');
                $data[] = cl_post_data($post_data);
            }

            if ($cl['config']['advertising_system'] == 'on') {
                if (cl_is_feed_nad_allowed()) {
                    if (not_empty($offset)) {
                        if ($counter == 5) {
                            $counter = 0;
                            $ad = cl_get_timeline_ads();

                            if (not_empty($ad)) {
                                $data[] = $ad;
                            }
                        } else {
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

    // Fetch posts mentioning the symbol by name
    $sql_mentions = cl_sqltepmlate("apps/symbol/sql/fetch_symbol_mentions", array(
        "t_pubs" => T_PUBS,
        "t_posts" => T_POSTS,
        "symbol_name" => $symbol_name,
        "limit" => $limit,
        "offset" => $offset
    ));
    $query_res_mentions = $db->rawQuery($sql_mentions);

    if (cl_queryset($query_res_mentions)) {
        foreach ($query_res_mentions as $row) {
            $post_data = cl_raw_post_data($row['id']);
            if (not_empty($post_data) && in_array($post_data['status'], array('active'))) {
                $post_data['offset_id'] = isset($row['offset_id']) ? $row['offset_id'] : null;                
                $post_data['is_quote'] = (($row['type'] == 'quote') ? true : false);
                $post_data['comment_on'] = null;
                if($post_data['is_quote']){
					$post_data['comment_on'] = cl_get_guest_feed_one($row['comment_on']);		/* edited by kevin to fetch comment on (added) */	
                    if(isset($post_data['comment_on'][0])) $post_data['comment_on'] = $post_data['comment_on'][0];
				}
                $data[] = cl_post_data($post_data);
            }
        }
    }
    return $data;
}

function cl_get_symbol_posts_trending($symbol_id = false, $limit = 30, $offset = false) {
    global $db, $cl, $me, $se;

    if (not_num($symbol_id)) {
        return array();
    }

    $data = array();
    $symbol_data = cl_symbol_data($symbol_id);

    if (empty($symbol_data) || !isset($symbol_data['username'])) {
        return array();
    }

    $symbol_name = $symbol_data['username']; 
    $sql = cl_sqltepmlate("apps/symbol/sql/fetch_symbol_posts_trending", array(
        "t_pubs" => T_PUBS,
        "t_posts" => T_PSYMBOL,
        "limit" => $limit,
        "offset" => $offset,
        "symbol_id" => $symbol_id,
        "symbol_name" => $symbol_name
    ));

    $query_res = $db->rawQuery($sql);
    $counter = 0;

    if (cl_queryset($query_res)) {
        foreach ($query_res as $row) {
            $post_data = cl_raw_post_data($row['publication_id']);
            if (not_empty($post_data) && in_array($post_data['status'], array('active'))) {
                $post_data['offset_id'] = isset($row['offset_id']) ? $row['offset_id'] : null;
                $post_data['is_repost'] = (($row['type'] == 'repost') ? true : false);
                $post_data['is_quote'] = (($row['type'] == 'quote') ? true : false);
                $post_data['is_reposter'] = false;
                $post_data['attrs'] = array();
                $post_data['comment_on'] = null;

                if ($post_data['is_repost']) {
                    $post_data['attrs'][] = cl_html_attrs(array('data-repost' => $post_data['offset_id']));
                    $reposter_data = cl_symbol_data($row['symbol_id']);
                    $post_data['reposter'] = array(
                        'name' => $reposter_data['name'],
                        'username' => $reposter_data['username'],
                        'url' => $reposter_data['url'],
                    );
                }

                if($post_data['is_quote']){
					$post_data['comment_on'] = cl_get_guest_feed_one($row['comment_on']);		/* edited by kevin to fetch comment on (added) */	
                    if($post_data['comment_on']) $post_data['comment_on'] = $post_data['comment_on'][0];
				}
                
                if (not_empty($cl['is_logged'])) {
                    if ($row['symbol_id'] == $se['id']) {
                        $post_data['is_reposter'] = true;
                    }
                }

                $post_data['attrs'] = ((not_empty($post_data['attrs'])) ? implode(' ', $post_data['attrs']) : '');
                $data[] = cl_post_data($post_data);
            }

            if ($cl['config']['advertising_system'] == 'on') {
                if (cl_is_feed_nad_allowed()) {
                    if (not_empty($offset)) {
                        if ($counter == 5) {
                            $counter = 0;
                            $ad = cl_get_timeline_ads();

                            if (not_empty($ad)) {
                                $data[] = $ad;
                            }
                        } else {
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

    // Fetch posts mentioning the symbol by name
    $sql_mentions = cl_sqltepmlate("apps/symbol/sql/fetch_symbol_mentions_trending", array(
        "t_pubs" => T_PUBS,
        "t_posts" => T_POSTS,
        "symbol_name" => $symbol_name,
        "limit" => $limit,
        "offset" => $offset
    ));
    $query_res_mentions = $db->rawQuery($sql_mentions);

    if (cl_queryset($query_res_mentions)) {
        foreach ($query_res_mentions as $row) {
            $post_data = cl_raw_post_data($row['id']);
            if (not_empty($post_data) && in_array($post_data['status'], array('active'))) {
                $post_data['offset_id'] = isset($row['offset_id']) ? $row['offset_id'] : null;                
                $post_data['is_quote'] = (($row['type'] == 'quote') ? true : false);
                $post_data['comment_on'] = null;
                if($post_data['is_quote']){
					$post_data['comment_on'] = cl_get_guest_feed_one($row['comment_on']);		/* edited by kevin to fetch comment on (added) */	
                    if(isset($post_data['comment_on'][0])) $post_data['comment_on'] = $post_data['comment_on'][0];
				}
                $data[] = cl_post_data($post_data);
            }
        }
    }
    return $data;
}


function cl_get_symbol_likes($symbol_id = false, $limit = 30, $offset = false) {
	global $db, $cl;

	if (not_num($symbol_id)) {
		return false;
	}

	$data      =  array();
	$db        = $db->where('symbol_id', $symbol_id);
	$db        = ((is_posnum($offset)) ? $db->where('id', $offset, '<') : $db);
	$db        = $db->orderBy('id', 'DESC');
	$query_res = $db->get(T_LIKES, $limit);

	if (cl_queryset($query_res)) {
		foreach ($query_res as $row) {
			$post_data = cl_raw_post_data($row['pub_id']);
			if (not_empty($post_data) && in_array($post_data['status'], array('active'))) {
				$post_data['offset_id'] = $row['id'];
				$data[]                 = cl_post_data($post_data);
			}
		}
	}

	return $data;
}

function cl_can_view_symbol($symbol_id = false) {
	global $db, $cl;

	if (not_num($symbol_id)) {
		return false;
	}

	$sdata = cl_raw_symbol_data($symbol_id);
	$myid  = ((empty($cl['is_logged'])) ? 0 : $cl['me']['id']);

	if (not_empty($sdata)) {
		if (not_empty($myid) && $myid == $symbol_id) {
			return true;
		}

		else if (not_empty($myid) && $myid != $symbol_id && $sdata['profile_privacy'] == 'nobody') {
			return false;
		}

		else if($sdata['profile_privacy'] == 'everyone') {
			return true;
		}

		else if(not_empty($myid) && $sdata['profile_privacy'] == 'followers' && cl_is_watching($myid, $symbol_id)) {
			return true;
		}

		else {
			return false;
		}
	}
	else {
		return false;
	}
}