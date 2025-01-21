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

if ($action == 'load_more') {
	$data['err_code'] = 0;
    $data['status']   = 400;
    $offset           = fetch_or_get($_GET['offset'], 0);
    $prof_id          = fetch_or_get($_GET['prof_id'], 0);
    $type             = fetch_or_get($_GET['type'], false);
    $html_arr         = array();

    $data['offset'] = $offset;

    if (is_posnum($prof_id) && is_posnum($offset) && cl_can_view_symbol($prof_id)) { 	
    	if (in_array($type, array('posts'))) {
            $posts_ls   = cl_get_symbol_posts($prof_id, 30, $offset);

            if (not_empty($posts_ls)) {
                foreach ($posts_ls as $cl['li']) {
                    $html_arr[] = cl_template('timeline/post_symbol');
                }

                $data['status'] = 200;
                $data['html']   = implode("", $html_arr);
            }
        }
        else {
            if (cl_can_view_symbol($prof_id)) {
                $posts_ls = cl_get_symbol_posts_trending($prof_id, 30, $offset);

                if (not_empty($posts_ls)) {
                    foreach ($posts_ls as $cl['li']) {
                        $html_arr[] = cl_template('timeline/post_symdol');
                    }

                    $data['status'] = 200;
                    $data['html']   = implode("", $html_arr);
                }
            }
        }
    }
    
}


   