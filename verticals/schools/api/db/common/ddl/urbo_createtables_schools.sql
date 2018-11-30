
DROP FUNCTION IF EXISTS urbo_createtables_schools(text, boolean, boolean, text);

CREATE OR REPLACE FUNCTION urbo_createtables_schools(
    id_scope text,
    isdebug boolean DEFAULT FALSE,
    iscarto boolean DEFAULT FALSE,
    cartouser text DEFAULT NULL
)
RETURNS TEXT AS
$$
DECLARE
    tb_institute_name text;
    tb_company_name text;
    tb_internship_name text;
    tb_course_name text;
    tb_internship_instance_name text;
    tb_institute_internship_name text;
    tb_kpi_name text;
    tb_names text[];
    tb_with_position_names text[];
    _sql text;
    _sql_view text;
    _alter_view text;
    _checktable bool;
BEGIN

    tb_institute_name = urbo_get_table_name(id_scope, 'schools_institute', iscarto, true);
    tb_company_name = urbo_get_table_name(id_scope, 'schools_company', iscarto, true);
    tb_internship_name = urbo_get_table_name(id_scope, 'schools_internship', iscarto, true);
    tb_course_name = urbo_get_table_name(id_scope, 'schools_course', iscarto, true);
    tb_internship_instance_name = urbo_get_table_name(id_scope, 'schools_internship_instance', iscarto, true);
    -- Name for the view, it cannot be treated as a real _lastdata table
    tb_institute_internship_name = urbo_get_table_name(id_scope, 'schools_institute_internship', iscarto, true);
    tb_kpi_name = urbo_get_table_name(id_scope, 'schools_kpi', iscarto, true);
    tb_names = ARRAY[tb_institute_name, tb_company_name, tb_internship_name,
                     tb_course_name, tb_internship_instance_name, tb_kpi_name];
    tb_with_position_names = ARRAY[tb_institute_name, tb_company_name];

    _sql = NULL;

    _checktable = urbo_checktable_ifexists_arr(id_scope, tb_names, true);
    IF _checktable IS NULL OR NOT _checktable THEN

        _sql = format('
            DROP VIEW IF EXISTS %6$s;

            -- Institutes and companies are POIs, modelling them first

            CREATE TABLE IF NOT EXISTS %1$s (
                name text,
                description text,
                position public.geometry(Point,4326),
                address jsonb,
                category text[],
                "TimeInstant" timestamp without time zone,
                id_entity character varying(128) NOT NULL,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

            CREATE TABLE IF NOT EXISTS %2$s (
                name text,
                description text,
                position public.geometry(Point,4326),
                address jsonb,
                kpis jsonb,
                category text[],
                "TimeInstant" timestamp without time zone,
                id_entity character varying(128) NOT NULL,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

            -- Internships, Courses and IntershipInstances are custom types

            CREATE TABLE IF NOT EXISTS %3$s (
                name text,
                description text,
                remaining_places integer,
                total_places integer,
                from_date bigint,
                to_date bigint,
                "TimeInstant" timestamp without time zone,
                company_id character varying(128) NOT NULL,
                id_entity character varying(128) NOT NULL,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

            CREATE TABLE IF NOT EXISTS %4$s (
                name text,
                school_year character varying(10),
                miur_code character varying(6),
                from_date bigint,
                to_date bigint,
                "TimeInstant" timestamp without time zone,
                institute_id character varying(128) NOT NULL,
                id_entity character varying(128) NOT NULL,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

            CREATE TABLE IF NOT EXISTS %5$s (
                number_val integer,
                "TimeInstant" timestamp without time zone,
                company_id character varying(128) NOT NULL,
                course_id character varying(128) NOT NULL,
                institute_id character varying(128) NOT NULL,
                internship_id character varying(128) NOT NULL,
                id_entity character varying(128) NOT NULL,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

            CREATE TABLE IF NOT EXISTS %7$s (
                name text,
                description text,
                category text[],
                kpi_value integer,
                institute_id character varying(128) NOT NULL,
                product jsonb,
                "TimeInstant" timestamp without time zone,
                id_entity character varying(128) NOT NULL,
                created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
                updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
            );

        ', tb_institute_name, tb_company_name, tb_internship_name, tb_course_name,
           tb_internship_instance_name, tb_institute_internship_name, tb_kpi_name);

        IF iscarto THEN
            _sql = _sql || urbo_cartodbfy_tables_qry(cartouser, tb_names);
            _alter_view = '';
        ELSE
            _sql = _sql || urbo_pk_qry(tb_names);
            _sql = _sql || urbo_geom_idx_qry('position', tb_with_position_names);
            _sql = _sql || urbo_tbowner_qry(tb_names);
            _alter_view = format('
                ALTER VIEW %1$s OWNER TO urbo_admin;
            ', tb_institute_internship_name);
        END IF;

        _sql = _sql || urbo_time_idx_qry(tb_names);
        _sql = _sql || urbo_unique_lastdata_qry(tb_names);

        _sql_view = format('
            CREATE VIEW %5$s AS
                SELECT
                    ins.id_entity as institute_id,
                    ins.name as institute_name,
                    comp.name AS company_name,
                    inter.name AS internship_name,
                    inter.from_date AS internship_from_date,
                    inter.to_date AS internship_to_date,
                    inter.remaining_places AS remaining_places,
                    inter.total_places AS total_places,
                    ii.id_entity as id_entity
                FROM
                %1$s ins INNER JOIN %2$s ii ON ins.id_entity = ii.institute_id
                INNER JOIN %3$s inter ON inter.id_entity = ii.internship_id
                LEFT JOIN %4$s comp ON comp.id_entity = ii.company_id;
            %6$s
        ', tb_institute_name, tb_internship_instance_name, tb_internship_name, tb_company_name, tb_institute_internship_name, _alter_view);

        _sql = _sql || _sql_view;

        IF isdebug THEN
            RAISE NOTICE '%', _sql;
        END IF;

        EXECUTE _sql;

    END IF;

    RETURN _sql;

END;
$$ LANGUAGE plpgsql;
