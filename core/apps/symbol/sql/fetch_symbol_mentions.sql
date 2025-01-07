    
    
SELECT pubs.id, pubs.likes_count, pubs.replys_count, pubs.reposts_count, posts.comment_on, posts.type, posts.id as offset_id

    FROM `<?php echo($data['t_pubs']); ?>` pubs

    LEFT JOIN `<?php echo($data['t_posts']); ?>` posts ON pubs.id=posts.publication_id

    WHERE pubs.text LIKE "%<?php echo($data['symbol_name']); ?>%"

    <?php if($data['offset']): ?>
        AND pubs.id < <?php echo($data['offset']); ?>
    <?php endif; ?>

    ORDER BY pubs.id DESC

    <?php if($data['limit']): ?>
        LIMIT <?php echo($data['limit']); ?>;
    <?php endif; ?>

