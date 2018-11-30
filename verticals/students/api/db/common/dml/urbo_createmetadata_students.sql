
DROP FUNCTION IF EXISTS urbo_createmetadata_students(boolean);

CREATE OR REPLACE FUNCTION urbo_createmetadata_students(
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
        (id_category,  category_name,           nodata, config)
      VALUES
        (''students'', ''Turismo estudiantes'', false,  ''{"carto": {"account": "cedus-admin"}}'')
      ;

      -- ENTITIES
      INSERT INTO metadata.entities
          (id_entity                     ,entity_name             ,id_category    ,table_name                     ,mandatory  ,editable)
      VALUES
          (''students.pointofinterest''  ,''Turismo estudiantes'' ,''students''   ,''students_pointofinterest''   ,false      ,false)
      ;

      -- VARIABLES
      INSERT INTO metadata.variables
          (id_variable                                        ,id_entity                            ,entity_field               ,var_name                         ,var_units     ,var_thresholds     ,var_agg             ,var_reverse        ,table_name                                   ,type                 ,mandatory    ,editable   )
      VALUES
          (''students.pointofinterest.name''                  ,''students.pointofinterest''         ,''name''                   ,''Nombre''                       ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.description''           ,''students.pointofinterest''         ,''description''            ,''Descripción''                  ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.address''               ,''students.pointofinterest''         ,''address''                ,''Dirección''                    ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.category''              ,''students.pointofinterest''         ,''category''               ,''Categoría''                    ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.refseealso''            ,''students.pointofinterest''         ,''refseealso''             ,''Ver también''                  ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.position''              ,''students.pointofinterest''         ,''position''               ,''Posición''                     ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.abstract''              ,''students.pointofinterest''         ,''abstract''               ,''Resumen''                      ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.tags''                  ,''students.pointofinterest''         ,''tags''                   ,''Posición''                     ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.typology''              ,''students.pointofinterest''         ,''typology''               ,''Tipología''                    ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.scopes''                ,''students.pointofinterest''         ,''scopes''                 ,''Ámbitos''                      ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.contacts''              ,''students.pointofinterest''         ,''contacts''               ,''Contactos''                    ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.price_infos''           ,''students.pointofinterest''         ,''price_infos''            ,''Información de precios''       ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.organizer''             ,''students.pointofinterest''         ,''organizer''              ,''Organizador''                  ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.available_services''    ,''students.pointofinterest''         ,''available_services''     ,''Servicios disponibles''        ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.capacities''            ,''students.pointofinterest''         ,''capacities''             ,''Capacidades''                  ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.owner''                 ,''students.pointofinterest''         ,''owner''                  ,''Titular''                      ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.media_resources''       ,''students.pointofinterest''         ,''media_resources''        ,''Posición''                     ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.opening_time''          ,''students.pointofinterest''         ,''opening_time''           ,''Horario''                      ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      ),
          (''students.pointofinterest.order_by''              ,''students.pointofinterest''         ,''order_by''               ,''Ordenado por''                 ,NULL          ,NULL               ,''{"NOAGG"}''       ,false              ,''students_pointofinterest_lastdata''        ,''catalogue''        ,true         ,false      )
      ;
      ',
      _tb_categories, _tb_entities, _tb_variables
    );

    IF isdebug IS TRUE then
      RAISE NOTICE '%', _dml_qry;
    END IF;

    EXECUTE _dml_qry;

  EXCEPTION WHEN unique_violation THEN

    RAISE WARNING 'METADATA FOR students.pointofinterest CATEGORY ALREADY EXISTS';

  END;
  $$ LANGUAGE plpgsql;
