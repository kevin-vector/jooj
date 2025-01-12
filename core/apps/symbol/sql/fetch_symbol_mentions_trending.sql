

    SELECT pubs.`id`, pubs.`likes_count`, pubs.`replys_count`, pubs.`reposts_count`, posts.`comment_on`, posts.`type`, posts.`id` as offset_id

    FROM `<?php echo($data['t_pubs']); ?>` pubs

    LEFT JOIN `<?php echo($data['t_posts']); ?>` posts ON pubs.`time`=posts.`time`

    WHERE pubs.`text` LIKE "%<?php echo($data['symbol_name']); ?>%"

    AND CAST(pubs.`time` AS UNSIGNED) >= UNIX_TIMESTAMP(NOW() - INTERVAL 7 DAY)

    AND pubs.`likes_count` > 0

    <?php if($data['offset']): ?>
        AND pubs.`id` < <?php echo($data['offset']); ?>
    <?php endif; ?>

    ORDER BY pubs.likes_count DESC, pubs.replys_count DESC, pubs.reposts_count DESC, pubs.id DESC

    <?php if($data['limit']): ?>
        LIMIT <?php echo($data['limit']); ?>;
    <?php endif; ?>

