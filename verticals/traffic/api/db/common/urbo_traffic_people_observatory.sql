
CREATE OR REPLACE FUNCTION urbo_traffic_people_observatory()
  RETURNS TRIGGER AS
  $BODY$

  DECLARE
    _id_scope text;
    _db_ref text;
    _q text;
  BEGIN

    _id_scope = TG_argv[0];
    _db_ref = TG_argv[1];

    IF TG_OP = 'UPDATE'  THEN

      _q := format('
        UPDATE %1$s_traffic_bikehiredockingstation_obs
          set density = OBS_GetMeasure(%2$s,''%4$s''),
          set people = OBS_GetMeasure(%2$s,''%4$s'') * (random() * (0.12 - 0.11) + 0.11)
        WHERE id_entity=''%3$s''
        ',
        _id_scope, new.the_geom, new.id_entity, _db_ref
        );
      EXECUTE _q;
      RETURN new;

    ELSIF TG_OP = 'INSERT' THEN

      _q := format('
        INSERT INTO %1$s_traffic_bikehiredockingstation_obs (density, people, id_entity)
          OBS_GetMeasure(%2$s,''%4$s''),
          OBS_GetMeasure(%2$s,''%4$s'') * (random() * (0.12 - 0.11) + 0.11),
          %3$s
        ',
        _id_scope, new.the_geom, new.id_entity, _db_ref
        );
      EXECUTE _q;
      RETURN new;

    END IF;

    RETURN null;


END;
$BODY$
language plpgsql;
