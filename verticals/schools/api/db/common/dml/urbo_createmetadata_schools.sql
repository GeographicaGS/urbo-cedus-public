
DROP FUNCTION IF EXISTS urbo_createmetadata_schools(boolean);

CREATE OR REPLACE FUNCTION urbo_createmetadata_schools(
    isdebug boolean DEFAULT FALSE
  )
  RETURNS void AS
  $$
  DECLARE
    _tb_categories text;
    _tb_entities text;
    _tb_variables text;
    _dml_qry text;
  BEGIN

    _tb_categories = urbo_get_table_name('metadata', 'categories');
    _tb_entities = urbo_get_table_name('metadata', 'entities');
    _tb_variables = urbo_get_table_name('metadata', 'variables');

    _dml_qry = format('
      -- CATEGORIES
      INSERT INTO %1$s
        (id_category,   category_name,  nodata, config                                   )
      VALUES
        (''schools'',   ''Instituto'',  false,  ''{"carto": {"account": "cedus-admin"}}'')
      ;

      -- ENTITIES
      INSERT INTO metadata.entities
          (id_entity,                           entity_name,                  id_category,    table_name,                             mandatory,    editable)
      VALUES
          (''schools.institute'',               ''Instituto'',                ''schools'',    ''schools_institute'',                  false,        false   ),
          (''schools.internship'',              ''Práctica'',                 ''schools'',    ''schools_internship'',                 false,        false   ),
          (''schools.company'',                 ''Empresa'',                  ''schools'',    ''schools_company'',                    false,        false   ),
          (''schools.internship_instance'',     ''Instancia de práctica'',    ''schools'',    ''schools_internship_instance'',        false,        false   ),
          (''schools.course'',                  ''Curso'',                    ''schools'',    ''schools_course'',                     false,        false   ),
          (''schools.institute_internship'',    ''Prácticas e institutos'',   ''schools'',    ''schools_institute_internship'',       false,        false   ),
          (''schools.kpi'',                     ''KPI'',                      ''schools'',    ''schools_kpi'',                        false,        false   )
      ;

      -- VARIABLES
      INSERT INTO metadata.variables
          (id_variable,                                             id_entity,                                entity_field,                       var_name,                           var_units,    var_thresholds,   var_agg,                          var_reverse,    config,         table_name,                                   type,             mandatory,    editable)
      VALUES
          (''schools.internship.remaining_places'',                 ''schools.internship'',                   ''remaining_places'',               ''Plazas restantes'',               NULL,         NULL,             ''{"SUM", "MAX"}'',               false,          NULL,         ''schools_internship'',                       ''catalogue'',    true,         false   ),
          (''schools.internship.total_places'',                     ''schools.internship'',                   ''total_places'',                   ''Plazas totales'',                 NULL,         NULL,             ''{"SUM", "MAX"}'',               false,          NULL,         ''schools_internship'',                       ''catalogue'',    true,         false   ),
          (''schools.institute_internship.remaining_places'',       ''schools.institute_internship'',         ''remaining_places'',               ''Plazas restantes'',               NULL,         NULL,             ''{"SUM", "MAX"}'',               false,          NULL,         ''schools_institute_internship'',             ''catalogue'',    true,         false   ),
          (''schools.institute_internship.total_places'',           ''schools.institute_internship'',         ''total_places'',                   ''Plazas totales'',                 NULL,         NULL,             ''{"SUM", "MAX"}'',               false,          NULL,         ''schools_institute_internship'',             ''catalogue'',    true,         false   ),
          (''schools.institute_internship.company_name'',           ''schools.institute_internship'',         ''company_name'',                   ''Nombre de la empresa'',           NULL,         NULL,             ''{"COUNT"}'',                    false,          NULL,         ''schools_institute_internship'',             ''catalogue'',    true,         false   ),
          (''schools.institute_internship.institute_name'',         ''schools.institute_internship'',         ''institute_name'',                 ''Nombre del instituto'',           NULL,         NULL,             ''{"COUNT"}'',                    false,          NULL,         ''schools_institute_internship'',             ''catalogue'',    true,         false   ),
          (''schools.institute_internship.institute_id'',           ''schools.institute_internship'',         ''institute_id'',                   ''ID del instituto'',               NULL,         NULL,             ''{"COUNT"}'',                    false,          NULL,         ''schools_institute_internship'',             ''catalogue'',    true,         false   ),
          (''schools.institute_internship.internship_from_date'',   ''schools.institute_internship'',         ''internship_from_date'',           ''Fecha de inicio'',                NULL,         NULL,             ''{}'',                           false,          NULL,         ''schools_institute_internship'',             ''catalogue'',    true,         false   ),
          (''schools.institute_internship.internship_to_date'',     ''schools.institute_internship'',         ''internship_to_date'',             ''Fecha de fin'',                   NULL,         NULL,             ''{}'',                           false,          NULL,         ''schools_institute_internship'',             ''catalogue'',    true,         false   ),
          (''schools.institute_internship.internship_name'',        ''schools.institute_internship'',         ''internship_name'',                ''Nombre de la beca'',              NULL,         NULL,             ''{}'',                           false,          NULL,         ''schools_institute_internship'',             ''catalogue'',    true,         false   ),
          (''schools.institute.position'',                          ''schools.institute'',                    ''position'',                       ''Posición del instituto'',         NULL,         NULL,             ''{}'',                           false,          NULL,         ''schools_institute'',                        ''catalogue'',    true,         false   ),
          (''schools.company.kpis'',                                ''schools.company'',                      ''kpis'',                           ''KPIs de la empresa'',             NULL,         NULL,             ''{}'',                           false,          NULL,         ''schools_company'',                          ''catalogue'',    true,         false   ),
          (''schools.company.position'',                            ''schools.company'',                      ''position'',                       ''Posición de la empresa'',         NULL,         NULL,             ''{}'',                           false,          NULL,         ''schools_company'',                          ''catalogue'',    true,         false   ),
          (''schools.course.name'',                                 ''schools.course'',                       ''name'',                           ''Nombre del curso'',               NULL,         NULL,             ''{"COUNT"}'',                    false,          NULL,         ''schools_course'',                           ''catalogue'',    true,         false   ),
          (''schools.course.from_date'',                            ''schools.course'',                       ''from_date'',                      ''Nombre de inicio del curso'',     NULL,         NULL,             ''{}'',                           false,          NULL,         ''schools_course'',                           ''catalogue'',    true,         false   ),
          (''schools.course.to_date'',                              ''schools.course'',                       ''to_date'',                        ''Nombre de fin del curso'',        NULL,         NULL,             ''{}'',                           false,          NULL,         ''schools_course'',                           ''catalogue'',    true,         false   ),
          (''schools.course.institute_id'',                         ''schools.course'',                       ''institute_id'',                   ''ID del instituto del curso'',     NULL,         NULL,             ''{}'',                           false,          NULL,         ''schools_course'',                           ''catalogue'',    true,         false   ),
          (''schools.kpi.name'',                                    ''schools.kpi'',                          ''name'',                           ''Nombre del KPI'',                 NULL,         NULL,             ''{}'',                           false,          NULL,         NULL,                                         ''catalogue'',    true,         false   ),
          (''schools.kpi.description'',                             ''schools.kpi'',                          ''description'',                    ''Descripción del KPI'',            NULL,         NULL,             ''{}'',                           false,          NULL,         NULL,                                         ''catalogue'',    true,         false   ),
          (''schools.kpi.category'',                                ''schools.kpi'',                          ''category'',                       ''Tipo de KPI'',                    NULL,         NULL,             ''{}'',                           false,          NULL,         NULL,                                         ''catalogue'',    true,         false   ), 
          (''schools.kpi.kpi_value'',                               ''schools.kpi'',                          ''kpi_value'',                      ''Valor del KPI'',                  NULL,         NULL,             ''{}'',                           false,          NULL,         NULL,                                         ''catalogue'',    true,         false   ),                             
          (''schools.kpi.product'',                                 ''schools.kpi'',                          ''product'',                        ''Producto'',                       NULL,         NULL,             ''{}'',                           false,          NULL,         NULL,                                         ''catalogue'',    true,         false   )                             
      ;
      ',
      _tb_categories, _tb_entities, _tb_variables
    );

    IF isdebug IS TRUE then
      RAISE NOTICE '%', _dml_qry;
    END IF;

    EXECUTE _dml_qry;

  EXCEPTION WHEN unique_violation THEN

    RAISE WARNING 'METADATA FOR schools CATEGORY ALREADY EXISTS';

  END;
  $$ LANGUAGE plpgsql;
