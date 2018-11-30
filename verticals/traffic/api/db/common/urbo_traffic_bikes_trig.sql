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
DROP FUNCTION IF EXISTS urbo_traffic_bikes_trig(text);
CREATE OR REPLACE FUNCTION urbo_traffic_bikes_trig(
  id_scope text)
  RETURNS void AS
  $$
  DECLARE
    _q text;
  BEGIN


    _q = format('

      DROP TRIGGER IF EXISTS urbo_traffic_bikes_changes_ld ON %s_traffic_bikehiredockingstation_lastdata;

      DROP TRIGGER IF EXISTS urbo_traffic_bikes_changes_ld_%s ON %s_traffic_bikehiredockingstation_lastdata;

      CREATE TRIGGER urbo_traffic_bikes_changes_ld_%s
        AFTER UPDATE
        ON %s_traffic_bikehiredockingstation_lastdata
        FOR EACH ROW
        WHEN (OLD.the_geom IS DISTINCT FROM NEW.the_geom)
          EXECUTE PROCEDURE urbo_traffic_people_observatory(''%s_traffic_bikehiredockingstation_lastdata'');


      DROP TRIGGER IF EXISTS urbo_traffic_bikes_changes ON %s_traffic_bikehiredockingstation;

      DROP TRIGGER IF EXISTS urbo_traffic_bikes_changes_%s ON %s_traffic_bikehiredockingstation;

      CREATE TRIGGER urbo_traffic_bikes_changes_%s
        AFTER UPDATE
        ON %s_traffic_bikehiredockingstation
        FOR EACH ROW
        WHEN (OLD.the_geom IS DISTINCT FROM NEW.the_geom)
          EXECUTE PROCEDURE urbo_traffic_people_observatory(''%s_traffic_bikehiredockingstation'');',

      id_scope, id_scope, id_scope, id_scope, id_scope, id_scope,
      id_scope, id_scope, id_scope, id_scope, id_scope, id_scope);

    raise notice '%', _q;

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;

-- CARTO ONLY
-- SELECT urbo_traffic_bikes_trig('malaga');
