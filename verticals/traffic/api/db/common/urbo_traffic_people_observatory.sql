--
-- Copyright 2017 Telefónica Digital España S.L.
--
-- PROJECT: urbo-telefonica
--
-- This software and / or computer program has been developed by
-- Telefónica Digital España S.L. (hereinafter Telefónica Digital) and is protected as
-- copyright by the applicable legislation on intellectual property.
--
-- It belongs to Telefónica Digital, and / or its licensors, the exclusive rights of
-- reproduction, distribution, public communication and transformation, and any economic
-- right on it, all without prejudice of the moral rights of the authors mentioned above.
-- It is expressly forbidden to decompile, disassemble, reverse engineer, sublicense or
-- otherwise transmit by any means, translate or create derivative works of the software and
-- / or computer programs, and perform with respect to all or part of such programs, any
-- type of exploitation.
--
-- Any use of all or part of the software and / or computer program will require the
-- express written consent of Telefónica Digital. In all cases, it will be necessary to make
-- an express reference to Telefónica Digital ownership in the software and / or computer
-- program.
--
-- Non-fulfillment of the provisions set forth herein and, in general, any violation of
-- the peaceful possession and ownership of these rights will be prosecuted by the means
-- provided in both Spanish and international law. Telefónica Digital reserves any civil or
-- criminal actions it may exercise to protect its rights.
--


DROP FUNCTION IF EXISTS urbo_traffic_people_observatory(varchar, varchar);
DROP FUNCTION IF EXISTS urbo_traffic_people_observatory(varchar, varchar, varchar);
DROP FUNCTION IF EXISTS urbo_traffic_people_observatory(varchar, geometry, varchar);
CREATE OR REPLACE FUNCTION urbo_traffic_people_observatory(id_scope varchar, the_geom varchar, id_entity varchar)
  RETURNS record AS $$
  DECLARE
    _q text;
    _ret record;
  BEGIN


        -- DELETE FROM malaga_traffic_bikehiredockingstation_obs;
        -- INSERT INTO malaga_traffic_bikehiredockingstation_obs (density, people, id_entity)
        --   ( SELECT
        --       OBS_GetMeasure(the_geom, 'es.ine.t1_1') AS density,
        --       OBS_GetMeasure(the_geom, 'es.ine.t1_1') * 0.12566368 AS people,
        --       id_entity
        --     FROM malaga_traffic_bikehiredockingstation_lastdata)



    _q := format(
        'INSERT INTO %s_traffic_bikehiredockingstation_obs (people, id_entity) VALUES
          (OBS_GetMeasure(st_transform(st_buffer(st_transform(''%s'',25830),200), 3857),''es.ine.t1_1''),
          ''%s'') ', id_scope, the_geom, id_entity);

    raise notice '%', _q;
    EXECUTE _q INTO _ret;
    return _ret;

  END;
  $$ LANGUAGE plpgsql;


-- SELECT urbo_traffic_people_observatory('malaga', ST_AsText(the_geom), id_entity) from malaga_traffic_bikehiredockingstation_lastdata;
