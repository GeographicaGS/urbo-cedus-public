DROP FUNCTION IF EXISTS urbo_traffic_bikes_trig(text, text);
CREATE OR REPLACE FUNCTION urbo_traffic_bikes_trig(
    id_scope text,
    country text
  )
  RETURNS void AS
  $$
  DECLARE
    _q text;
    _db_ref text;
  BEGIN

    IF country  = 'spain' THEN
      _db_ref := 'es.ine.t1_1';
    ELSIF country = 'france' THEN
      _db_ref := 'fr.insee.P12_POP';
    ELSE
      RAISE NOTICE 'Sorry! This country is not supported';

    END IF;

    _q = format('

      DROP TRIGGER IF EXISTS urbo_traffic_bikes_changes_ld_%1$s ON %1$s_traffic_bikehiredockingstation_lastdata;
      CREATE TRIGGER urbo_traffic_bikes_changes_ld_%1$s
        AFTER UPDATE or INSERT
        ON %1$s_traffic_bikehiredockingstation_lastdata
        FOR EACH ROW
          EXECUTE PROCEDURE urbo_traffic_people_observatory(''%1$s'', ''%2$s'');
      ',

      id_scope, _db_ref

    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
