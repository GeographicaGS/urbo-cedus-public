CREATE OR REPLACE FUNCTION urbo_traffic_calculate_relative_ratio(curr_val double precision, avg_val double precision, sat double precision DEFAULT 100.0)
RETURNS DOUBLE PRECISION AS
$$
DECLARE
    result double precision;
BEGIN
    IF curr_val < avg_val OR sat <= avg_val THEN
        result := (curr_val - avg_val) / avg_val;
    ELSE
        result := (curr_val - avg_val) / (sat - avg_val);
    END IF;

    RETURN result;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION traffic_trafficflowobserved_calculateratios()
RETURNS TRIGGER AS
$$
DECLARE
BEGIN
	NEW.intensity_ratio := (NEW.intensity::DOUBLE PRECISION / NEW.intensity_sat) * 100;
	NEW.service_level_ratio := (NEW.service_level::DOUBLE PRECISION / 3) * 100;
    NEW.intensity_relative_ratio := urbo_traffic_calculate_relative_ratio(NEW.intensity::DOUBLE PRECISION, NEW.intensity_avg, NEW.intensity_sat::DOUBLE PRECISION);
    NEW.load_relative_ratio := urbo_traffic_calculate_relative_ratio(NEW.load::DOUBLE PRECISION, NEW.load_avg);
    NEW.occupancy_relative_ratio := urbo_traffic_calculate_relative_ratio(NEW.occupancy::DOUBLE PRECISION, NEW.occupancy_avg);
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION urbo_createtables_traffic(
    id_scope text,
    isdebug boolean DEFAULT FALSE,
    iscarto boolean DEFAULT FALSE,
    cartouser text DEFAULT NULL
)
RETURNS TEXT AS
$$
DECLARE
    tb_measurand_name text;
    tb_lastdata_name text;

    _tb_bhcatalog text;
    _tb_bhlastdata text;
    _tb_bhlastdata_view text;
    _tb_bhhistoric text;
    _tb_bhobs text;

    _tb_incidence_ld_name text;

    trigger_lastdata_ratio_name text;
    trigger_measurand_ratio_name text;

    tb_names text[];

    _sql text;
    _checktable bool;
BEGIN

    tb_lastdata_name = urbo_get_table_name(id_scope, 'traffic_trafficflowobserved', iscarto, true);
    tb_measurand_name = urbo_get_table_name(id_scope, 'traffic_trafficflowobserved_measurand', iscarto);

    trigger_lastdata_ratio_name = urbo_get_table_name(id_scope, 'traffic_trafficflowobserved', true, true) || '_ratio';
    trigger_measurand_ratio_name = urbo_get_table_name(id_scope, 'traffic_trafficflowobserved_measurand', true) || '_ratio';

    _tb_bhcatalog = urbo_get_table_name(id_scope, 'traffic_bikehiredockingstation', iscarto);
    _tb_bhlastdata = urbo_get_table_name(id_scope, 'traffic_bikehiredockingstation', iscarto, true);
    _tb_bhlastdata_view = urbo_get_table_name(id_scope, 'traffic_bikehiredockingstation', iscarto, true, true);
    _tb_bhhistoric = urbo_get_table_name(id_scope, 'traffic_bikehiredockingstation_measurand', iscarto);
    _tb_bhobs = urbo_get_table_name(id_scope, 'traffic_bikehiredockingstation_obs', iscarto);

    _tb_incidence_ld_name = urbo_get_table_name(id_scope, 'traffic_incidence', iscarto, true);

    tb_names = ARRAY[
        tb_lastdata_name,
        tb_measurand_name,
        _tb_bhcatalog,
        _tb_bhlastdata,
        _tb_bhhistoric,
        _tb_incidence_ld_name
    ];

    _sql = NULL;

    _checktable = urbo_checktable_ifexists_arr(id_scope, tb_names, true);

    IF _checktable IS NULL OR NOT _checktable THEN

        _sql = format('

            CREATE TABLE IF NOT EXISTS %1$s (
                code text,
                lane_id integer,
                address jsonb,
                description text,
                position public.geometry(Point,4326),
                congested boolean,
                is_holiday boolean,
                intensity_sat integer,
                intensity integer,
                intensity_ratio DOUBLE PRECISION,
                intensity_avg double precision,
                intensity_relative_ratio double precision,
                load integer,
                load_avg double precision,
                load_relative_ratio double precision,
                service_level integer,
				service_level_ratio DOUBLE PRECISION,
                occupancy integer,
                occupancy_avg double precision,
                occupancy_relative_ratio double precision,
                error text,
                "TimeInstant" timestamp without time zone,
                id_entity character varying(64) NOT NULL,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

            CREATE TABLE IF NOT EXISTS %2$s (
                congested boolean,
                is_holiday boolean,
                intensity_sat integer,
                intensity integer,
                intensity_ratio DOUBLE PRECISION,
                intensity_avg double precision,
                intensity_relative_ratio double precision,
                load integer,
                load_avg double precision,
                load_relative_ratio double precision,
                service_level integer,
                service_level_ratio DOUBLE PRECISION,
                occupancy integer,
                occupancy_avg double precision,
                occupancy_relative_ratio double precision,
                error text,
                "TimeInstant" timestamp without time zone,
                id_entity character varying(64) NOT NULL,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

            -- bikehiredockingstation
            CREATE TABLE IF NOT EXISTS %3$s (
                "TimeInstant" timestamp without time zone,
                position geometry(Point, 4326),
                availablebikenumber double precision,
                freeslotnumber double precision,
                totalslotnumber double precision,
                status text,
                id_entity character varying(64) NOT NULL,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

            CREATE TABLE IF NOT EXISTS %4$s (
                position geometry(Geometry,4326),
                "TimeInstant" timestamp without time zone,
                availablebikenumber double precision,
                freeslotnumber double precision,
                totalslotnumber double precision,
                status text,
                name text,
                address jsonb,
                id_entity character varying(64) NOT NULL,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

            CREATE TABLE IF NOT EXISTS %5$s (
                position geometry(Geometry,4326),
                "TimeInstant" timestamp without time zone,
                name text,
                address jsonb,
                id_entity character varying(64) NOT NULL,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

            CREATE TABLE IF NOT EXISTS %6$s (
                id_entity character varying(64) NOT NULL,
                "TimeInstant" timestamp without time zone,
                density numeric default 0,
                people numeric default 0
            );

            CREATE TABLE IF NOT EXISTS %7$s (
                id_entity character varying(64) NOT NULL,
                "TimeInstant" timestamp without time zone,
                position geometry(Point, 4326),
                name text,
                description text,
                kind integer,
                start_date timestamp without time zone,
                end_date timestamp without time zone,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

        ',  tb_lastdata_name,
            tb_measurand_name,
            _tb_bhhistoric,
            _tb_bhlastdata,
            _tb_bhcatalog,
            _tb_bhobs,
            _tb_incidence_ld_name
        );

        IF iscarto THEN
            _sql = _sql || urbo_cartodbfy_tables_qry(cartouser, ARRAY[
                                                                      tb_lastdata_name,
                                                                      _tb_bhlastdata,
                                                                      _tb_bhcatalog,
                                                                      _tb_bhhistoric,
                                                                      _tb_incidence_ld_name
                                                                    ]);
            _sql = _sql || format('

                -- FOR TORQUE VIEW
                CREATE VIEW %s AS SELECT * FROM %s;
                GRANT SELECT ON %s TO publicuser;
            ',
                _tb_bhlastdata_view, _tb_bhlastdata,
                _tb_bhlastdata_view
            );

        ELSE
            _sql = _sql || urbo_pk_qry(tb_names);
            _sql = _sql || urbo_geom_idx_qry('position', ARRAY[
                                                               tb_lastdata_name,
                                                               _tb_bhlastdata,
                                                               _tb_bhcatalog,
                                                               _tb_incidence_ld_name
                                                            ]);
            _sql = _sql || urbo_tbowner_qry(tb_names);
        END IF;

        _sql = _sql || urbo_time_idx_qry(array_cat(tb_names, ARRAY[_tb_bhobs]));
        _sql = _sql || urbo_unique_lastdata_qry(ARRAY[
                                                      tb_lastdata_name,
                                                      _tb_bhlastdata,
                                                      _tb_bhobs,
                                                      _tb_incidence_ld_name
                                                    ]);

        _sql = _sql || format('
            --ALTER TABLE %1$s ADD UNIQUE(id_entity);

            DROP TRIGGER IF EXISTS %2$s
                ON %1$s
            ;

            CREATE TRIGGER %2$s
                BEFORE INSERT OR UPDATE OF intensity, intensity_sat, service_level
                ON %1$s
                FOR EACH ROW
                EXECUTE PROCEDURE traffic_trafficflowobserved_calculateratios();

            DROP TRIGGER IF EXISTS %4$s
                ON %3$s
            ;

            CREATE TRIGGER %4$s
                BEFORE INSERT OR UPDATE OF intensity, intensity_sat, service_level
                ON %3$s
                FOR EACH ROW
                EXECUTE PROCEDURE traffic_trafficflowobserved_calculateratios();
        ',
            tb_lastdata_name,
            trigger_lastdata_ratio_name,
            tb_measurand_name,
            trigger_measurand_ratio_name
        );

        IF isdebug then
            RAISE NOTICE '%', _sql;
        END IF;

        EXECUTE _sql;

    END IF;

    RETURN _sql;

END;
$$ LANGUAGE plpgsql;
