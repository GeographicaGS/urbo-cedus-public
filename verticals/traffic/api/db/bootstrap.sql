/*
* Script to load all PL/PgSQL functions
*/

-- Traffic functions
-- Carto only
-- Used at carto to fil observatory table. Currently can be used directly only for spanish places.
-- For diferent locations please check Carto Data Observatory and check availability.
-- For example, for nantes was used the INSEE data, ref: 'fr.insee.P12_POP'.
\ir common/urbo_traffic_bikes_trig.sql
\ir common/urbo_traffic_people_observatory.sql


-- DDL
\ir common/ddl/urbo_createtables_traffic.sql
\ir common/dml/urbo_createmetadata_traffic.sql
