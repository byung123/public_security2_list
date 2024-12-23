-- 새로운 가상 테이블을 임시 메모리에 만듦 - 스스로의 테이블을 참조하면서 반복을 돌릴 수 있게 끔 만들어준다
WITH RECURSIVE comment_tree AS (
    SELECT 
        id,
        board_id,
        parent_id,
        content,
        writer_id,
        create_date,
        0 AS level,
        CAST(id AS CHAR(255)) AS path 
    FROM 
        comment
    WHERE 
        parent_id IS NULL 

    UNION ALL

    SELECT 
        c.id,
        c.board_id,
        c.parent_id,
        c.content,
        c.writer_id,
        c.create_date,
        ct.level + 1,
        CONCAT(ct.path, ',', c.id) AS path
    FROM 
        comment c
		join comment_tree ct ON(c.parent_id = ct.id)
)

SELECT 
    id,
    board_id,
    parent_id,
    content,
    writer_id,
    create_date,
    level,
    path 
FROM 
    comment_tree
ORDER BY 
    path,
    create_date;
    
-- truncate 한 번 하고 하기

insert into comment
values
	(default, 1, null, 'aaaa', 1, now()),
	(default, 1, null, 'bbbb', 2, now()),
	(default, 1, 1, 'cccc', 3, now()),
	(default, 1, 1, 'dddd', 2, now()),
	(default, 1, 3, 'eeeee', 4, now()), 
	(default, 1, 5, 'fffff', 1, now()),
	(default, 1, 2, 'ggggg', 3, now());