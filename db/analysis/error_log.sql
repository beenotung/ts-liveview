select
  error_log.id
, datetime(error_log.timestamp/1000+8*3600,'unixepoch') as timestamp
, error_log.title
, error_log.error
, api_url.url as api_url
, client_url.url as client_url
from error_log
inner join url as client_url on client_url.id = client_url_id
inner join url as api_url on api_url.id = api_url_id
