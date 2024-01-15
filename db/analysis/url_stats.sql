select
  url.id
, url.url
, count(request_log.id) as count
from request_log
inner join url on url.id = request_log.url_id
-- where url.url like '%article%'
  -- and not url.url like '%webp'
group by url.id
order by count desc
