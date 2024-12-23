select '김준일' as name, 100 as num
union all  -- 위의 select 결과와 밑의 select 결과를 합치겠다, 조건 : 컬럼의 개수와 자료형이 같아야함
select '김준이' as name2, 31 as age
union  -- 그냥 쓰면 중복 제거
select '김준이' as name2, 31 as age;

select '김준일' as name
union all  -- 위의 select 결과와 밑의 select 결과를 합치겠다, 조건 : 컬럼의 개수가 같아야함
select '김준이' as name2, 31 as age;

-- recursive 하면 자기 자신을 재참조 할 수 있다.
with recursive aa as(
	select 0 as num -- 기존에 0이라는 num값을 하나 넣음
    union all
    select num + 1 from aa -- 자기 자신을 참조, 기존의 num 값에 1을 더함
    where
		num < 10
)

select
	*
from
	aa;