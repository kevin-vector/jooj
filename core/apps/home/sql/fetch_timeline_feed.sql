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
	
	INNER JOIN (SELECT `id` as offset_id, `publication_id`, `type`, `user_id`, `comment_on` FROM `<?php echo($data['t_posts']); ?>`
	union all 
	SELECT `id` as offset_id, `publication_id`, `type`, `user_id`, `comment_on` FROM cl_posts_symbol) AS posts on pubs.id = posts.publication_id

	WHERE pubs.`status` = 'active'

	AND (posts.`user_id` = <?php echo($data['user_id']); ?> OR posts.`user_id` IN (SELECT `following_id` FROM `<?php echo($data['t_conns']); ?>` WHERE `follower_id` = <?php echo($data['user_id']); ?> AND `status` = "active") OR `priv_wcs` = "everyone")

	AND (posts.`publication_id` NOT IN (SELECT `post_id` FROM `<?php echo($data['t_reports']); ?>` WHERE `user_id` = <?php echo($data['user_id']); ?>))

	ORDER BY pubs.`time` DESC

<?php if($data['limit']): ?>
	LIMIT <?php echo($data['limit']); ?>

	<?php if($data['offset']): ?>
		OFFSET <?php echo($data['offset']); ?>
	<?php endif; ?>

<?php endif; ?>