/*
@*************************************************************************@
@ Software author: JOOJ Team (JOOJ.us)				        			  @
@ Author_url 1: https://jooj.us                                           @
@ Author_url 2: http://jooj.us/twitter-clone                              @
@ Author E-mail: sales@jooj.us                                            @
@*************************************************************************@
@ JOOJ Talk - The Ultimate Modern Social Media Sharing Platform           @
@ Copyright (c) 2020 - 2023 JOOJ Talk. All rights reserved.               @
@*************************************************************************@
 */

SELECT * FROM `<?php echo($data['t_pubs']); ?>` pubs

INNER JOIN (SELECT `type`, comment_on, publication_id from `<?php echo($data['t_posts']); ?>`
				union all 
				SELECT `type`, comment_on, publication_id from cl_posts_symbol)  AS merged_data on pubs.id = merged_data.publication_id

	WHERE pubs.`status` = 'active'

	AND (`user_id` = <?php echo($data['user_id']); ?> OR `user_id` IN (SELECT `following_id` FROM `<?php echo($data['t_conns']); ?>` WHERE `follower_id` = <?php echo($data['user_id']); ?> AND `status` = "active") OR `priv_wcs` = "everyone")

	AND (`publication_id` NOT IN (SELECT `post_id` FROM `<?php echo($data['t_reports']); ?>` WHERE `user_id` = <?php echo($data['user_id']); ?>))

	ORDER BY `time` DESC

<?php if($data['limit']): ?>
	LIMIT <?php echo($data['limit']); ?>

	<?php if($data['offset']): ?>
		OFFSET <?php echo($data['offset']); ?>
	<?php endif; ?>

<?php endif; ?>