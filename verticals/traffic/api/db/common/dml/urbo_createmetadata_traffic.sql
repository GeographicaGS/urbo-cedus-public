-- N.B. after create vertical extend the category config to show the bikes lines at category_scopes category config! Example Nantes:
-- {"carto":{"account":"cedus-admin"},"maps":{"bikes_now":[{"sql":"SELECT * FROM nantes_transport_bike_paths","cartocss":"#layer {line-width: 2; line-color: ramp([type], (#ffa509, #00a0ff, #00b900, #818181,#ffa509, #00a0ff, #00b900, #818181,#ffa509, #00a0ff, #00b900), ('Autre','Voie bus','Bande cyclable','Zone de rencontre','piste cyclable','Chaucidou','Piste cyclable','Zone 30','Voie verte','Mixte pieton','Liaison cyclable'), '=') }","interactivity":[{"field":"name","header":"Bike path"},{"field":"type","title":"Safe path type"},{"field":"sens","title":"Direction"}]}]}}

DROP FUNCTION IF EXISTS urbo_createmetadata_traffic(boolean);

CREATE OR REPLACE FUNCTION urbo_createmetadata_traffic(
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
        (id_category, category_name, nodata, config)
      VALUES
        (''traffic'', ''Tráfico'', false, ''{"carto": {"account": "urbo-cedus"}}'')
      ;

      -- ENTITIES
      INSERT INTO metadata.entities
          (id_entity                          , entity_name                                 , id_category , table_name                            , mandatory, editable)
      VALUES
          (''traffic.trafficflowobserved''    , ''Tráfico''                                 , ''traffic'' , ''traffic_trafficflowobserved''       , false    , true   ),
          (''traffic.bikehiredockingstation'' , ''Estación de alquiler de bicicletas''      , ''traffic'' , ''traffic_bikehiredockingstation''    , false    , true   ),
          (''traffic.incidence''              , ''Incidencia''                              , ''traffic'' , ''traffic_incidence''                 , false    , true   )
      ;

      -- VARIABLES
      INSERT INTO metadata.variables
          (id_variable                                                ,id_entity                            ,entity_field                   ,var_name                                         ,var_units      ,var_thresholds   ,var_agg                , var_reverse,table_name                                  , type          ,mandatory  ,editable)
      VALUES
          -- TRAFIC FLOW OBSERVED
          (''traffic.trafficflowobserved.intensity''                  ,''traffic.trafficflowobserved''      ,''intensity''                  ,''Intensidad del tráfico''                       ,''veh/h''      ,NULL             ,''{MIN,AVG,MAX,COUNT}'', false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),
          (''traffic.trafficflowobserved.intensity_sat''              ,''traffic.trafficflowobserved''      ,''intensity_sat''              ,''Intensidad de saturación''                     ,''veh/h''      ,NULL             ,''{MIN,AVG,MAX,COUNT}'', false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),
          (''traffic.trafficflowobserved.intensity_ratio''            ,''traffic.trafficflowobserved''      ,''intensity_ratio''            ,''Intensidad del tráfico''                       ,''%%''         ,NULL             ,''{MIN,AVG,MAX,COUNT}'', false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),
          (''traffic.trafficflowobserved.service_level''              ,''traffic.trafficflowobserved''      ,''service_level''              ,''Nivel de servicio''                            ,NULL           ,NULL             ,''{MIN,AVG,MAX,COUNT}'', false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),
          (''traffic.trafficflowobserved.service_level_ratio''        ,''traffic.trafficflowobserved''      ,''service_level_ratio''        ,''Nivel de servicio''                            ,NULL           ,NULL             ,''{MIN,AVG,MAX,COUNT}'', false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),
          (''traffic.trafficflowobserved.intensity_relative_ratio''   ,''traffic.trafficflowobserved''      ,''intensity_relative_ratio''   ,''Ratio de intensidad del tráfico relativo''     ,NULL           ,NULL             ,''{MIN,AVG,MAX}''      , false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),
          (''traffic.trafficflowobserved.congested''                  ,''traffic.trafficflowobserved''      ,''congested''                  ,''Congestión''                                   ,NULL           ,NULL             ,''{COUNT}''            , false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),
          (''traffic.trafficflowobserved.description''                ,''traffic.trafficflowobserved''      ,''description''                ,''Descripción''                                  ,NULL           ,NULL             ,NULL                   , false      ,NULL                                        , ''catalog''   ,true       , false  ),
          (''traffic.trafficflowobserved.load''                       ,''traffic.trafficflowobserved''      ,''load''                       ,''Carga''                                        ,NULL           ,NULL             ,''{MIN,AVG,MAX,COUNT}'', false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),
          (''traffic.trafficflowobserved.load_relative_ratio''        ,''traffic.trafficflowobserved''      ,''load_relative_ratio''        ,''Ratio de carga relativo''                      ,NULL           ,NULL             ,''{MIN,AVG,MAX}''      , false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),
          (''traffic.trafficflowobserved.occupancy''                  ,''traffic.trafficflowobserved''      ,''occupancy''                  ,''Ocupancia''                                    ,NULL           ,NULL             ,''{MIN,AVG,MAX,COUNT}'', false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),
          (''traffic.trafficflowobserved.occupancy_relative_ratio''   ,''traffic.trafficflowobserved''      ,''occupancy_relative_ratio''   ,''Ratio de ocupancia relativo''                  ,NULL           ,NULL             ,''{MIN,AVG,MAX}''      , false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),
          (''traffic.trafficflowobserved.error''                      ,''traffic.trafficflowobserved''      ,''error''                      ,''Error producido en la vía''                    ,NULL           ,NULL             ,''{NOAGG}''            , false      ,''traffic_trafficflowobserved_measurand''   , ''variable''  ,true       , false  ),

          -- BIKES
          (''traffic.bikehiredockingstation.availablebikenumber''     ,''traffic.bikehiredockingstation''   ,''availablebikenumber''        ,''Bicicletas disponibles''                       ,''''           ,''{}''           ,''{MIN,AVG,MAX,SUM}''  , false      ,''traffic_bikehiredockingstation_measurand'', ''variable''  ,false      , false  ),
          (''traffic.bikehiredockingstation.freeslotnumber''          ,''traffic.bikehiredockingstation''   ,''freeslotnumber''             ,''Bornetas disponibles''                         ,''''           ,''{}''           ,''{MIN,AVG,MAX,SUM}''  , false      ,''traffic_bikehiredockingstation_measurand'', ''variable''  ,false      , false  ),
          (''traffic.bikehiredockingstation.status''                  ,''traffic.bikehiredockingstation''   ,''status''                     ,''Estado''                                       ,''''           ,''{}''           ,''{}''                 , false      ,''traffic_bikehiredockingstation_measurand'', ''variable''  ,false      , false  ),
          (''traffic.bikehiredockingstation.totalslotnumber''         ,''traffic.bikehiredockingstation''   ,''totalslotnumber''            ,''Bornetas totales''                             ,''''           ,''{}''           ,''{MIN,AVG,MAX,SUM}''  , false      ,''traffic_bikehiredockingstation_measurand'', ''variable''  ,false      , false  ),

          -- INCIDENCE
          (''traffic.incidence.name''                                 ,''traffic.incidence''                ,''name''                       ,''Nombre de la incidencia''                      ,NULL           ,NULL             ,NULL                   , false      ,''traffic_incidence_lastdata''              , ''catalog''  ,true        , false  ),
          (''traffic.incidence.description''                          ,''traffic.incidence''                ,''description''                ,''Descripción de la incidencia''                 ,NULL           ,NULL             ,NULL                   , false      ,''traffic_incidence_lastdata''              , ''catalog''  ,true        , false  ),
          (''traffic.incidence.kind''                                 ,''traffic.incidence''                ,''kind''                       ,''Tipo de incidencia''                           ,NULL           ,NULL             ,NULL                   , false      ,''traffic_incidence_lastdata''              , ''catalog''  ,true        , false  ),
          (''traffic.incidence.start_date''                           ,''traffic.incidence''                ,''start_date''                 ,''Intensidad del tráfico''                       ,NULL           ,NULL             ,NULL                   , false      ,''traffic_incidence_lastdata''              , ''catalog''  ,true        , false  ),
          (''traffic.incidence.end_date''                             ,''traffic.incidence''                ,''end_date''                   ,''Intensidad del tráfico''                       ,NULL           ,NULL             ,NULL                   , false      ,''traffic_incidence_lastdata''              , ''catalog''  ,true        , false  )
      ;
      ',
      _tb_categories, _tb_entities, _tb_variables
    );

    IF isdebug IS TRUE then
      RAISE NOTICE '%', _dml_qry;
    END IF;

    EXECUTE _dml_qry;

  EXCEPTION WHEN unique_violation THEN

    RAISE WARNING 'METADATA FOR traffic CATEGORY ALREADY EXISTS';

  END;
  $$ LANGUAGE plpgsql;
