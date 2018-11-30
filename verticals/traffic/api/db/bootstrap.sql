/*
* Script to load all PL/PgSQL functions
*/

-- Traffic functions
\ir common/urbo_traffic_bikes_trig.sql
\ir common/urbo_traffic_people_observatory.sql


-- DDL
\ir common/ddl/urbo_createtables_traffic.sql
\ir common/dml/urbo_createmetadata_traffic.sql
